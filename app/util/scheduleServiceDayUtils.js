/**
 * Service day calculation utilities for schedule components
 * Handles complex service day determination logic
 */
import { DateTime } from 'luxon';
import { DATE_FORMAT } from '../constants';
import { DATA_INDEX, RANGE_INDEX } from './scheduleDataUtils';

/**
 * Calculate the appropriate new service day for display
 * @param {DateTime} wantedDay - The requested service day (undefined if not specified)
 * @param {Array} data - The populated schedule data array
 * @param {DateTime} firstDataDate - First date with available data
 * @returns {DateTime|undefined} Calculated service day or undefined
 */
export const calculateNewServiceDay = (wantedDay, data, firstDataDate) => {
  // Only calculate if no wanted day is specified and we have valid data
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
    serviceDay = DateTime.fromFormat(options[0].value, DATE_FORMAT);
  }

  // Don't redirect to a date later than first available data
  if (serviceDay && serviceDay > firstDataDate) {
    return firstDataDate;
  }

  return serviceDay;
};
