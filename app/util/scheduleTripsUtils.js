/**
 * Trip processing utilities for schedule components
 * Handles trip sorting, filtering, and display logic
 */
import React from 'react';
import { DateTime } from 'luxon';
import { DATE_FORMAT } from '../constants';

/**
 * Sort trips by scheduled departure time
 * @param {Array} trips - Array of trip objects
 * @returns {Array|null} Sorted trips or null
 */
export const sortTrips = trips => {
  if (!trips) {
    return null;
  }

  return [...trips].sort((a, b) => {
    const aHasStoptimes = Array.isArray(a.stoptimes) && a.stoptimes.length > 0;
    const bHasStoptimes = Array.isArray(b.stoptimes) && b.stoptimes.length > 0;

    if (!bHasStoptimes) {
      return -1;
    }
    if (!aHasStoptimes) {
      return 1;
    }

    return (
      a.stoptimes[0].scheduledDeparture - b.stoptimes[0].scheduledDeparture
    );
  });
};

/**
 * Get and process trips for display.
 * Handles testing mode internally by checking query params.
 * @param {Object} params - Trip processing parameters
 * @param {Object} params.pattern - Pattern object with trips
 * @param {DateTime} params.firstDataDate - First date with available data (optional)
 * @param {Object} params.match - Router match object
 * @param {Object} params.intl - Internationalization object
 * @returns {Object} { trips: Array|null, noTripsMessage: JSX|null }
 */
export const getTripsList = ({ pattern, firstDataDate, match, intl }) => {
  // Handle testing mode internally
  const testing = process.env.ROUTEPAGETESTING || false;
  const testNum = testing && match?.location?.query?.test;

  let currentPattern = pattern;

  // Apply test mode filtering if enabled
  if (testing && testNum && currentPattern) {
    currentPattern = {
      ...currentPattern,
      trips: currentPattern.trips?.filter((s, i) => i < 2),
    };
  }

  const trips = sortTrips(currentPattern?.trips);

  if (trips && trips.length === 0) {
    // Return null with no message if another service day is available
    if (firstDataDate) {
      return {
        trips: null,
        noTripsMessage: null,
      };
    }
    // Show no trips message
    const day = match.location.query?.serviceDay
      ? DateTime.fromFormat(
          match.location.query.serviceDay,
          DATE_FORMAT,
        ).toFormat('d.L.yyyy')
      : '';
    return {
      trips: null,
      noTripsMessage: (
        <div className="text-center">
          {intl.formatMessage(
            {
              id: 'no-trips-found',
              defaultMessage: `No journeys found for the selected date ${day}`,
            },
            {
              selectedDate: day,
            },
          )}
        </div>
      ),
    };
  }

  return {
    trips,
    noTripsMessage: null,
  };
};
