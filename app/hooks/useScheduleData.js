/**
 * Custom hook for processing schedule data
 * Handles data transformation, merging, and population logic
 */
import { useMemo } from 'react';
import { DateTime } from 'luxon';
import {
  modifyDepartures,
  isEmptyWeek,
  getMostFrequent,
} from '../util/scheduleWeekProcessing';
import { populateData } from '../util/scheduleDataUtils';
import getTestData from '../component/routepage/schedule/ScheduleDebugData';

// Day mapping for finding first day with data
const WEEK_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(
  (day, index) => ({
    key: `wk1${day}`,
    day: index + 1, // Monday = 1, Tuesday = 2, Wednesday = 3, etc.
  }),
);

/**
 * Check if week data should be merged with next week
 * @param {Array} thisWeekHashes - Hash array for current week
 * @param {Array} nextWeekHashes - Hash array for typical week
 * @returns {boolean} True if this week is a subset of next week
 */
const shouldMergeWeekData = (thisWeekHashes, nextWeekHashes) => {
  return thisWeekHashes.every(hash => nextWeekHashes.includes(hash));
};

/**
 * Process and merge schedule data
 * Handles testing mode internally by checking query params
 * @param {Object} firstDeparturesProp - Raw first departures data
 * @param {Object} match - Router match object for accessing query params
 * @returns {Object} { firstDepartures, hasMergedData, dataExistsDay, firstWeekEmpty }
 */
export const useScheduleData = ({ firstDeparturesProp, match }) => {
  const processedData = useMemo(() => {
    // Handle testing mode internally
    const testing = process.env.ROUTEPAGETESTING || false;
    const testNum = testing && match?.location?.query?.test;
    const testData = testing && testNum ? getTestData(testNum) : null;

    let dataToHandle;

    if (testing && testNum) {
      dataToHandle = testData;
    } else {
      dataToHandle = firstDeparturesProp;
    }

    const firstDepartures = modifyDepartures(dataToHandle);
    const firstWeekEmpty = isEmptyWeek(firstDepartures[0]);

    let hasMergedData = false;
    let dataExistsDay = 1; // 1 = monday

    // If we are missing data from the start of the week, see if we can merge it with next week
    if (
      !firstWeekEmpty &&
      firstDepartures[0]?.length > 0 &&
      dataToHandle.wk1mon?.length === 0
    ) {
      // Get typical week pattern for comparison
      const thisWeekData = firstDepartures[0];
      const normalWeekData =
        testNum && testNum !== '0'
          ? getMostFrequent(firstDepartures)
          : firstDepartures[1] || firstDepartures[0];

      // Extract hashes using map instead of for loops
      const thisWeekHashes = thisWeekData.map(data => data[1]);
      const nextWeekHashes = normalWeekData.map(data => data[1]);

      // If this week's data is a subset of normal week's data, merge them
      if (shouldMergeWeekData(thisWeekHashes, nextWeekHashes)) {
        firstDepartures[0] = normalWeekData;
        hasMergedData = true;
      }
    }

    // Find first day with data when data is merged
    if (hasMergedData) {
      const firstDayWithData = WEEK_DAYS.find(
        ({ key }) => dataToHandle[key]?.length > 0,
      );
      if (firstDayWithData) {
        dataExistsDay = firstDayWithData.day;
      }
    }

    return {
      firstDepartures,
      hasMergedData,
      dataExistsDay,
      firstWeekEmpty,
    };
  }, [firstDeparturesProp, match]);

  return processedData;
};

/**
 * Custom hook for populating display data from processed schedule data
 * @param {DateTime} wantedDay - The wanted service day
 * @param {Array} firstDepartures - Processed first departures
 * @param {boolean} hasMergedData - Whether data was merged
 * @param {number} dataExistsDay - First day with data (1-7)
 * @returns {Array} Populated data array
 */
export const usePopulatedScheduleData = (
  wantedDay,
  firstDepartures,
  hasMergedData,
  dataExistsDay,
) => {
  return useMemo(
    () =>
      populateData(wantedDay, firstDepartures, hasMergedData, dataExistsDay),
    [wantedDay, firstDepartures, hasMergedData, dataExistsDay],
  );
};

/**
 * Custom hook for calculating first data date
 * @param {boolean} hasMergedData - Whether data was merged
 * @param {number} dataExistsDay - First day with data (1-7)
 * @returns {DateTime} First date with available data
 */
export const useFirstDataDate = (hasMergedData, dataExistsDay) => {
  return useMemo(() => {
    return DateTime.now()
      .startOf('week')
      .plus({ days: dataExistsDay - 1 });
  }, [hasMergedData, dataExistsDay]);
};
