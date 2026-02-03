/**
 * Custom hook for handling schedule redirects
 */
import { useEffect } from 'react';
import { DateTime } from 'luxon';
import { calculateRedirectDecision } from '../util/scheduleDateValidation';
import { getFirstDepartureDate } from '../util/scheduleDataUtils';
import { DATE_FORMAT } from '../constants';

/**
 * Custom hook to handle schedule page redirects
 * @param {Object} params - Redirect parameters
 * @param {Object} params.match - Router match object
 * @param {Object} params.router - Router object
 * @param {Array} params.firstDepartures - First departures data
 * @param {DateTime} params.wantedDay - Wanted service day
 * @param {DateTime} params.firstDataDate - First date with available data
 * @param {boolean} params.firstWeekEmpty - Whether first week is empty
 */
export const useScheduleRedirects = ({
  match,
  router,
  firstDepartures,
  wantedDay,
  firstDataDate,
  firstWeekEmpty,
}) => {
  useEffect(() => {
    // Handle testing mode internally
    const testing = process.env.ROUTEPAGETESTING || false;
    const testNum = testing && match?.location?.query?.test;

    // Check if past date and redirect to current path
    const { serviceDay } = match.location.query;
    if (serviceDay) {
      const date = DateTime.fromFormat(serviceDay, DATE_FORMAT);
      // Don't allow past dates (before current week)
      if (date && date.startOf('week') < DateTime.now().startOf('week')) {
        match.router.replace(decodeURIComponent(match.location.pathname));
        return;
      }
    }

    // Calculate if we need to redirect
    const firstDepartureDate = getFirstDepartureDate(
      firstDepartures[0],
      wantedDay,
    );

    const redirectDecision = calculateRedirectDecision({
      wantedDay,
      firstDataDate,
      firstDepartureDate,
      firstWeekEmpty,
      testNum,
    });

    if (redirectDecision.shouldRedirect && redirectDecision.redirectDate) {
      const { location } = match;
      const newPath = {
        ...location,
        query: {
          ...location.query,
          serviceDay: redirectDecision.redirectDate.toFormat(DATE_FORMAT),
        },
      };
      router.replace(newPath);
    }
  }, [
    match,
    router,
    firstDepartures,
    wantedDay,
    firstDataDate,
    firstWeekEmpty,
  ]);
};
