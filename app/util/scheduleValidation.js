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
 * @property {Array<string>} dayArray - Array of day patterns
 * @property {DateTime|null} weekStart - Week start DateTime object
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
 * Extract and structure schedule data for easier access
 * @param {Array} data - Schedule data array from usePopulatedScheduleData
 * @returns {ScheduleRangeData} Destructured schedule data object
 */
export const getScheduleRange = data => {
  if (!data || data.length < 3) {
    return {
      timeRange: '',
      wantedDay: null,
      weekday: null,
      dayArray: [],
      weekStart: null,
    };
  }

  const range = data[2]; // DATA_INDEX.RANGE = 2

  return {
    timeRange: range[0], // RANGE_INDEX.TIME_RANGE = 0
    wantedDay: range[1], // RANGE_INDEX.WANTED_DAY = 1
    weekday: range[2], // RANGE_INDEX.WEEKDAY = 2
    dayArray: range[3], // RANGE_INDEX.DAY_ARRAY = 3
    weekStart: range[4], // RANGE_INDEX.WEEK_START = 4
  };
};
