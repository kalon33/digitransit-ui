/**
 * Week processing utilities for schedule data
 * Handles departure data grouping, sorting, and week-level operations
 *
 * @typedef {Object} DeparturePattern
 * @property {string} dayPattern - Days when pattern applies (e.g., '12345' for Mon-Fri)
 * @property {number} hash - Hash code for the departure pattern
 * @property {Array<number>} times - Scheduled departure times (seconds from midnight)
 *
 * @typedef {Object} WeekStructures
 * @property {Array<DateTime>} weekStarts - Start dates for each week
 * @property {Array<DateTime>} weekEnds - End dates for each week
 * @property {Array<{patterns: Array<string>}>} days - Day patterns for each week
 * @property {Array<string>} emptyWeek - Dates of empty weeks
 */
import sortBy from 'lodash/sortBy';
import isEqual from 'lodash/isEqual';
import hashCode from './hashUtil';

const DAYS_IN_WEEK = 7;

// Empty week pattern: all days of week, no departure times
const EMPTY_WEEK_PATTERN = {
  dayPattern: '1234567',
  hash: 0,
  times: [],
};

/**
 * Find the most frequent pattern in an array of departures
 * Used to identify "normal" week pattern for data merging
 * @param {Array<Array<DeparturePattern>>} arr - Array of departure patterns
 * @returns {Array<DeparturePattern>} Most frequent departure pattern
 */
export const getMostFrequent = arr => {
  const frequencyMap = new Map();

  // Count frequency of each pattern
  arr.forEach(val => {
    const hash = hashCode(val.map(v => v.dayPattern).join());
    frequencyMap.set(hash, (frequencyMap.get(hash) || 0) + 1);
  });

  // Find the most frequent hash
  let maxCount = 0;
  let mostFrequentHash = null;
  frequencyMap.forEach((count, hash) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequentHash = hash;
    }
  });

  // Return the first value matching the most frequent hash
  return arr.find(item => {
    const hash = hashCode(item.map(v => v.dayPattern).join());
    return hash === mostFrequentHash;
  });
};

/**
 * Modify departures data by grouping and sorting by week
 * Converts raw departure data into structured weekly patterns
 * @param {Object} departures - Raw departures object with keys like 'wk1mon', 'wk1tue', etc.
 * @returns {Array<Array<DeparturePattern>>} Array of weekly departure patterns
 */
export const modifyDepartures = departures => {
  if (!departures) {
    return departures;
  }

  const departuresCount = Object.entries(departures).length;
  const weeksCount = departuresCount / DAYS_IN_WEEK;
  const modifiedDepartures = [];

  for (let weekNum = 1; weekNum <= weeksCount; weekNum++) {
    const weekKeyPrefix = `wk${weekNum}`;
    const weekKeyLength = weekKeyPrefix.length + 3; // e.g., 'wk1mon' = 6 chars

    // Collect and sort all departures for this week
    const weekData = {};
    Object.entries(departures).forEach(([key, value]) => {
      if (key.length === weekKeyLength && key.startsWith(weekKeyPrefix)) {
        weekData[key] = sortBy(value, 'departureStoptime.scheduledDeparture');
      }
    });

    // Group by departure pattern hash
    const groupedByPattern = {};
    Object.values(weekData).forEach((dayDepartures, dayIndex) => {
      const times = dayDepartures.map(
        x => x.departureStoptime.scheduledDeparture,
      );
      const timesKey = times.join(',');
      const hash = hashCode(timesKey);

      if (!groupedByPattern[hash]) {
        groupedByPattern[hash] = { dayPattern: '', hash, times };
      }
      groupedByPattern[hash].dayPattern += dayIndex + 1;
    });

    modifiedDepartures.push(
      Object.values(groupedByPattern).sort((a, b) =>
        a.dayPattern.localeCompare(b.dayPattern),
      ),
    );
  }

  return modifiedDepartures.length > 0 ? modifiedDepartures : departures;
};

