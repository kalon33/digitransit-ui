import PropTypes from 'prop-types';
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { useFragment } from 'react-relay';
import { connectToStores } from 'fluxible-addons-react';
import { matchShape, routerShape } from 'found';
import { DateTime } from 'luxon';
import cx from 'classnames';
import { SchedulePatternFragment } from './queries/SchedulePatternFragment';
import { ScheduleRouteFragment } from './queries/ScheduleRouteFragment';
import { ScheduleFirstDeparturesFragment } from './queries/ScheduleFirstDeparturesFragment';
import ScheduleHeader from './ScheduleHeader';
import ScheduleDayTabs from './ScheduleDayTabs';
import ScheduleTripList from './ScheduleTripList';
import ScheduleConstantOperation from './ScheduleConstantOperation';
import SecondaryButton from '../../SecondaryButton';
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
import { getTripsList } from '../../../util/scheduleTripsUtils';
import { routeShape, patternShape } from '../../../util/shapes';
import { calculateNewServiceDay } from '../../../util/scheduleServiceDayUtils';
import {
  useScheduleData,
  usePopulatedScheduleData,
  useFirstDataDate,
} from '../../../hooks/useScheduleData';
import { useScheduleRedirects } from '../../../hooks/useScheduleRedirects';
import { DATA_INDEX, RANGE_INDEX } from '../../../util/scheduleDataUtils';

const openRoutePDF = (e, routePDFUrl) => {
  e.stopPropagation();
  window.open(routePDFUrl.href);
};

const printRouteTimetable = e => {
  e.stopPropagation();
  window.print();
};

const ScheduleContainer = ({
  pattern: patternRef,
  route: routeRef,
  firstDepartures: firstDeparturesRef,
  match,
  breakpoint,
  router,
  lang = 'en',
}) => {
  // Unwrap fragment references
  const pattern = useFragment(SchedulePatternFragment, patternRef);
  const route = useFragment(ScheduleRouteFragment, routeRef);
  const firstDeparturesProp = useFragment(
    ScheduleFirstDeparturesFragment,
    firstDeparturesRef,
  );

  const intl = useTranslationsContext();
  const config = useConfigContext();

  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(Math.max((pattern?.stops?.length || 1) - 1, 0));
  const [focusedTab, setFocusedTab] = useState(null);

  const tabRefs = useRef({});

  // Get query params and testing flags
  const { query } = match.location;
  const testing = process.env.ROUTEPAGETESTING || false;
  const testNum = testing && query && query.test;

  const testData = testing && testNum ? getTestData(testNum) : null;

  // Process schedule data using custom hook
  const { firstDepartures, hasMergedData, dataExistsDay, firstWeekEmpty } =
    useScheduleData({
      firstDeparturesProp,
      testData,
      testing,
      testNum,
    });

  // Calculate wanted day and first data date
  const wantedDay =
    query && query.serviceDay
      ? DateTime.fromFormat(query.serviceDay, DATE_FORMAT)
      : undefined;

  const firstDataDate = useFirstDataDate(hasMergedData, dataExistsDay);

  // Handle redirects
  useScheduleRedirects({
    match,
    router,
    firstDepartures,
    wantedDay,
    firstDataDate,
    firstWeekEmpty,
    testNum,
  });

  // Populate display data
  const data = usePopulatedScheduleData(
    wantedDay,
    firstDepartures,
    hasMergedData,
    dataExistsDay,
  );

  // Calculate new service day if needed
  const newServiceDay = useMemo(
    () => calculateNewServiceDay(wantedDay, data, firstDataDate),
    [wantedDay, data, firstDataDate],
  );

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

  const changeDate = useCallback(
    selectedServiceDay => {
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
          serviceDay: selectedServiceDay,
        },
      };
      router.replace(newPath);
    },
    [match, router],
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

  if (!pattern) {
    if (routeId) {
      // Redirect back to routes default pattern
      router.replace(routePagePath(routeId, PREFIX_TIMETABLE));
    }
    return null;
  }

  const currentPattern = route?.patterns?.find(p => p.code === pattern.code);

  // Calculate route timetable URL before using it
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

  // Get trips using the new utility function
  const tripsResult = getTripsList({
    pattern: currentPattern,
    newServiceDay,
    match,
    intl,
    testing,
    testNum,
  });

  // Handle redirect if needed
  if (tripsResult.redirectPath) {
    match.router.replace(tripsResult.redirectPath);
    return null;
  }

  // Show no trips message
  if (tripsResult.noTripsMessage) {
    return tripsResult.noTripsMessage;
  }

  const showTrips = tripsResult.trips;

  // Memoize print handlers after routeTimetableUrl is defined
  const handlePrintPDF = useCallback(
    e => {
      openRoutePDF(e, routeTimetableUrl);
      addAnalyticsEvent({
        category: 'Route',
        action: 'PrintWeeklyTimetable',
        name: null,
      });
    },
    [routeTimetableUrl],
  );

  const handlePrintTimetable = useCallback(e => {
    printRouteTimetable(e);
    addAnalyticsEvent({
      category: 'Route',
      action: 'PrintTimetable',
      name: null,
    });
  }, []);

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
              from={from}
              to={to}
              onFromSelectChange={onFromSelectChange}
              onToSelectChange={onToSelectChange}
            />
            <div
              className="route-schedule-list momentum-scroll"
              role="list"
              aria-live="off"
            >
              {Array.isArray(showTrips) && (
                <ScheduleTripList trips={showTrips} fromIdx={from} toIdx={to} />
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
              buttonClickAction={handlePrintPDF}
              buttonIcon="icon_print"
              smallSize
            />
          )}
          <SecondaryButton
            ariaLabel="print"
            buttonName="print"
            buttonClickAction={handlePrintTimetable}
            buttonIcon="icon_print"
            smallSize
          />
        </div>
      </div>
    </>
  );
};

ScheduleContainer.propTypes = {
  pattern: patternShape.isRequired,
  route: routeShape.isRequired,
  // firstDepartures is a Relay fragment with dynamic structure
  // eslint-disable-next-line react/forbid-prop-types
  firstDepartures: PropTypes.object.isRequired,
  match: matchShape.isRequired,
  breakpoint: PropTypes.string.isRequired,
  router: routerShape.isRequired,
  lang: PropTypes.string.isRequired,
};

const containerComponent = connectToStores(
  withBreakpoint(ScheduleContainer),
  ['PreferencesStore'],
  context => ({
    lang: context.getStore('PreferencesStore').getLanguage(),
  }),
);

export { containerComponent as default, ScheduleContainer as Component };
