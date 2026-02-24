import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useFragment } from 'react-relay';
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
import { useBreakpoint } from '../../../util/withBreakpoint';
import DateSelectGrouped from '../../stop/DateSelectGrouped';
import RouteControlPanel from '../RouteControlPanel';
import ScrollableWrapper from '../../ScrollableWrapper';
import { useConfigContext } from '../../../configurations/ConfigContext';
import { useTranslationsContext } from '../../../util/useTranslationsContext';
import { getTripsList } from '../../../util/scheduleTripsUtils';
import { routeShape, patternShape } from '../../../util/shapes';
import { useScheduleRedirects } from '../../../hooks/useScheduleRedirects';
import {
  validateScheduleData,
  calculateRedirectDecision,
} from '../../../util/scheduleValidation';
import {
  buildAvailableDates,
  selectScheduleData,
} from '../../../util/scheduleDataUtils';

/**
 * Open a route timetable PDF in a new window.
 * @param {SyntheticEvent} e
 * @param {{ href: string }} routePDFUrl
 */
const openRoutePDF = (e, routePDFUrl) => {
  e.stopPropagation();
  window.open(routePDFUrl.href);
};

/**
 * Trigger browser print for the current timetable view.
 * @param {SyntheticEvent} e
 */
const printRouteTimetable = e => {
  e.stopPropagation();
  window.print();
};

/**
 * ScheduleContainer
 * - Unwraps schedule fragments with `useFragment`
 * - Orchestrates routing, analytics, and view composition
 * - Handles timetable date selection + stop range selection
 */
const ScheduleContainer = ({
  pattern: patternRef,
  route: routeRef,
  firstDepartures: firstDeparturesRef,
  match,
  router,
}) => {
  const breakpoint = useBreakpoint();
  const pattern = useFragment(SchedulePatternFragment, patternRef);
  const route = useFragment(ScheduleRouteFragment, routeRef);
  const firstDeparturesProp = useFragment(
    ScheduleFirstDeparturesFragment,
    firstDeparturesRef,
  );

  const intl = useTranslationsContext();
  const config = useConfigContext();
  const lang = intl.locale;

  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(Math.max((pattern?.stops?.length || 1) - 1, 0));

  const firstDepartures = selectScheduleData(firstDeparturesProp, match);

  const { query } = match.location;
  const serviceDayString = query?.serviceDay;
  const wantedDay = useMemo(
    () =>
      serviceDayString
        ? DateTime.fromFormat(serviceDayString, DATE_FORMAT)
        : DateTime.local(),
    [serviceDayString],
  );

  const availableDates = useMemo(
    () => buildAvailableDates(firstDepartures),
    [wantedDay, firstDepartures],
  );

  const currentPattern = route?.patterns?.find(p => p.code === pattern?.code);

  const testNum = match?.location?.query?.test;

  const tripsResult = useMemo(
    () =>
      getTripsList({
        pattern: currentPattern,
        intl,
        testNum,
        wantedDay,
      }),
    [currentPattern, intl, testNum, wantedDay],
  );

  const routeId = route?.gtfsId;
  const { constantOperationRoutes } = config;
  const { locale } = intl;

  const constantOperationInfo =
    routeId && constantOperationRoutes?.[routeId]
      ? constantOperationRoutes[routeId][locale]
      : null;

  const validation = validateScheduleData({
    pattern,
    route,
    constantOperationInfo,
  });

  const redirectDecision = useMemo(
    () =>
      calculateRedirectDecision({
        testNum,
        wantedDay,
        patternCode: pattern?.code,
        routeId,
      }),
    [testNum, wantedDay, pattern?.code, routeId],
  );

  useScheduleRedirects({
    match,
    router,
    redirectDecision,
  });

  useEffect(() => {
    if (pattern?.code) {
      setFrom(0);
      setTo(pattern.stops.length - 1);
    }
  }, [pattern?.code, pattern?.stops?.length]);

  // Handler for timetable origin stop selection
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

  // Handler for timetable destination stop selection
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

  const formattedServiceDate = wantedDay && wantedDay.toFormat(DATE_FORMAT);

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
        className={cx('route-schedule-container', {
          mobile: breakpoint !== 'large',
        })}
      >
        {route && route.patterns && (
          <RouteControlPanel
            match={match}
            route={route}
            breakpoint={breakpoint}
            noInitialServiceDay
          />
        )}
        <div className="route-schedule-grouped-date-select">
          <div className="route-schedule-grouped-date-select-wrapper">
            <DateSelectGrouped
              dateFormat={DATE_FORMAT}
              selectedDay={wantedDay}
              dates={availableDates}
              onDateChange={changeDate}
            />
          </div>
        </div>
        {tripsResult.noTripsMessage}
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
  router: routerShape.isRequired,
};

ScheduleContainer.displayName = 'ScheduleContainer';

export { ScheduleContainer as Component };
export default ScheduleContainer;
