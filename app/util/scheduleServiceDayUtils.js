/**
 * Service day calculation utilities for schedule components
 * Handles complex service day determination logic
 */
import { DateTime } from 'luxon';
import { DATE_FORMAT } from '../constants';

/**
 * Calculate the appropriate new service day for display
 * @param {DateTime} wantedDay - The requested service day (undefined if not specified)
 * @param {Object} data - The populated schedule data object
 * @param {DateTime} firstDataDate - First date with available data
 * @returns {DateTime|undefined} Calculated service day or undefined
 */
export const calculateNewServiceDay = (wantedDay, data, firstDataDate) => {
  // Only calculate if no wanted day is specified and we have valid data
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
    const firstDayInArray = dayArray[0]?.charAt(0);
    if (currentWeekday !== firstDayInArray) {
      serviceDay = DateTime.now()
        .startOf('week')
        .plus({ days: Number(firstDayInArray) - 1 });
    }
  } else if (
    options?.[0] &&
    wantedDayValue &&
    wantedDayValue < weekStarts?.[0]
  ) {
    // Use first option if wanted day is before first week start
    serviceDay =
      options[0].date || DateTime.fromFormat(options[0].value, DATE_FORMAT);
  }

  // Don't redirect to a date later than first available data
  if (serviceDay && serviceDay > firstDataDate) {
    return firstDataDate;
  }

  return serviceDay;
};
