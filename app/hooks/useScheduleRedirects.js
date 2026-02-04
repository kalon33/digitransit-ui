/**
 * Custom hook for handling schedule redirects
 */
import { useEffect } from 'react';
import { DATE_FORMAT } from '../constants';

/**
 * Custom hook to handle schedule page redirects
 * @param {Object} params - Redirect parameters
 * @param {Object} params.match - Router match object
 * @param {Object} params.router - Router object
 * @param {Object} params.redirectDecision - Redirect decision object of type {
 *   shouldRedirect: boolean,
 *   redirectDate: DateTime|null,
 *   redirectPath: string|null
 * }
 */
export const useScheduleRedirects = ({ match, router, redirectDecision }) => {
  useEffect(() => {
    if (!redirectDecision.shouldRedirect) {
      return;
    }

    const basePath = redirectDecision.redirectPath
      ? { ...match.location, pathname: redirectDecision.redirectPath }
      : match.location;

    const serviceDay = redirectDecision.redirectDate
      ? redirectDecision.redirectDate.toFormat(DATE_FORMAT)
      : null;

    const testNum =
      !!process.env.ROUTEPAGETESTING && match?.location?.query?.test;

    const path = {
      ...basePath,
      query: {
        ...basePath.query,
        ...(serviceDay ? { serviceDay } : {}),
        ...(testNum ? { test: testNum } : {}),
      },
    };

    router.replace(path);
  }, [redirectDecision, match, router]);
};
