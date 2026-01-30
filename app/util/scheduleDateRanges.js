/**
 * Date range calculation utilities for schedule display
 * Handles time range formatting and option generation
 *
 * @typedef {Object} DateRangeOption
 * @property {string} label - Formatted date range string for display
 * @property {string} value - Date value in DATE_FORMAT
 *
 * @typedef {[string, DateTime, number, Array<string>, DateTime]} RangeTuple
 * Range information tuple structure:
 * [0] timeRange: string - Formatted time range (e.g., '1.2.2024 - 7.2.2024')
 * [1] wantedDay: DateTime - The target day
 * [2] weekday: number - Weekday number (1-7)
 * [3] dayArray: Array<string> - Day patterns with data
 * [4] weekStart: DateTime - Week start date
 */
import { DateTime } from 'luxon';
import { DATE_FORMAT } from '../constants';

const DATE_FORMAT_SCHEDULE = 'd.L.yyyy';

/**
 * Calculate time range start date for a week
 * @param {DateTime} weekStart - Start of the week
 * @param {string} firstServiceDay - First service day in the week
 * @param {number} departureCount - Number of departure weeks
 * @param {boolean} isSameWeek - Is this the current week
 * @param {number} idx - Week index
 * @returns {DateTime} Calculated time range start
 */
export const calculateTimeRangeStart = (
  weekStart,
  firstServiceDay,
  departureCount,
  isSameWeek,
  idx,
) => {
  const shouldAdjustStart =
    weekStart.weekday <= firstServiceDay[0] &&
    departureCount === 1 &&
    (isSameWeek || idx === 0);

  return shouldAdjustStart
    ? weekStart.plus({ days: firstServiceDay[0] - 1 })
    : weekStart;
};

/**
 * Format time range string for a week
 * @param {DateTime} timeRangeStart - Start of time range
 * @param {DateTime} weekEnd - End of the week
 * @param {Array} days - Days array
 * @param {number} idx - Week index
 * @param {DateTime} wantedDay - Wanted day
 * @param {boolean} isMerged - Whether data is merged
 * @returns {string} Formatted time range
 */
export const formatTimeRange = (
  timeRangeStart,
  weekEnd,
  days,
  idx,
  wantedDay,
  isMerged,
) => {
  const isSingleDay =
    days.length === 1 && days[idx][0]?.length === 1 && wantedDay && !isMerged;

  return isSingleDay
    ? wantedDay.toFormat(DATE_FORMAT_SCHEDULE)
    : `${timeRangeStart.toFormat(DATE_FORMAT_SCHEDULE)} - ${weekEnd.toFormat(
        DATE_FORMAT_SCHEDULE,
      )}`;
};

/**
 * Calculate option value date for a week
 * @param {DateTime} weekStart - Start of the week
 * @param {Array} days - Days array
 * @param {number} idx - Week index
 * @param {string} firstServiceDay - First service day
 * @returns {string} Formatted date value
 */
export const calculateOptionValue = (weekStart, days, idx, firstServiceDay) => {
  const currentDayNo = DateTime.now().weekday;
  const isCurrentDayOption =
    idx === 0 &&
    days[idx].indexOf(currentDayNo.toString()) !== -1 &&
    currentDayNo > Number(firstServiceDay);

  return isCurrentDayOption
    ? weekStart.plus({ days: currentDayNo - 1 }).toFormat(DATE_FORMAT)
    : weekStart.plus({ days: firstServiceDay[0] - 1 }).toFormat(DATE_FORMAT);
};

/**
 * Create dropdown options for other available date ranges
 * @param {Array<DateTime>} weekStarts - Week start dates
 * @param {Array<DateTime>} weekEnds - Week end dates
 * @param {Array<Array<string>>} days - Days arrays
 * @param {DateTime} wantedDay - Current wanted day
 * @param {DateTime} startOfCurrentWeek - Start of current week
 * @param {number} departureCount - Number of departure weeks
 * @param {boolean} isMerged - Whether data is merged
 * @returns {Array<DateRangeOption>} Array of dropdown options
 */
