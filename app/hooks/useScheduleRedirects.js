/**
 * Custom hook for handling schedule redirects
 */
import { useEffect } from 'react';
import { DateTime } from 'luxon';
import { calculateRedirectDecision } from '../util/scheduleValidation';
import { DATE_FORMAT } from '../constants';

/**
 * Custom hook to handle schedule page redirects
 * @param {Object} params - Redirect parameters
 * @param {Object} params.match - Router match object
 * @param {Object} params.router - Router object
 * @param {DateTime} params.wantedDay - Wanted service day
 * @param {DateTime} params.firstDataDate - First date with available data
 */
export const useScheduleRedirects = ({
  match,
  router,
  wantedDay,
  firstDataDate,
}) => {
  useEffect(() => {
    // Handle testing mode internally
    const testNum =
      !!process.env.ROUTEPAGETESTING && match?.location?.query?.test;

    // Check if past date (before today) and redirect to current path
    const { serviceDay } = match.location.query;
    if (serviceDay) {
      const date = DateTime.fromFormat(serviceDay, DATE_FORMAT);
      if (date && date.startOf('day') < DateTime.now().startOf('day')) {
        match.router.replace(decodeURIComponent(match.location.pathname));
        return;
      }
    }

    const redirectDecision = calculateRedirectDecision({
      wantedDay,
      firstDataDate,
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
  }, [match, router, wantedDay, firstDataDate]);
};
