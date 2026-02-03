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
 * Returns the first date with departures from the given departures data
 * @param {Array} departures - Array of departure pattern data
 * @param {DateTime} dateIn - Optional date to check
 * @returns {DateTime|undefined}
 */
export const getFirstDepartureDate = (departures, dateIn) => {
  if (!departures || departures.length === 0) {
    return undefined;
  }

  const date = dateIn || DateTime.now();
  const dayNo = date.weekday;
  // Find the day entry that includes the current weekday. If the entry has
  // no departures, fall back to the previous day (if it has departures).

  const dayIndex = departures.findIndex(departure =>
    departure.dayPattern.includes(dayNo),
  );

  if (dayIndex === -1) {
    return undefined;
  }

  const hasNoDepartures = departures[dayIndex].times.length === 0;

  // Check if we need to look at previous day
  if (dayIndex > 0 && hasNoDepartures) {
    const previousDeparture = departures[dayIndex - 1];
    const hasPreviousDepartures = previousDeparture.times.length > 0;

    if (hasPreviousDepartures) {
      const newDayNo = Number(previousDeparture.dayPattern[0]);
      return date.minus({ days: dayNo - newDayNo });
    }
  }

  // First day with departures
  if (dayIndex === 0 && !hasNoDepartures) {
    return date.hasSame(DateTime.now(), 'week') ? DateTime.now() : date;
  }

  return undefined;
};

/**
 * Populate and process departure data for display
 * This is the main function that orchestrates all data processing for
 * schedule display
 * @param {DateTime} wantedDayIn - The date to display schedule for
 * @param {Array} departures - Array of departure data by week
 * @param {boolean} isMerged - Whether data has been merged
 * @param {number} dataExistsDay - First day of week with data (1-7)
 * @returns {Object} {
 *   weeks: { starts: Array<DateTime>, ends: Array<DateTime>, days: Array<Array<string>> },
 *   range: { timeRange: string, wantedDay: DateTime, weekday: number, dayArray: Array<string>, weekStart: DateTime },
 *   options: Array,
 *   meta: { weeksAreSame: boolean, firstServiceDay: DateTime }
 * }
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

  const { weekStarts, weekEnds, days, emptyWeek } = initializeWeekStructures(
    departures,
    startOfCurrentWeek,
  );

  // Adjust first week start if needed
  const { firstWeekStart, firstServiceDay: calculatedFirstServiceDay } =
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

  // Set firstServiceDay if not already set
  const firstServiceDay =
    calculatedFirstServiceDay ||
    startOfCurrentWeek.plus({ days: dataExistsDay - 1 });

  const optionsWithDates = options
    .filter(o => !emptyWeek.includes(o.value))
    .map(option => ({
      ...option,
      date: option.date || DateTime.fromFormat(option.value, DATE_FORMAT),
    }));

  return {
    weeks: {
      starts: weekStarts,
      ends: weekEnds,
      days,
    },
    range,
    options: optionsWithDates,
    meta: {
      weeksAreSame: currentAndNextWeekAreSame,
      firstServiceDay,
    },
  };
};

/**
 * Calculate the appropriate service day for display
 * @param {DateTime} wantedDay - The requested service day
 * @param {Object} data - The populated schedule data object
 * @param {DateTime} firstDataDate - First date with available data
 * @returns {DateTime|undefined} Calculated service day or undefined
 */
export const calculateServiceDay = (wantedDay, data, firstDataDate) => {
  if (wantedDay || !data || !data.range) {
    return undefined;
  }

  const { range, options, weeks } = data;
  const weekStarts = weeks?.starts;
  const {
    dayArray,
    weekday: currentWeekday,
    wantedDay: wantedDayValue,
  } = range || {};

  let serviceDay;

  // Check if current weekday doesn't match first day in array
  if (Array.isArray(dayArray) && dayArray.length > 0) {
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
    serviceDay =
      options[0].date || DateTime.fromFormat(options[0].value, DATE_FORMAT);
  }

  // Don't redirect to a date later than first available data
  if (serviceDay && serviceDay > firstDataDate) {
    return firstDataDate;
  }

  return serviceDay;
};

/**
 * Helper accessors for schedule data
 * Centralize default shapes for safer access
 */
export const getScheduleRangeData = data =>
  data?.range || {
    timeRange: '',
    wantedDay: null,
    weekday: null,
    dayArray: [],
    weekStart: null,
  };

export const getScheduleOptions = data => data?.options || [];

export const getScheduleMeta = data =>
  data?.meta || { weeksAreSame: false, firstServiceDay: undefined };

export const getScheduleWeeks = data =>
  data?.weeks || { starts: [], ends: [], days: [] };
