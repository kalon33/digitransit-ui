/**
 * Custom hook for processing schedule data
 * Handles data transformation, merging, and population logic
 */
import { useMemo, useRef } from 'react';
import { DateTime } from 'luxon';
import {
  modifyDepartures,
  isEmptyWeek,
  getMostFrequent,
  populateData,
} from '../util/scheduleDataUtils';

/**
 * Process and merge schedule data
 * @param {Object} firstDeparturesProp - Raw first departures data
 * @param {Object} testData - Test data (if testing mode)
 * @param {boolean} testing - Testing mode flag
 * @param {string|number} testNum - Test number
 * @returns {Object} { firstDepartures, hasMergedData, dataExistsDay }
 */
export const useScheduleData = ({
  firstDeparturesProp,
  testData = null,
  testing = false,
  testNum = null,
}) => {
  const hasMergedDataRef = useRef(false);

  const processedData = useMemo(() => {
    let dataToHandle;

    if (testing && testNum) {
      dataToHandle = testData;
    } else {
      dataToHandle = firstDeparturesProp;
    }

    const firstDepartures = modifyDepartures(dataToHandle);
    const firstWeekEmpty = isEmptyWeek(firstDepartures[0]);

    // Reset merged flag
    hasMergedDataRef.current = false;
    let dataExistsDay = 1; // 1 = monday

    // If we are missing data from the start of the week, see if we can merge it with next week
    if (
      !firstWeekEmpty &&
      firstDepartures[0]?.length > 0 &&
      dataToHandle.wk1mon?.length === 0
    ) {
      const [thisWeekData, normalWeekData] =
        Number(testNum) === 0
          ? firstDepartures
          : [firstDepartures[0], getMostFrequent(firstDepartures)];

      // Extract hashes using map instead of for loops
      const thisWeekHashes = thisWeekData.map(data => data[1]);
      const nextWeekHashes = normalWeekData.map(data => data[1]);

      // If this week's data is a subset of normal week's data, merge them
      if (thisWeekHashes.every(hash => nextWeekHashes.includes(hash))) {
        firstDepartures[0] = normalWeekData;
        hasMergedDataRef.current = true;
      }
    }

    // Find first day with data when data is merged
    if (hasMergedDataRef.current) {
      const daysMap = [
        { key: 'wk1tue', day: 2 },
        { key: 'wk1wed', day: 3 },
        { key: 'wk1thu', day: 4 },
        { key: 'wk1fri', day: 5 },
        { key: 'wk1sat', day: 6 },
        { key: 'wk1sun', day: 7 },
      ];

      const firstDayWithData = daysMap.find(
        ({ key }) => dataToHandle[key]?.length > 0,
      );
      if (firstDayWithData) {
        dataExistsDay = firstDayWithData.day;
      }
    }

    return {
      firstDepartures,
      hasMergedData: hasMergedDataRef.current,
      dataExistsDay,
      firstWeekEmpty,
    };
  }, [firstDeparturesProp, testData, testing, testNum]);

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
