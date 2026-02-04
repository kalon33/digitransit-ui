/**
 * Validation utilities for ScheduleContainer
 * Centralized validation logic for schedule data
 *
 * @typedef {Object} ValidationResult
 * @property {boolean} shouldRender - Whether the component should render
 * @property {string} reason - Reason for validation result ('valid', 'constant-operation', 'no-pattern', etc.)
 * @property {string|null} redirect - Redirect type if applicable ('route-default' or null)
 *
 * @typedef {Object} ScheduleRangeData
 * @property {string} timeRange - Formatted time range string
 * @property {DateTime|null} wantedDay - The wanted day DateTime object
 * @property {number|null} weekday - Weekday number (1-7)
 */

import { DateTime } from 'luxon';
import { routePagePath, PREFIX_TIMETABLE } from './path';
import { DATE_FORMAT } from '../constants';

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
      shouldRender: false,
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
 * @param {DateTime} params.wantedDay - The requested service day
 * @param {DateTime} params.firstDataDate - First date with available data
 * @param {string|number} params.testNum - Test number (for testing mode)
 * @returns {Object} { shouldRedirect: boolean, redirectDate: DateTime|null, reason: string }
 */
export const calculateRedirectDecision = ({
  match,
  wantedDay,
  firstDataDate,
  noTrips,
  pattern,
  routeId,
  fallbackServiceDay,
  serviceDay,
}) => {
  const testNum =
    !!process.env.ROUTEPAGETESTING && match?.location?.query?.test;

  // Skip redirect for test mode with testNum=0
  if (testNum === '0' || testNum === 0) {
    return {
      shouldRedirect: false,
      redirectDate: null,
      redirectPath: null,
      reason: 'test-mode',
    };
  }

  //  Redirect if past date (before today) and redirect to current path
  if (serviceDay) {
    const date = DateTime.fromFormat(serviceDay, DATE_FORMAT);
    const today = DateTime.now().startOf('day');
    if (date && date.startOf('day') < today) {
      return {
        shouldRedirect: true,
        redirectDate: today,
        redirectPath: null,
        reason: 'past-date',
      };
    }
  }

  // Redirect if wanted day is before first available data
  if (wantedDay && firstDataDate && wantedDay < firstDataDate) {
    return {
      shouldRedirect: true,
      redirectDate: firstDataDate,
      redirectPath: null,
      reason: 'before-first-data',
    };
  }

  // Redirect if no trips and new service day is specified
  if (noTrips && fallbackServiceDay) {
    return {
      shouldRedirect: true,
      redirectDate: fallbackServiceDay.toFormat(DATE_FORMAT),
      redirectPath: routePagePath(routeId, PREFIX_TIMETABLE, pattern.code),
      reason: 'no-trips',
    };
  }

  // Redirect if no pattern but routeId exists
  if (!pattern && routeId) {
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
