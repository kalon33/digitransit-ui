/**
 * Trip processing utilities for schedule components
 * Handles trip sorting, filtering, and display logic
 */
import React from 'react';
import { DateTime } from 'luxon';
import { DATE_FORMAT } from '../constants';
import { routePagePath, PREFIX_TIMETABLE } from './path';

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
 * Get and process trips for display
 * Handles testing mode internally by checking query params
 * @param {Object} params - Trip processing parameters
 * @param {Object} params.pattern - Pattern object with trips
 * @param {DateTime} params.newServiceDay - New service day for redirect
 * @param {Object} params.match - Router match object
 * @param {Object} params.intl - Internationalization object
 * @returns {Object} { trips: Array|null, redirectPath: string|null, noTripsMessage: JSX|null }
 */
export const getTripsList = ({ pattern, newServiceDay, match, intl }) => {
  // Handle testing mode internally
  const testing = process.env.ROUTEPAGETESTING || false;
  const testNum = testing && match?.location?.query?.test;

  let currentPattern = pattern;
  let queryParams = newServiceDay
    ? `?serviceDay=${newServiceDay.toFormat(DATE_FORMAT)}`
    : '';

  // Apply test mode filtering if enabled
  if (testing && testNum && currentPattern) {
    currentPattern = {
      ...currentPattern,
      trips: currentPattern.trips?.filter((s, i) => i < 2),
    };
    queryParams = queryParams.concat(`&test=${testNum}`);
  }

  const trips = sortTrips(currentPattern?.trips);

  // Redirect if no trips and new service day is specified
  if (trips && trips.length === 0 && newServiceDay) {
    return {
      trips: null,
      redirectPath: routePagePath(
        match.params.routeId,
        PREFIX_TIMETABLE,
        currentPattern.code,
        null,
        queryParams,
      ),
      noTripsMessage: null,
    };
  }

  // Show no trips message
  if (trips && trips.length === 0) {
    const day = match.location.query?.serviceDay
      ? DateTime.fromFormat(
          match.location.query.serviceDay,
          DATE_FORMAT,
        ).toFormat('d.L.yyyy')
      : '';
    return {
      trips: null,
      redirectPath: null,
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
    redirectPath: null,
    noTripsMessage: null,
  };
};
