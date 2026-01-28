/* eslint-disable import/no-unresolved */
/* eslint-disable no-param-reassign */
import PropTypes from 'prop-types';
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { connectToStores } from 'fluxible-addons-react';
import { matchShape, routerShape } from 'found';
import { DateTime } from 'luxon';
import cx from 'classnames';
import { routeShape, patternShape } from '../../../util/shapes';
import ScheduleHeader from './ScheduleHeader';
import ScheduleDayTabs from './ScheduleDayTabs';
import ScheduleTripList from './ScheduleTripList';
import ScheduleConstantOperation from './ScheduleConstantOperation';
import SecondaryButton from '../../SecondaryButton';
import Loading from '../../Loading';
import { DATE_FORMAT } from '../../../constants';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import withBreakpoint from '../../../util/withBreakpoint';
import ScheduleDropdown from './ScheduleDropdown';
import RouteControlPanel from '../RouteControlPanel';
import { routePagePath, PREFIX_TIMETABLE } from '../../../util/path';
import ScrollableWrapper from '../../ScrollableWrapper';
import getTestData from './ScheduleDebugData';
import { useConfigContext } from '../../../configurations/ConfigContext';
import { useTranslationsContext } from '../../../util/useTranslationsContext';
import {
  getMostFrequent,
  modifyDepartures,
  isEmptyWeek,
  getFirstDepartureDate,
  populateData,
  DATA_INDEX,
  RANGE_INDEX,
} from '../../../util/scheduleDataUtils';

const openRoutePDF = (e, routePDFUrl) => {
  e.stopPropagation();
  window.open(routePDFUrl.href);
};

const printRouteTimetable = e => {
  e.stopPropagation();
  window.print();
};

const sortTrips = trips => {
  if (!trips) {
    return null;
  }

  return [...trips].sort((a, b) => {
    const aHasStoptimes = Array.isArray(a.stoptimes) && a.stoptimes.length > 0;
    const bHasStoptimes = Array.isArray(b.stoptimes) && b.stoptimes.length > 0;

    if (!bHasStoptimes) {
      return -1;
    }
    if (!aHasStoptimes) {
      return 1;
    }

    return (
      a.stoptimes[0].scheduledDeparture - b.stoptimes[0].scheduledDeparture
    );
  });
};

