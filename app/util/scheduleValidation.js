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
 * @param {string|null} params.patternCode - Current pattern code
 * @param {string|null} params.routeId - Current route ID
 * @returns {Object} { shouldRedirect: boolean, redirectDate: DateTime|null, redirectPath: string|null, reason: string }
 */
export const calculateRedirectDecision = ({
  testNum,
  wantedDay,
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

  const today = DateTime.now().startOf('day');
  if (wantedDay && wantedDay < today) {
    return {
      shouldRedirect: true,
      redirectDate: today,
      redirectPath: null,
      reason: 'past-date',
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
