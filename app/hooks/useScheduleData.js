/**
 * Custom hook for processing schedule data
 * Handles data transformation, merging, and population logic
 */
import getTestData from '../component/routepage/schedule/ScheduleDebugData';

/**
 * Process and merge schedule data
 * Handles testing mode internally by checking query params
 * @param {Object} firstDeparturesProp - Raw first departures data
 * @param {Object} match - Router match object for accessing query params
 * @returns {Object} { firstDepartures }
 */
export const useScheduleData = ({ firstDeparturesProp, match }) => {
  const testing = process.env.ROUTEPAGETESTING || false;
  const testNum = testing && match?.location?.query?.test;
  const testData = testing && testNum ? getTestData(testNum) : null;

  return {
    firstDepartures: testing && testNum ? testData : firstDeparturesProp,
  };
};
