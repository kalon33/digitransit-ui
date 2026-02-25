/**
 * Validation utilities for ScheduleContainer
 * Centralized validation logic for schedule data
 *
 */

import { DateTime } from 'luxon';
import { routePagePath, PREFIX_TIMETABLE } from './path';
import { DATE_FORMAT } from '../constants';

/**
 * Determine if should redirect. Handles test mode, dates, and missing pattern code.
 * Common causes include old or incorrect URLs.
 * @param {Object} params - Validation parameters
 * @param {string|number} params.testNum - Test number (for testing mode)
 * @param {DateTime} params.wantedDay - The requested service day as a DateTime object
 * @param {string|null} params.patternCode - Current pattern code
 * @param {string|null} params.routeId - Current route ID
 * @returns {Object} { shouldRedirect: boolean, redirectPath: string|null, query: Object }
 */
export const calculateRedirectDecision = ({
  testNum,
  wantedDay,
  patternCode,
  routeId,
}) => {
  const resolvedTestNum = !!process.env.ROUTEPAGETESTING && testNum;

  const buildQuery = baseQuery => {
    if (resolvedTestNum) {
      return { ...baseQuery, test: testNum };
    }
    return baseQuery;
  };

  // Skip redirect for test mode with testNum=0
  if (resolvedTestNum === '0' || resolvedTestNum === 0) {
    return {
      shouldRedirect: false,
      redirectPath: null,
      query: {},
    };
  }

  const today = DateTime.now().startOf('day');
  if (wantedDay && (!wantedDay.isValid || wantedDay < today)) {
    return {
      shouldRedirect: true,
      redirectPath: null,
      query: buildQuery({
        serviceDay: today.toFormat(DATE_FORMAT),
      }),
    };
  }

  if (!patternCode && routeId) {
    return {
      shouldRedirect: true,
      redirectPath: routePagePath(routeId, PREFIX_TIMETABLE),
      query: buildQuery({}),
    };
  }

  return {
    shouldRedirect: false,
    redirectPath: null,
    query: {},
  };
};
