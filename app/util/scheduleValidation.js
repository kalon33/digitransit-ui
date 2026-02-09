/**
 * Validation utilities for ScheduleContainer
 * Centralized validation logic for schedule data
 *
 */

import { DateTime } from 'luxon';
import { routePagePath, PREFIX_TIMETABLE } from './path';

/**
 * Validate schedule data and determine if component should render
 * @param {Object} params - Validation parameters
 * @param {Object} params.pattern - Pattern object
 * @param {Object} params.route - Route object
 * @param {Object|null} params.constantOperationInfo - Constant operation info
 * @param {Object} params.router - Router object for redirects
 * @returns {ValidationResult} Validation result object
 */
export const validateScheduleData = ({
  pattern,
  route,
  constantOperationInfo,
}) => {
  // Check constant operation first (doesn't need pattern)
  if (constantOperationInfo) {
    return {
      shouldRender: true,
      reason: 'constant-operation',
    };
  }

  // Check if pattern exists
  if (!pattern) {
    const routeId = route?.gtfsId;
    if (routeId) {
      return {
        shouldRender: false,
        reason: 'no-pattern',
      };
    }
    return {
      shouldRender: false,
      reason: 'no-pattern-no-route',
    };
  }

  return {
    shouldRender: true,
    reason: 'valid',
  };
};

/**
 * Determine if should redirect based on date conditions
 * @param {Object} params - Validation parameters
 * @param {string|number} params.testNum - Test number (for testing mode)
 * @param {DateTime|string} params.wantedDay - The requested service day
 * @param {DateTime|string} params.firstDataDate - First date with available data
 * @param {boolean} params.noTrips - Whether there are no trips for the wanted day
 * @param {string|null} params.patternCode - Current pattern code
 * @param {string|null} params.routeId - Current route ID
 * @returns {Object} { shouldRedirect: boolean, redirectDate: DateTime|null, reason: string }
 */
export const calculateRedirectDecision = ({
  testNum,
  wantedDay,
  firstDataDate,
  noTrips,
  patternCode,
  routeId,
}) => {
  const resolvedTestNum = !!process.env.ROUTEPAGETESTING && testNum;

  // Skip redirect for test mode with testNum=0
  if (resolvedTestNum === '0' || resolvedTestNum === 0) {
    return {
      shouldRedirect: false,
      redirectDate: null,
      redirectPath: null,
      reason: 'test-mode',
    };
  }

  if (wantedDay) {
    const today = DateTime.now().startOf('day');
    if (wantedDay < today) {
      return {
        shouldRedirect: true,
        redirectDate: today,
        redirectPath: null,
        reason: 'past-date',
      };
    }
    if (firstDataDate && wantedDay < firstDataDate) {
      return {
        shouldRedirect: true,
        redirectDate: firstDataDate,
        redirectPath: null,
        reason: 'before-first-data',
      };
    }
  }

  if (noTrips && firstDataDate) {
    return {
      shouldRedirect: true,
      redirectDate: firstDataDate,
      redirectPath: routePagePath(routeId, PREFIX_TIMETABLE, patternCode),
      reason: 'no-trips',
    };
  }

  if (!patternCode && routeId) {
    return {
      shouldRedirect: true,
      redirectDate: null,
      redirectPath: routePagePath(routeId, PREFIX_TIMETABLE),
      reason: 'no-pattern',
    };
  }

  return {
    shouldRedirect: false,
    redirectDate: null,
    redirectPath: null,
    reason: 'no-redirect',
  };
};