const ScheduleContainer = ({
  firstDepartures: firstDeparturesProp,
  pattern,
  match,
  breakpoint,
  router,
  route,
  lang = 'en',
}) => {
  const intl = useTranslationsContext();
  const config = useConfigContext();

  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(Math.max((pattern?.stops?.length || 1) - 1, 0));
  const [hasLoaded, setHasLoaded] = useState(false);
  const [focusedTab, setFocusedTab] = useState(null);

  const tabRefs = useRef({});
  const hasMergedDataRef = useRef(false);

  useEffect(() => {
    const date = match.location.query.serviceDay
      ? DateTime.fromFormat(match.location.query.serviceDay, DATE_FORMAT)
      : DateTime.now();
    // Don't allow past dates (before current week) because we might have no data from them
    if (date && date.startOf('week') < DateTime.now().startOf('week')) {
      match.router.replace(decodeURIComponent(match.location.pathname));
    }
  }, [match]);

  useEffect(() => {
    if (pattern?.code) {
      setFrom(0);
      setTo(pattern.stops.length - 1);
    }
  }, [pattern?.code, pattern?.stops?.length]);

  const onFromSelectChange = useCallback(selectFrom => {
    const fromValue = Number(selectFrom);
    setFrom(fromValue);
    setTo(prevTo => (prevTo > fromValue ? prevTo : fromValue + 1));
    addAnalyticsEvent({
      category: 'Route',
      action: 'ChangeTimetableStartPoint',
      name: null,
    });
  }, []);

  const onToSelectChange = useCallback(selectTo => {
    setTo(Number(selectTo));
    addAnalyticsEvent({
      category: 'Route',
      action: 'ChangeTimetableEndPoint',
      name: null,
    });
  }, []);

  /**
   * Get and process trips for display
   * @returns {Array|string|JSX} trips array, redirect path, or loading/error JSX
   */
  const getTrips = useCallback(
    (
      patternIn,
      fromIdx,
      toIdx,
      newServiceDay,
      wantedDay,
      testing,
      testNum,
      testNoDataDay,
    ) => {
      let currentPattern = patternIn;
      let queryParams = newServiceDay
        ? `?serviceDay=${newServiceDay.toFormat(DATE_FORMAT)}`
        : '';

      if (testing && testNum && currentPattern) {
        currentPattern = {
          ...currentPattern,
          trips: currentPattern.trips?.filter((s, i) => i < 2),
        };
        if (
          wantedDay?.isValid &&
          DateTime.fromFormat(testNoDataDay, DATE_FORMAT).isValid &&
          wantedDay.toFormat(DATE_FORMAT) === testNoDataDay
        ) {
          currentPattern = {
            ...currentPattern,
            trips: [],
          };
        }
        queryParams = queryParams.concat(`&test=${testNum}`);
      }

      const trips = sortTrips(currentPattern.trips);

      if (trips.length === 0 && newServiceDay) {
        return routePagePath(
          match.params.routeId,
          PREFIX_TIMETABLE,
          currentPattern.code,
          null,
          queryParams,
        );
      }

      if (trips !== null && !hasLoaded) {
        setHasLoaded(true);
        return (
          <div
            className={cx('summary-list-spinner-container', 'route-schedule')}
          >
            <Loading />
          </div>
        );
      }

      if (trips.length === 0) {
        const day = match.location.query?.serviceDay
          ? DateTime.fromFormat(
              match.location.query.serviceDay,
              DATE_FORMAT,
            ).toFormat('d.L.yyyy')
          : '';
        return (
          <div className="text-center">
            {intl.formatMessage(
              {
                id: 'no-trips-found',
                defaultMessage: `No journeys found for the selected date ${day}`,
              },
              {
                selectedDate: day,
              },
            )}
          </div>
        );
      }

      return trips;
    },
    [hasLoaded, intl, match],
  );

  /**
   *
   * @param {string} newServiceDay new date in 'YYYYMMDD'
   */
  const changeDate = useCallback(
    newServiceDay => {
      const { location } = match;
      addAnalyticsEvent({
        category: 'Route',
        action: 'ChangeTimetableDay',
        name: null,
      });
      const newPath = {
        ...location,
        query: {
          ...location.query,
          serviceDay: newServiceDay,
        },
      };
      router.replace(newPath);
    },
    [match, router],
  );

  const redirectWithServiceDay = useCallback(
    serviceDay => {
      const { location } = match;
      const newPath = {
        ...location,
        query: {
          ...location.query,
          serviceDay: serviceDay.toFormat(DATE_FORMAT),
        },
      };
      match.router.replace(newPath);
    },
    [match],
  );

  // Check if route is constant operation first to avoid redundant calculation
  const routeId = route?.gtfsId;
  const { constantOperationRoutes } = config;
  const { locale } = intl;

  // Memoize constant operation check
  const constantOperationInfo = useMemo(() => {
    if (routeId && constantOperationRoutes?.[routeId]) {
      return constantOperationRoutes[routeId][locale];
    }
    return null;
  }, [routeId, constantOperationRoutes, locale]);

  if (constantOperationInfo) {
    return (
      <ScheduleConstantOperation
        constantOperationInfo={constantOperationInfo}
        match={match}
        route={route}
        breakpoint={breakpoint}
      />
    );
  }

  const { query } = match.location;
  hasMergedDataRef.current = false;
  let dataExistsDay = 1; // 1 = monday
  // USE FOR TESTING PURPOSE
  const testing = process.env.ROUTEPAGETESTING || false;
  const testNum = testing && query && query.test;
  const testNoDataDay = ''; // set to next week's Thursday

  if (!pattern) {
    if (routeId) {
      // Redirect back to routes default pattern
      router.replace(routePagePath(routeId, PREFIX_TIMETABLE));
    }
    return null;
  }

  const newFromTo = [from, to];

  const currentPattern =
    route?.patterns?.filter(p => p.code === pattern.code) || [];

  let dataToHandle;

  if (testing && testNum) {
    dataToHandle = getTestData(testNum);
  } else {
    dataToHandle = firstDeparturesProp;
  }
  const firstDepartures = modifyDepartures(dataToHandle);
  const firstWeekEmpty = isEmptyWeek(firstDepartures[0]);
  // If we are missing data from the start of the week, see if we can merge it with next week
  if (
    !firstWeekEmpty &&
    firstDepartures[0]?.length > 0 &&
    dataToHandle.wk1mon?.length === 0
  ) {
    const [thisWeekData, normalWeekData] =
      Number(testNum) === 0
        ? firstDepartures
        : [firstDepartures[0], getMostFrequent(firstDepartures)];

    // Extract hashes using map instead of for loops
    const thisWeekHashes = thisWeekData.map(data => data[1]);
    const nextWeekHashes = normalWeekData.map(data => data[1]);

    // If this week's data is a subset of normal week's data, merge them
    if (thisWeekHashes.every(hash => nextWeekHashes.includes(hash))) {
      firstDepartures[0] = normalWeekData;
      hasMergedDataRef.current = true;
    }
  }

  // Find first day with data when data is merged
  if (hasMergedDataRef.current) {
    const daysMap = [
      { key: 'wk1tue', day: 2 },
      { key: 'wk1wed', day: 3 },
      { key: 'wk1thu', day: 4 },
      { key: 'wk1fri', day: 5 },
      { key: 'wk1sat', day: 6 },
      { key: 'wk1sun', day: 7 },
    ];

    const firstDayWithData = daysMap.find(
      ({ key }) => dataToHandle[key]?.length > 0,
    );
    if (firstDayWithData) {
      dataExistsDay = firstDayWithData.day;
    }
  }

  const wantedDay =
    query && query.serviceDay
      ? DateTime.fromFormat(query.serviceDay, DATE_FORMAT)
      : undefined;

  const firstDataDate = DateTime.now()
    .startOf('week')
    .plus({ days: dataExistsDay - 1 });

  // check if first week is empty and redirect if is
  const nextMonday = DateTime.now().startOf('week').plus({ weeks: 1 });

  const firstDepartureDate = getFirstDepartureDate(
    firstDepartures[0],
    wantedDay,
  );
  const isBeforeNextWeek = wantedDay ? wantedDay < nextMonday : false;
  const isSameOrAfterNextWeek = wantedDay ? wantedDay >= nextMonday : false;

  // Checking is wanted day is before first available day when data is found
  const isBeforeFirstDataDate = wantedDay ? wantedDay < firstDataDate : false;

  if ((!testNum || testNum !== 0) && isBeforeFirstDataDate) {
    redirectWithServiceDay(firstDataDate);
  } else if ((isBeforeNextWeek && firstWeekEmpty) || firstDepartureDate) {
    if (wantedDay && !isSameOrAfterNextWeek) {
      if (
        firstDepartureDate &&
        !DateTime.now().hasSame(firstDepartureDate, 'day')
      ) {
        redirectWithServiceDay(firstDepartureDate);
      } else if (
        !firstDepartureDate ||
        !DateTime.now().hasSame(firstDepartureDate, 'week')
      ) {
        redirectWithServiceDay(nextMonday);
      }
    }
  }

  const data = useMemo(
    () =>
      populateData(
        wantedDay,
        firstDepartures,
        hasMergedDataRef.current,
        dataExistsDay,
      ),
    [wantedDay, firstDepartures, dataExistsDay],
  );
  const newServiceDay = useMemo(() => {
    if (wantedDay || !data || data.length < 3) {
      return undefined;
    }

    const range = data[DATA_INDEX.RANGE];
    const dayArray = range?.[RANGE_INDEX.DAY_ARRAY];
    const currentWeekday = range?.[RANGE_INDEX.WEEKDAY];
    const wantedDayValue = range?.[RANGE_INDEX.WANTED_DAY];
    const options = data[DATA_INDEX.OPTIONS];
    const weekStarts = data[DATA_INDEX.WEEK_STARTS];

    let serviceDay;

    if (dayArray && dayArray !== '') {
      if (currentWeekday !== dayArray[0]?.charAt(0)) {
        serviceDay = DateTime.now()
          .startOf('week')
          .plus({ days: Number(dayArray[0]?.charAt(0)) - 1 });
      }
    } else if (
      options?.[0] &&
      wantedDayValue &&
      wantedDayValue < weekStarts?.[0]
    ) {
      serviceDay = DateTime.fromFormat(options[0].value, DATE_FORMAT);
    }

    if (serviceDay && serviceDay > firstDataDate) {
      return firstDataDate;
    }

    return serviceDay;
  }, [wantedDay, data, firstDataDate]);

  const routeIdSplitted = useMemo(() => routeId?.split(':'), [routeId]);
  const routeTimetableHandler = routeIdSplitted
    ? config.timetables && config.timetables[routeIdSplitted[0]]
    : undefined;

  const timetableDay = wantedDay || newServiceDay;
  const routeTimetableUrl =
    routeTimetableHandler &&
    timetableDay &&
    config.URL.ROUTE_TIMETABLES[routeIdSplitted[0]] &&
    routeTimetableHandler.routeTimetableUrlResolver(
      config.URL.ROUTE_TIMETABLES[routeIdSplitted[0]],
      route,
      timetableDay.toFormat(DATE_FORMAT),
      lang,
    );

  const showTrips = getTrips(
    currentPattern[0],
    newFromTo[0],
    newFromTo[1],
    newServiceDay,
    wantedDay,
    testing,
    testNum,
    testNoDataDay,
  );

  if (showTrips && typeof showTrips === 'string') {
    match.router.replace(showTrips);
    return null;
  }

  // If showTrips is JSX (loading or error), return it
  if (showTrips && !Array.isArray(showTrips)) {
    return showTrips;
  }

  if (!hasLoaded) {
    return (
      <div className={cx('summary-list-spinner-container', 'route-schedule')}>
        <Loading />
      </div>
    );
  }

  return (
    <>
      <ScrollableWrapper
        className={`route-schedule-container ${
          breakpoint !== 'large' ? 'mobile' : ''
        }`}
      >
        {route && route.patterns && (
          <RouteControlPanel
            match={match}
            route={route}
            breakpoint={breakpoint}
            noInitialServiceDay
          />
        )}
        <div className="route-schedule-ranges">
          <span className="current-range">
            {data[DATA_INDEX.RANGE][RANGE_INDEX.TIME_RANGE]}
          </span>
          <div className="other-ranges-dropdown">
            {data[DATA_INDEX.OPTIONS].length > 0 && (
              <ScheduleDropdown
                id="other-dates"
                title={intl.formatMessage({
                  id: 'other-dates',
                })}
                list={data[DATA_INDEX.OPTIONS]}
                alignRight
                changeTitleOnChange={false}
                onSelectChange={changeDate}
              />
            )}
          </div>
        </div>
        <ScheduleDayTabs
          data={data}
          focusedTab={focusedTab}
          tabRefs={tabRefs}
          onTabClick={changeDate}
          onTabFocus={setFocusedTab}
          locale={locale}
        />
        {pattern && (
          <div
            className={cx('route-schedule-list-wrapper', {
              'bp-large': breakpoint === 'large',
            })}
            aria-live="polite"
          >
            <ScheduleHeader
              stops={pattern.stops}
              from={newFromTo[0]}
              to={newFromTo[1]}
              onFromSelectChange={onFromSelectChange}
              onToSelectChange={onToSelectChange}
            />
            <div
              className="route-schedule-list momentum-scroll"
              role="list"
              aria-live="off"
            >
              {Array.isArray(showTrips) && (
                <ScheduleTripList
                  trips={showTrips}
                  fromIdx={newFromTo[0]}
                  toIdx={newFromTo[1]}
                />
              )}
            </div>
          </div>
        )}
      </ScrollableWrapper>
      {breakpoint === 'large' && <div className="after-scrollable-area" />}
      <div className="route-page-action-bar">
        <div className="print-button-container">
          {routeTimetableUrl && (
            <SecondaryButton
              ariaLabel="print-timetable"
              buttonName="print-timetable"
              buttonClickAction={e => {
                openRoutePDF(e, routeTimetableUrl);
                addAnalyticsEvent({
                  category: 'Route',
                  action: 'PrintWeeklyTimetable',
                  name: null,
                });
              }}
              buttonIcon="icon_print"
              smallSize
            />
          )}
          <SecondaryButton
            ariaLabel="print"
            buttonName="print"
            buttonClickAction={e => {
              printRouteTimetable(e);
              addAnalyticsEvent({
                category: 'Route',
                action: 'PrintTimetable',
                name: null,
              });
            }}
            buttonIcon="icon_print"
            smallSize
          />
        </div>
      </div>
    </>
  );
};

