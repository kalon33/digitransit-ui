/**
 * Custom hook for schedule data selection.
 * Swaps in debug data when ROUTEPAGETESTING is enabled.
 */
import getTestData from '../component/routepage/schedule/ScheduleDebugData';

/**
 * Custom hook to select schedule data.
 * Handles testing mode internally by checking query params.
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
