import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useFragment } from 'react-relay';
import { connectToStores } from 'fluxible-addons-react';
import { matchShape, routerShape } from 'found';
import { DateTime } from 'luxon';
import cx from 'classnames';
import { SchedulePatternFragment } from './queries/SchedulePatternFragment';
import { ScheduleRouteFragment } from './queries/ScheduleRouteFragment';
import { ScheduleFirstDeparturesFragment } from './queries/ScheduleFirstDeparturesFragment';
import ScheduleHeader from './ScheduleHeader';
import ScheduleTripList from './ScheduleTripList';
import ScheduleConstantOperation from './ScheduleConstantOperation';
import SecondaryButton from '../../SecondaryButton';
import { DATE_FORMAT } from '../../../constants';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import withBreakpoint from '../../../util/withBreakpoint';
import ScheduleDropdown from './ScheduleDropdown';
import RouteControlPanel from '../RouteControlPanel';
import ScrollableWrapper from '../../ScrollableWrapper';
import { useConfigContext } from '../../../configurations/ConfigContext';
import { useTranslationsContext } from '../../../util/useTranslationsContext';
import { getTripsList } from '../../../util/scheduleTripsUtils';
import { routeShape, patternShape } from '../../../util/shapes';
import { useScheduleData } from '../../../hooks/useScheduleData';
import { useScheduleRedirects } from '../../../hooks/useScheduleRedirects';
import {
  validateScheduleData,
  calculateRedirectDecision,
} from '../../../util/scheduleValidation';
import { populateData } from '../../../util/scheduleDataUtils';

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
  lang,
}) => {
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

  const { firstDepartures } = useScheduleData({
    firstDeparturesProp,
    match,
  });

  const { query } = match.location;
  const wantedDay = query?.serviceDay
    ? DateTime.fromFormat(query.serviceDay, DATE_FORMAT)
    : undefined;

  const data = useMemo(
    () => populateData(wantedDay, firstDepartures),
    [query?.serviceDay, firstDepartures],
  );

  const firstDataDate = data?.dates?.[0];
  const firstDataDateStr = firstDataDate
    ? firstDataDate.toFormat(DATE_FORMAT)
    : null;
  const currentPattern = useMemo(
    () => route?.patterns?.find(p => p.code === pattern?.code),
    [route?.patterns, pattern?.code],
  );
  const tripsResult = getTripsList({
    pattern: currentPattern,
    match,
    intl,
  });

  const routeId = route?.gtfsId;
  const { constantOperationRoutes } = config;
  const { locale } = intl;

  const constantOperationInfo = useMemo(() => {
    if (routeId && constantOperationRoutes?.[routeId]) {
      return constantOperationRoutes[routeId][locale];
    }
    return null;
  }, [routeId, locale, constantOperationRoutes]);

  const validation = validateScheduleData({
    pattern,
    route,
    constantOperationInfo,
  });

  const testNum = match?.location?.query?.test;
  const redirectDecision = useMemo(
    () =>
      calculateRedirectDecision({
        testNum,
        wantedDay,
        firstDataDate,
        noTrips: !tripsResult.trips,
        patternCode: pattern?.code,
        routeId,
      }),
    [
      testNum,
      query?.serviceDay,
      firstDataDateStr,
      !tripsResult.trips,
      pattern?.code,
      routeId,
    ],
  );

  useScheduleRedirects({
    match,
    router,
    redirectDecision,
  });

  const scheduleRange = data?.range || {
    timeRange: '',
    wantedDay: null,
    weekday: null,
  };

  const optionsData = data?.options || [];

  useEffect(() => {
    if (pattern?.code) {
      setFrom(0);
      setTo(pattern.stops.length - 1);
    }
  }, [pattern?.code, pattern?.stops?.length]);

  // Handler for timetable stop selection
  const onFromSelectChange = useCallback(
    selectFrom => {
      const fromValue = Number(selectFrom);
      setFrom(fromValue);
      setTo(prevTo => {
        if (prevTo > fromValue) {
          return prevTo;
        }
        return Math.min(fromValue + 1, pattern.stops.length - 1);
      });
      addAnalyticsEvent({
        category: 'Route',
        action: 'ChangeTimetableStartPoint',
        name: null,
      });
    },
    [pattern?.stops?.length],
  );

  // Handler for timetable end stop selection
  const onToSelectChange = useCallback(selectTo => {
    setTo(Number(selectTo));
    addAnalyticsEvent({
      category: 'Route',
      action: 'ChangeTimetableEndPoint',
      name: null,
    });
  }, []);

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

  const selectedServiceDay = wantedDay || firstDataDate;
  const formattedServiceDate = selectedServiceDay
    ? selectedServiceDay.toFormat(DATE_FORMAT)
    : null;

  // Calculate route timetable URL
  const routeTimetableUrl = useMemo(() => {
    if (!routeId || !formattedServiceDate) {
      return undefined;
    }

    const [agencyId] = routeId.split(':');
    const routeTimetableHandler = config.timetables?.[agencyId];
    const baseUrl = config.URL.ROUTE_TIMETABLES[agencyId];

    if (!routeTimetableHandler || !baseUrl) {
      return undefined;
    }

    return routeTimetableHandler.routeTimetableUrlResolver(
      baseUrl,
      route,
      formattedServiceDate,
      lang,
    );
  }, [routeId, formattedServiceDate, config, route, lang]);

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

  if (!validation.shouldRender || redirectDecision.shouldRedirect) {
    return null;
  }

  if (validation.reason === 'constant-operation') {
    return (
      <ScheduleConstantOperation
        constantOperationInfo={constantOperationInfo}
        match={match}
        route={route}
        breakpoint={breakpoint}
      />
    );
  }

  if (tripsResult.noTripsMessage) {
    return tripsResult.noTripsMessage;
  }

  const showTrips = tripsResult.trips;

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
          <span className="current-range">{scheduleRange.timeRange}</span>
          <div className="other-ranges-dropdown">
            {optionsData.length > 0 && (
              <ScheduleDropdown
                id="other-dates"
                title={intl.formatMessage({
                  id: 'other-dates',
                })}
                list={optionsData}
                alignRight
                changeTitleOnChange={false}
                onSelectChange={changeDate}
              />
            )}
          </div>
        </div>
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

ScheduleContainer.displayName = 'ScheduleContainer';

const containerComponent = connectToStores(
  withBreakpoint(ScheduleContainer),
  ['PreferencesStore'],
  context => ({
    lang: context.getStore('PreferencesStore').getLanguage(),
  }),
);

export { containerComponent as default, ScheduleContainer as Component };