ScheduleContainer.propTypes = {
  // eslint-disable-next-line
  firstDepartures: PropTypes.object.isRequired,
  pattern: patternShape.isRequired,
  match: matchShape.isRequired,
  breakpoint: PropTypes.string.isRequired,
  router: routerShape.isRequired,
  route: routeShape.isRequired,
  lang: PropTypes.string.isRequired,
};

const containerComponent = createFragmentContainer(
  connectToStores(
    withBreakpoint(ScheduleContainer),
    ['PreferencesStore'],
    context => ({
      lang: context.getStore('PreferencesStore').getLanguage(),
    }),
  ),
  {
    pattern: graphql`
      fragment ScheduleContainer_pattern on Pattern {
        id
        code
        stops {
          id
          name
        }
      }
    `,
    route: graphql`
      fragment ScheduleContainer_route on Route
      @argumentDefinitions(
        date: { type: "String" }
        serviceDate: { type: "String" }
      ) {
        gtfsId
        color
        shortName
        longName
        mode
        type
        ...RouteAgencyInfo_route
        ...RoutePatternSelectContainer_route @arguments(date: $date)
        agency {
          name
          phone
        }
        patterns {
          alerts(types: [ROUTE, STOPS_ON_PATTERN]) {
            id
            alertSeverityLevel
            effectiveEndDate
            effectiveStartDate
          }
          headsign
          code
          stops {
            name
          }
          trips: tripsForDate(serviceDate: $serviceDate) {
            stoptimes: stoptimesForDate(serviceDate: $serviceDate) {
              stop {
                id
              }
              realtimeState
              scheduledArrival
              scheduledDeparture
              serviceDay
            }
          }
          activeDates: trips {
            serviceId
            day: activeDates
          }
        }
      }
    `,
    firstDepartures: graphql`
      fragment ScheduleContainer_firstDepartures on Pattern
      @argumentDefinitions(
        showTenWeeks: { type: "Boolean!", defaultValue: false }
        wk1day1: { type: "String!", defaultValue: "19700101" }
        wk1day2: { type: "String!", defaultValue: "19700101" }
        wk1day3: { type: "String!", defaultValue: "19700101" }
        wk1day4: { type: "String!", defaultValue: "19700101" }
        wk1day5: { type: "String!", defaultValue: "19700101" }
        wk1day6: { type: "String!", defaultValue: "19700101" }
        wk1day7: { type: "String!", defaultValue: "19700101" }
        wk2day1: { type: "String!", defaultValue: "19700101" }
        wk2day2: { type: "String!", defaultValue: "19700101" }
        wk2day3: { type: "String!", defaultValue: "19700101" }
        wk2day4: { type: "String!", defaultValue: "19700101" }
        wk2day5: { type: "String!", defaultValue: "19700101" }
        wk2day6: { type: "String!", defaultValue: "19700101" }
        wk2day7: { type: "String!", defaultValue: "19700101" }
        wk3day1: { type: "String!", defaultValue: "19700101" }
        wk3day2: { type: "String!", defaultValue: "19700101" }
        wk3day3: { type: "String!", defaultValue: "19700101" }
        wk3day4: { type: "String!", defaultValue: "19700101" }
        wk3day5: { type: "String!", defaultValue: "19700101" }
        wk3day6: { type: "String!", defaultValue: "19700101" }
        wk3day7: { type: "String!", defaultValue: "19700101" }
        wk4day1: { type: "String!", defaultValue: "19700101" }
        wk4day2: { type: "String!", defaultValue: "19700101" }
        wk4day3: { type: "String!", defaultValue: "19700101" }
        wk4day4: { type: "String!", defaultValue: "19700101" }
        wk4day5: { type: "String!", defaultValue: "19700101" }
        wk4day6: { type: "String!", defaultValue: "19700101" }
        wk4day7: { type: "String!", defaultValue: "19700101" }
        wk5day1: { type: "String!", defaultValue: "19700101" }
        wk5day2: { type: "String!", defaultValue: "19700101" }
        wk5day3: { type: "String!", defaultValue: "19700101" }
        wk5day4: { type: "String!", defaultValue: "19700101" }
        wk5day5: { type: "String!", defaultValue: "19700101" }
        wk5day6: { type: "String!", defaultValue: "19700101" }
        wk5day7: { type: "String!", defaultValue: "19700101" }
        wk6day1: { type: "String" }
        wk6day2: { type: "String" }
        wk6day3: { type: "String" }
        wk6day4: { type: "String" }
        wk6day5: { type: "String" }
        wk6day6: { type: "String" }
        wk6day7: { type: "String" }
        wk7day1: { type: "String" }
        wk7day2: { type: "String" }
        wk7day3: { type: "String" }
        wk7day4: { type: "String" }
        wk7day5: { type: "String" }
        wk7day6: { type: "String" }
        wk7day7: { type: "String" }
        wk8day1: { type: "String" }
        wk8day2: { type: "String" }
        wk8day3: { type: "String" }
        wk8day4: { type: "String" }
        wk8day5: { type: "String" }
        wk8day6: { type: "String" }
        wk8day7: { type: "String" }
        wk9day1: { type: "String" }
        wk9day2: { type: "String" }
        wk9day3: { type: "String" }
        wk9day4: { type: "String" }
        wk9day5: { type: "String" }
        wk9day6: { type: "String" }
        wk9day7: { type: "String" }
        wk10day1: { type: "String" }
        wk10day2: { type: "String" }
        wk10day3: { type: "String" }
        wk10day4: { type: "String" }
        wk10day5: { type: "String" }
        wk10day6: { type: "String" }
        wk10day7: { type: "String" }
      ) {
        wk1mon: tripsForDate(serviceDate: $wk1day1) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk2mon: tripsForDate(serviceDate: $wk2day1) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk3mon: tripsForDate(serviceDate: $wk3day1) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk4mon: tripsForDate(serviceDate: $wk4day1) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk5mon: tripsForDate(serviceDate: $wk5day1) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk6mon: tripsForDate(serviceDate: $wk6day1)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk7mon: tripsForDate(serviceDate: $wk7day1)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk8mon: tripsForDate(serviceDate: $wk8day1)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk9mon: tripsForDate(serviceDate: $wk9day1)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk10mon: tripsForDate(serviceDate: $wk10day1)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk1tue: tripsForDate(serviceDate: $wk1day2) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk2tue: tripsForDate(serviceDate: $wk2day2) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk3tue: tripsForDate(serviceDate: $wk3day2) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk4tue: tripsForDate(serviceDate: $wk4day2) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk5tue: tripsForDate(serviceDate: $wk5day2) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk6tue: tripsForDate(serviceDate: $wk6day2)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk7tue: tripsForDate(serviceDate: $wk7day2)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk8tue: tripsForDate(serviceDate: $wk8day2)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk9tue: tripsForDate(serviceDate: $wk9day2)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk10tue: tripsForDate(serviceDate: $wk10day2)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk1wed: tripsForDate(serviceDate: $wk1day3) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk2wed: tripsForDate(serviceDate: $wk2day3) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk3wed: tripsForDate(serviceDate: $wk3day3) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk4wed: tripsForDate(serviceDate: $wk4day3) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk5wed: tripsForDate(serviceDate: $wk5day3) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk6wed: tripsForDate(serviceDate: $wk6day3)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk7wed: tripsForDate(serviceDate: $wk7day3)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk8wed: tripsForDate(serviceDate: $wk8day3)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk9wed: tripsForDate(serviceDate: $wk9day3)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk10wed: tripsForDate(serviceDate: $wk10day3)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk1thu: tripsForDate(serviceDate: $wk1day4) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk2thu: tripsForDate(serviceDate: $wk2day4) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk3thu: tripsForDate(serviceDate: $wk3day4) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk4thu: tripsForDate(serviceDate: $wk4day4) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk5thu: tripsForDate(serviceDate: $wk5day4) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk6thu: tripsForDate(serviceDate: $wk6day4)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk7thu: tripsForDate(serviceDate: $wk7day4)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk8thu: tripsForDate(serviceDate: $wk8day4)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk9thu: tripsForDate(serviceDate: $wk9day4)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk10thu: tripsForDate(serviceDate: $wk10day4)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk1fri: tripsForDate(serviceDate: $wk1day5) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk2fri: tripsForDate(serviceDate: $wk2day5) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk3fri: tripsForDate(serviceDate: $wk3day5) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk4fri: tripsForDate(serviceDate: $wk4day5) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk5fri: tripsForDate(serviceDate: $wk5day5) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk6fri: tripsForDate(serviceDate: $wk6day5)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk7fri: tripsForDate(serviceDate: $wk7day5)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk8fri: tripsForDate(serviceDate: $wk8day5)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk9fri: tripsForDate(serviceDate: $wk9day5)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk10fri: tripsForDate(serviceDate: $wk10day5)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk1sat: tripsForDate(serviceDate: $wk1day6) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk2sat: tripsForDate(serviceDate: $wk2day6) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk3sat: tripsForDate(serviceDate: $wk3day6) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk4sat: tripsForDate(serviceDate: $wk4day6) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk5sat: tripsForDate(serviceDate: $wk5day6) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk6sat: tripsForDate(serviceDate: $wk6day6)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk7sat: tripsForDate(serviceDate: $wk7day6)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk8sat: tripsForDate(serviceDate: $wk8day6)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk9sat: tripsForDate(serviceDate: $wk9day6)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk10sat: tripsForDate(serviceDate: $wk10day6)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk1sun: tripsForDate(serviceDate: $wk1day7) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk2sun: tripsForDate(serviceDate: $wk2day7) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk3sun: tripsForDate(serviceDate: $wk3day7) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk4sun: tripsForDate(serviceDate: $wk4day7) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk5sun: tripsForDate(serviceDate: $wk5day7) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk6sun: tripsForDate(serviceDate: $wk6day7)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk7sun: tripsForDate(serviceDate: $wk7day7)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk8sun: tripsForDate(serviceDate: $wk8day7)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk9sun: tripsForDate(serviceDate: $wk9day7)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk10sun: tripsForDate(serviceDate: $wk10day7)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
      }
    `,
  },
);

export { containerComponent as default, ScheduleContainer as Component };