export const createDateRangeOptions = (
  weekStarts,
  weekEnds,
  days,
  wantedDay,
  startOfCurrentWeek,
  departureCount,
  isMerged,
) => {
  return weekStarts
    .map((weekStart, idx) => {
      const firstServiceDay = days[idx]?.[0];

      // Skip if no service days available
      if (!firstServiceDay) {
        return null;
      }

      const isSameWeek = startOfCurrentWeek.hasSame(weekStart, 'week');

      // Determine if this week contains the wanted day
      if (wantedDay >= weekStart && wantedDay <= weekEnds[idx]) {
        return null; // This is the current week, not an option
      }

      // Calculate time range start
      const timeRangeStart = calculateTimeRangeStart(
        weekStart,
        firstServiceDay,
        departureCount,
        isSameWeek,
        idx,
      );

      // Format time range
      const timeRange = formatTimeRange(
        timeRangeStart,
        weekEnds[idx],
        days,
        idx,
        wantedDay,
        isMerged,
      );

      // Calculate value for this option
      const value = calculateOptionValue(weekStart, days, idx, firstServiceDay);

      return { label: timeRange, value };
    })
    .filter(option => option !== null);
};

/**
 * Calculate the current range information for the wanted day
 * @param {DateTime} wantedDay - The wanted day
 * @param {Array<DateTime>} weekStarts - Array of week start dates
 * @param {Array<DateTime>} weekEnds - Array of week end dates
 * @param {Array<Array<string>>} days - Array of days arrays
 * @param {DateTime} startOfCurrentWeek - Start of current week
 * @param {number} departureCount - Number of departure weeks
 * @param {boolean} isMerged - Whether data is merged
 * @returns {RangeTuple} Range information tuple
 */
export const calculateCurrentRange = (
  wantedDay,
  weekStarts,
  weekEnds,
  days,
  startOfCurrentWeek,
  departureCount,
  isMerged,
) => {
  // Default range
  let range = [
    wantedDay.toFormat(DATE_FORMAT_SCHEDULE),
    wantedDay,
    wantedDay.weekday,
    '',
    wantedDay.startOf('week'),
  ];

  // Update range if the wanted day falls within a week
  weekStarts.forEach((weekStart, idx) => {
    if (wantedDay >= weekStart && wantedDay <= weekEnds[idx]) {
      const firstServiceDay = days[idx]?.[0];

      // Only update range if we have valid service days
      if (!firstServiceDay) {
        return;
      }

      const isSameWeek = startOfCurrentWeek.hasSame(weekStart, 'week');
      const timeRangeStart = calculateTimeRangeStart(
        weekStart,
        firstServiceDay,
        departureCount,
        isSameWeek,
        idx,
      );

      const timeRange = formatTimeRange(
        timeRangeStart,
        weekEnds[idx],
        days,
        idx,
        wantedDay,
        isMerged,
      );

      range = [
        timeRange,
        wantedDay,
        wantedDay.weekday,
        days[idx],
        weekStarts[idx],
      ];
    }
  });

  return range;
};

/**
 * Initialize and adjust first week start date
 * @param {DateTime} startOfCurrentWeek - Start of current week
 * @param {DateTime} today - Today's date
 * @param {Array} departures - Departures array
 * @param {boolean} currentAndNextWeekAreSame - Whether weeks are same
 * @returns {Object} { firstWeekStart: DateTime, pastDate: string }
 */
export const calculateFirstWeekStart = (
  startOfCurrentWeek,
  today,
  departures,
  currentAndNextWeekAreSame,
) => {
  let pastDate;
  let firstWeekStart = currentAndNextWeekAreSame ? startOfCurrentWeek : today;

  if (
    !currentAndNextWeekAreSame &&
    departures.length > 0 &&
    departures[0].length > 0 &&
    departures[0][0]
  ) {
    const minDayNo = Math.min(...departures[0][0][0].split('').map(Number));
    pastDate = startOfCurrentWeek.plus({ days: minDayNo - 1 });
    if (!currentAndNextWeekAreSame) {
      firstWeekStart = pastDate;
    }
  }

  return { firstWeekStart, pastDate };
};
