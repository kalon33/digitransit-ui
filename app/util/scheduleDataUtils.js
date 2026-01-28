import { DateTime } from 'luxon';
import sortBy from 'lodash/sortBy';
import isEqual from 'lodash/isEqual';
import { DATE_FORMAT } from '../constants';
import hashCode from './hashUtil';

const DATE_FORMAT_SCHEDULE = 'd.L.yyyy';
const DAYS_IN_WEEK = 7;
const EMPTY_WEEK_PATTERN = ['1234567', 0, ''];

export const DATA_INDEX = {
  WEEK_STARTS: 0,
  DAYS: 1,
  RANGE: 2,
  OPTIONS: 3,
  WEEKS_ARE_SAME: 4,
  PAST_DATE: 5,
};

export const RANGE_INDEX = {
  TIME_RANGE: 0,
  WANTED_DAY: 1,
  WEEKDAY: 2,
  DAY_ARRAY: 3,
  WEEK_START: 4,
};

/**
 * Find the most frequent pattern in an array of departures
 */
export const getMostFrequent = arr => {
  const frequencyMap = new Map();

  // Count frequency of each pattern
  arr.forEach(val => {
    const hash = hashCode(val.map(v => v[0]).join());
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
    const hash = hashCode(item.map(v => v[0]).join());
    return hash === mostFrequentHash;
  });
};

/**
 * Modify departures data by grouping and sorting by week
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
      const departurePattern = dayDepartures
        .map(x => x.departureStoptime.scheduledDeparture)
        .join(',');
      const hash = hashCode(departurePattern);

      if (!groupedByPattern[hash]) {
        groupedByPattern[hash] = ['', hash, departurePattern];
      }
      groupedByPattern[hash][0] += dayIndex + 1;
    });

    modifiedDepartures.push(Object.values(groupedByPattern).sort());
  }

  return modifiedDepartures.length > 0 ? modifiedDepartures : departures;
};

/**
 * Check if a week has no departures
 */
export const isEmptyWeek = departures => {
  if (!departures || departures.length === 0 || !departures[0]) {
    return false;
  }
  const [days, count, pattern] = departures[0];
  return (
    days === EMPTY_WEEK_PATTERN[0] &&
    count === EMPTY_WEEK_PATTERN[1] &&
    pattern === EMPTY_WEEK_PATTERN[2]
  );
};

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
 * Initialize week structures for the given departure data
 */
const initializeWeekStructures = (departures, startOfCurrentWeek) => {
  const weekStarts = [];
  const weekEnds = [];
  const days = [];
  const emptyWeek = [];

  for (let weekIdx = 0; weekIdx < departures.length; weekIdx++) {
    weekStarts.push(startOfCurrentWeek.plus({ weeks: weekIdx }));
    weekEnds.push(startOfCurrentWeek.endOf('week').plus({ weeks: weekIdx }));
    days.push([]);

    if (isEmptyWeek(departures[weekIdx])) {
      emptyWeek.push(
        startOfCurrentWeek.plus({ weeks: weekIdx }).toFormat(DATE_FORMAT),
      );
    }
  }

  return { weekStarts, weekEnds, days, emptyWeek };
};

/**
 * Filter out empty departures and populate day data
 */
const processEmptyDepartures = (departures, days) => {
  const indexToRemove = [];
  let notEmptyWeekFound = false;

  departures.forEach((weekDepartures, idx) => {
    if (weekDepartures.length === 0) {
      indexToRemove.push(idx);
      return;
    }

    const hasSingleEmptyEntry =
      weekDepartures.length === 1 && weekDepartures[0][1] === 0;

    if (hasSingleEmptyEntry && !notEmptyWeekFound) {
      indexToRemove.push(idx);
    } else {
      if (!hasSingleEmptyEntry) {
        notEmptyWeekFound = true;
      }

      // Filter out days with no departures and collect day numbers
      const daysWithDepartures = weekDepartures.filter(day => day[1] !== 0);
      daysWithDepartures.forEach(day => {
        days[idx].push(day[0]);
      });
    }
  });

  return indexToRemove;
};

/**
 * Remove items at specified indices from multiple arrays
 */
const removeIndicesFromArrays = (indices, ...arrays) => {
  // Sort in descending order to avoid index shifting issues
  const sortedIndices = [...indices].sort((a, b) => b - a);
  sortedIndices.forEach(i => {
    arrays.forEach(arr => arr.splice(i, 1));
  });
};

/**
 * Find and remove duplicate consecutive departures
 */