/**
 * Check if a week has no departures
 * @param {Array<DeparturePattern>} departures - Week departure data
 * @returns {boolean} True if week is empty
 */
export const isEmptyWeek = departures => {
  if (!departures || departures.length === 0 || !departures[0]) {
    return false;
  }
  const { dayPattern, hash, times } = departures[0];
  return (
    dayPattern === EMPTY_WEEK_PATTERN.dayPattern &&
    hash === EMPTY_WEEK_PATTERN.hash &&
    times.length === EMPTY_WEEK_PATTERN.times.length
  );
};

/**
 * Initialize week structures for the given departure data
 * @param {Array<Array<DeparturePattern>>} departures - Departure data array
 * @param {DateTime} startOfCurrentWeek - Start of current week
 * @returns {WeekStructures} Week structures object
 */
export const initializeWeekStructures = (departures, startOfCurrentWeek) => {
  const weekStarts = [];
  const weekEnds = [];
  const days = [];
  const emptyWeek = [];

  for (let weekIdx = 0; weekIdx < departures.length; weekIdx++) {
    weekStarts.push(startOfCurrentWeek.plus({ weeks: weekIdx }));
    weekEnds.push(startOfCurrentWeek.endOf('week').plus({ weeks: weekIdx }));
    days.push({ patterns: [] });

    if (isEmptyWeek(departures[weekIdx])) {
      emptyWeek.push(
        startOfCurrentWeek.plus({ weeks: weekIdx }).toFormat('yyyy-MM-dd'),
      );
    }
  }

  return { weekStarts, weekEnds, days, emptyWeek };
};

/**
 * Filter out empty departures and populate day data
 * @param {Array<Array<DeparturePattern>>} departures - Departure data array
 * @param {Array} days - Days array to populate
 * @returns {Array<number>} Indices to remove
 */
export const processEmptyDepartures = (departures, days) => {
  const indexToRemove = [];
  let notEmptyWeekFound = false;

  departures.forEach((weekDepartures, idx) => {
    if (weekDepartures.length === 0) {
      indexToRemove.push(idx);
      return;
    }

    const hasSingleEmptyEntry =
      weekDepartures.length === 1 &&
      weekDepartures[0].hash === 0 &&
      weekDepartures[0].times.length === 0;

    if (hasSingleEmptyEntry && !notEmptyWeekFound) {
      indexToRemove.push(idx);
    } else {
      if (!hasSingleEmptyEntry) {
        notEmptyWeekFound = true;
      }

      // Filter out days with no departures and collect day numbers
      const daysWithDepartures = weekDepartures.filter(
        day => day.times.length > 0,
      );
      daysWithDepartures.forEach(day => {
        days[idx].patterns.push(day.dayPattern);
      });
    }
  });

  return indexToRemove;
};

/**
 * Remove items at specified indices from multiple arrays
 * @param {Array<number>} indices - Indices to remove
 * @param {...Array} arrays - Arrays to modify
 */
export const removeIndicesFromArrays = (indices, ...arrays) => {
  // Sort in descending order to avoid index shifting issues
  const sortedIndices = [...indices].sort((a, b) => b - a);
  sortedIndices.forEach(i => {
    arrays.forEach(arr => arr.splice(i, 1));
  });
};

/**
 * Find and remove duplicate consecutive departures
 * @param {Array} departures - Departure data array
 * @param {Array} days - Days array
 * @param {Array} weekStarts - Week start dates array
 * @param {Array} weekEnds - Week end dates array
 */
export const removeDuplicateWeeks = (
  departures,
  days,
  weekStarts,
  weekEnds,
) => {
  const duplicateIndices = [];

  departures.forEach((weekDepartures, idx) => {
    if (idx > 0 && isEqual(departures[idx - 1], weekDepartures)) {
      duplicateIndices.push(idx);
    }
  });

  duplicateIndices.sort((a, b) => b - a);
  duplicateIndices.forEach(i => {
    days.splice(i, 1);
    weekStarts.splice(i, 1);
    weekEnds.splice(i - 1, 1);
  });
};
