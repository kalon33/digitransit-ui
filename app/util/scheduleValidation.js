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
      redirect: null,
    };
  }

  // Check if pattern exists
  if (!pattern) {
    const routeId = route?.gtfsId;
    if (routeId) {
      return {
        shouldRender: false,
        reason: 'no-pattern',
        redirect: 'route-default',
      };
    }
    return {
      shouldRender: false,
      reason: 'no-pattern-no-route',
      redirect: null,
    };
  }

  return {
    shouldRender: true,
    reason: 'valid',
    redirect: null,
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
  wantedDay,
  firstDataDate,
  testNum,
}) => {
  // Skip redirect for test mode with testNum=0
  if (testNum === '0' || testNum === 0) {
    return { shouldRedirect: false, redirectDate: null, reason: 'test-mode' };
  }

  // Check if wanted day is before first available data
  if (wantedDay && firstDataDate && wantedDay < firstDataDate) {
    return {
      shouldRedirect: true,
      redirectDate: firstDataDate,
      reason: 'before-first-data',
    };
  }

  return { shouldRedirect: false, redirectDate: null, reason: 'no-redirect' };
};