const removeDuplicateWeeks = (departures, days, weekStarts, weekEnds) => {
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

/**
 * Create dropdown options for other available date ranges
 */
const createDateRangeOptions = (
  weekStarts,
  weekEnds,
  days,
  wantedDay,
  startOfCurrentWeek,
  departureCount,
  isMerged,
) => {
  const currentDayNo = DateTime.now().weekday;

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
      const shouldAdjustStart =
        weekStart.weekday <= firstServiceDay[0] &&
        departureCount === 1 &&
        (isSameWeek || idx === 0);
      const timeRangeStart = shouldAdjustStart
        ? weekStart.plus({ days: firstServiceDay[0] - 1 })
        : weekStart;

      // Format time range
      const isSingleDay =
        days.length === 1 &&
        days[idx][0]?.length === 1 &&
        wantedDay &&
        !isMerged;
      const timeRange = isSingleDay
        ? wantedDay.toFormat(DATE_FORMAT_SCHEDULE)
        : `${timeRangeStart.toFormat(DATE_FORMAT_SCHEDULE)} - ${weekEnds[
            idx
          ].toFormat(DATE_FORMAT_SCHEDULE)}`;

      // Calculate value for this option
      const isCurrentDayOption =
        idx === 0 &&
        days[idx].indexOf(currentDayNo.toString()) !== -1 &&
        currentDayNo > Number(firstServiceDay);
      const value = isCurrentDayOption
        ? weekStart.plus({ days: currentDayNo - 1 }).toFormat(DATE_FORMAT)
        : weekStart
            .plus({ days: firstServiceDay[0] - 1 })
            .toFormat(DATE_FORMAT);

      return { label: timeRange, value };
    })
    .filter(option => option !== null);
};

/**
 * Populate and process departure data for display
 * @param {DateTime} wantedDayIn - The date to display schedule for
 * @param {Array} departures - Array of departure data by week
 * @param {boolean} isMerged - Whether data has been merged
 * @param {number} dataExistsDay - First day of week with data (1-7)
 * @returns {Array} [weekStarts, days, range, options, currentAndNextWeekAreSame, pastDate]
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
  let pastDate;
  if (
    !currentAndNextWeekAreSame &&
    departures.length > 0 &&
    departures[0].length > 0 &&
    departures[0][0]
  ) {
    const minDayNo = Math.min(...departures[0][0][0].split('').map(Number));
    pastDate = startOfCurrentWeek.plus({ days: minDayNo - 1 });
    weekStarts[0] = currentAndNextWeekAreSame ? startOfCurrentWeek : today;
    if (!currentAndNextWeekAreSame) {
      weekStarts[0] = pastDate;
    }
  } else {
    weekStarts[0] = currentAndNextWeekAreSame ? startOfCurrentWeek : today;
  }

  // Process empty departures and collect indices to remove
  const emptyIndices = processEmptyDepartures(departures, days);
  removeIndicesFromArrays(emptyIndices, weekStarts, weekEnds, days, departures);

  // Remove duplicate consecutive weeks
  removeDuplicateWeeks(departures, days, weekStarts, weekEnds);

  // Create the current range information
  let range = [
    wantedDay.toFormat(DATE_FORMAT_SCHEDULE),
    wantedDay,
    wantedDay.weekday,
    '',
    wantedDay.startOf('week'),
  ];

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

  // Update range if the wanted day falls within a week
  weekStarts.forEach((weekStart, idx) => {
    if (wantedDay >= weekStart && wantedDay <= weekEnds[idx]) {
      const firstServiceDay = days[idx]?.[0];

      // Only update range if we have valid service days
      if (!firstServiceDay) {
        return;
      }

      const isSameWeek = startOfCurrentWeek.hasSame(weekStart, 'week');

      const shouldAdjustStart =
        weekStart.weekday <= firstServiceDay[0] &&
        departureCount === 1 &&
        (isSameWeek || idx === 0);
      const timeRangeStart = shouldAdjustStart
        ? weekStart.plus({ days: firstServiceDay[0] - 1 })
        : weekStart;

      const isSingleDay =
        days.length === 1 &&
        days[idx][0]?.length === 1 &&
        wantedDayIn &&
        !isMerged;
      const timeRange = isSingleDay
        ? wantedDay.toFormat(DATE_FORMAT_SCHEDULE)
        : `${timeRangeStart.toFormat(DATE_FORMAT_SCHEDULE)} - ${weekEnds[
            idx
          ].toFormat(DATE_FORMAT_SCHEDULE)}`;

      range = [
        timeRange,
        wantedDay,
        wantedDay.weekday,
        days[idx],
        weekStarts[idx],
      ];
    }
  });

  // Set pastDate if not already set
  if (!pastDate) {
    pastDate = startOfCurrentWeek
      .plus({ days: dataExistsDay - 1 })
      .toFormat(DATE_FORMAT);
  }

  return [
    weekStarts,
    days,
    range,
    options.filter(o => !emptyWeek.includes(o.value)),
    currentAndNextWeekAreSame,
    pastDate,
  ];
};
