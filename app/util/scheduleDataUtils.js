import { DateTime } from 'luxon';
import isEqual from 'lodash/isEqual';
import { DATE_FORMAT } from '../constants';
import {
  initializeWeekStructures,
  processEmptyDepartures,
  removeIndicesFromArrays,
  removeDuplicateWeeks,
} from './scheduleWeekProcessing';
import {
  createDateRangeOptions,
  calculateCurrentRange,
  calculateFirstWeekStart,
} from './scheduleDateRanges';

/**
 * Data structure index constants for schedule data array
 * The populateData function returns a tuple-like array with these indices
 */
export const DATA_INDEX = {
  WEEK_STARTS: 0, // Array of DateTime objects for week start dates
  DAYS: 1, // Array of day pattern arrays
  RANGE: 2, // Current range object (see RANGE_INDEX)
  OPTIONS: 3, // Dropdown options for other date ranges
  WEEKS_ARE_SAME: 4, // Boolean indicating if current and next week are identical
  PAST_DATE: 5, // String date in DATE_FORMAT
};

/**
 * Range object index constants
 * The range object in DATA_INDEX.RANGE is a tuple-like array with these indices
 */
export const RANGE_INDEX = {
  TIME_RANGE: 0, // Formatted time range string (e.g., "1.2.2024 - 7.2.2024")
  WANTED_DAY: 1, // DateTime object for the wanted day
  WEEKDAY: 2, // Weekday number (1-7)
  DAY_ARRAY: 3, // Array of day patterns with data
  WEEK_START: 4, // DateTime object for week start
};

// Re-export functions from sub-modules for backwards compatibility
export {
  modifyDepartures,
  isEmptyWeek,
  getMostFrequent,
} from './scheduleWeekProcessing';

/**
 * Returns the date of first departure
 * @param {Array} departures - Array of departure data
 * @param {DateTime} dateIn - Optional date to check
 * @returns {DateTime|undefined}
 */
export const getFirstDepartureDate = (departures, dateIn) => {
  if (!departures || departures.length === 0) {
    return undefined;
  }

  const date = dateIn || DateTime.now();
  const dayNo = date.weekday;
  const idx = departures.findIndex(
    departure => departure[0].indexOf(dayNo) !== -1,
  );

  if (idx === -1) {
    return undefined;
  }

  const hasNoDepartures = departures[idx][1] === 0 && departures[idx][2] === '';

  // Check if we need to look at previous day
  if (idx > 0 && hasNoDepartures) {
    const previousDeparture = departures[idx - 1];
    const hasPreviousDepartures =
      previousDeparture[1] !== 0 && previousDeparture[2] !== '';

    if (hasPreviousDepartures) {
      const newDayNo = Number(previousDeparture[0][0]);
      return date.minus({ days: dayNo - newDayNo });
    }
  }

  // First day with departures
  if (idx === 0 && !hasNoDepartures) {
    return date.hasSame(DateTime.now(), 'week') ? DateTime.now() : date;
  }

  return undefined;
};

/**
 * Populate and process departure data for display
 * This is the main function that orchestrates all data processing for schedule display
 * @param {DateTime} wantedDayIn - The date to display schedule for
 * @param {Array} departures - Array of departure data by week
 * @param {boolean} isMerged - Whether data has been merged
 * @param {number} dataExistsDay - First day of week with data (1-7)
 * @returns {Array} Tuple: [weekStarts, days, range, options, currentAndNextWeekAreSame, pastDate]
 */
export const populateData = (
  wantedDayIn,
  departures,
  isMerged,
  dataExistsDay,
) => {
  const departureCount = departures.length;
  const wantedDay = wantedDayIn || DateTime.now();
  const startOfCurrentWeek = DateTime.now().startOf('week');
  const today = DateTime.now();

  // Check if current and next week have identical schedules
  const currentAndNextWeekAreSame =
    departureCount >= 2 && isEqual(departures[0], departures[1]);

  // Initialize week structures
  const { weekStarts, weekEnds, days, emptyWeek } = initializeWeekStructures(
    departures,
    startOfCurrentWeek,
  );

  // Adjust first week start if needed
  const { firstWeekStart, pastDate: calculatedPastDate } =
    calculateFirstWeekStart(
      startOfCurrentWeek,
      today,
      departures,
      currentAndNextWeekAreSame,
    );
  weekStarts[0] = firstWeekStart;

  // Process empty departures and collect indices to remove
  const emptyIndices = processEmptyDepartures(departures, days);
  removeIndicesFromArrays(emptyIndices, weekStarts, weekEnds, days, departures);

  // Remove duplicate consecutive weeks
  removeDuplicateWeeks(departures, days, weekStarts, weekEnds);

  // Create options for other date ranges
  const options = createDateRangeOptions(
    weekStarts,
    weekEnds,
    days,
    wantedDay,
    startOfCurrentWeek,
    departureCount,
    isMerged,
  );

  // Calculate the current range information
  const range = calculateCurrentRange(
    wantedDay,
    weekStarts,
    weekEnds,
    days,
    startOfCurrentWeek,
    departureCount,
    isMerged,
  );

  // Set pastDate if not already set
  const pastDate =
    calculatedPastDate ||
    startOfCurrentWeek.plus({ days: dataExistsDay - 1 }).toFormat(DATE_FORMAT);

  return [
    weekStarts,
    days,
    range,
    options.filter(o => !emptyWeek.includes(o.value)),
    currentAndNextWeekAreSame,
    pastDate,
  ];
};

/**
 * Calculate the appropriate service day for display
 * @param {DateTime} wantedDay - The requested service day
 * @param {Array} data - The populated schedule data array
 * @param {DateTime} firstDataDate - First date with available data
 * @returns {DateTime|undefined} Calculated service day or undefined
 */
export const calculateServiceDay = (wantedDay, data, firstDataDate) => {
  if (wantedDay || !data || data.length < 3) {
    return undefined;
  }

  const range = data[DATA_INDEX.RANGE];
  const dayArray = range?.[RANGE_INDEX.DAY_ARRAY];
  const currentWeekday = range?.[RANGE_INDEX.WEEKDAY];
  const wantedDayValue = range?.[RANGE_INDEX.WANTED_DAY];
  const options = data[DATA_INDEX.OPTIONS];
  const weekStarts = data[DATA_INDEX.WEEK_STARTS];

  let serviceDay;

  // Check if current weekday doesn't match first day in array
  if (dayArray && dayArray !== '') {
    if (currentWeekday !== dayArray[0]?.charAt(0)) {
      serviceDay = DateTime.now()
        .startOf('week')
        .plus({ days: Number(dayArray[0]?.charAt(0)) - 1 });
    }
  } else if (
    options?.[0] &&
    wantedDayValue &&
    wantedDayValue < weekStarts?.[0]
  ) {
    serviceDay = DateTime.fromFormat(options[0].value, DATE_FORMAT);
  }

  // Don't redirect to a date later than first available data
  if (serviceDay && serviceDay > firstDataDate) {
    return firstDataDate;
  }

  return serviceDay;
};
