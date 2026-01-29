/**
 * Date validation utilities for schedule components
 * Handles date range checks and validation logic
 */
import { DateTime } from 'luxon';

/**
 * Check if wanted day is before first available data date
 * @param {DateTime} wantedDay - The requested service day
 * @param {DateTime} firstDataDate - First date with available data
 * @returns {boolean}
 */
export const isBeforeFirstDataDate = (wantedDay, firstDataDate) => {
  if (!wantedDay || !firstDataDate) {
    return false;
  }
  return wantedDay < firstDataDate;
};

/**
 * Check if wanted day is before next week
 * @param {DateTime} wantedDay - The requested service day
 * @returns {boolean}
 */
export const isBeforeNextWeek = wantedDay => {
  if (!wantedDay) {
    return false;
  }
  const nextMonday = DateTime.now().startOf('week').plus({ weeks: 1 });
  return wantedDay < nextMonday;
};

/**
 * Check if wanted day is same or after next week
 * @param {DateTime} wantedDay - The requested service day
 * @returns {boolean}
 */
export const isSameOrAfterNextWeek = wantedDay => {
  if (!wantedDay) {
    return false;
  }
  const nextMonday = DateTime.now().startOf('week').plus({ weeks: 1 });
  return wantedDay >= nextMonday;
};

/**
 * Determine if should redirect based on date conditions
 * @param {Object} params - Validation parameters
 * @param {DateTime} params.wantedDay - The requested service day
 * @param {DateTime} params.firstDataDate - First date with available data
 * @param {DateTime} params.firstDepartureDate - First departure date from data
 * @param {boolean} params.firstWeekEmpty - Whether first week has no departures
 * @param {string|number} params.testNum - Test number (for testing mode)
 * @returns {Object} { shouldRedirect: boolean, redirectDate: DateTime|null, reason: string }
 */
export const calculateRedirectDecision = ({
  wantedDay,
  firstDataDate,
  firstDepartureDate,
  firstWeekEmpty,
  testNum,
}) => {
  // Skip redirect for test mode with testNum=0
  if (testNum === '0' || testNum === 0) {
    return { shouldRedirect: false, redirectDate: null, reason: 'test-mode' };
  }

  // Check if wanted day is before first available data
  if (isBeforeFirstDataDate(wantedDay, firstDataDate)) {
    return {
      shouldRedirect: true,
      redirectDate: firstDataDate,
      reason: 'before-first-data',
    };
  }

  // Check if should redirect due to empty week or first departure date
  const isBeforeNext = isBeforeNextWeek(wantedDay);
  const isSameOrAfterNext = isSameOrAfterNextWeek(wantedDay);

  if ((isBeforeNext && firstWeekEmpty) || firstDepartureDate) {
    if (wantedDay && !isSameOrAfterNext) {
      // Check if first departure date is different from current day
      if (
        firstDepartureDate &&
        !DateTime.now().hasSame(firstDepartureDate, 'day')
      ) {
        return {
          shouldRedirect: true,
          redirectDate: firstDepartureDate,
          reason: 'first-departure-different-day',
        };
      }

      // Check if should redirect to next Monday
      const nextMonday = DateTime.now().startOf('week').plus({ weeks: 1 });
      if (
        !firstDepartureDate ||
        !DateTime.now().hasSame(firstDepartureDate, 'week')
      ) {
        return {
          shouldRedirect: true,
          redirectDate: nextMonday,
          reason: 'redirect-to-next-monday',
        };
      }
    }
  }

  return { shouldRedirect: false, redirectDate: null, reason: 'no-redirect' };
};

/**
 * Validate if date is in acceptable range
 * @param {DateTime} date - Date to validate
 * @returns {boolean}
 */
export const isDateInPast = date => {
  if (!date) {
    return false;
  }
  const currentWeekStart = DateTime.now().startOf('week');
  return date.startOf('week') < currentWeekStart;
};
