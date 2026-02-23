import { DateTime } from 'luxon';
import { DATE_FORMAT } from '../constants';

const WEEKDAY_MAP = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 7,
};

const parseScheduleKey = key => {
  const match = /^wk(\d+)(mon|tue|wed|thu|fri|sat|sun)$/.exec(key);
  if (!match) {
    return null;
  }

  return {
    weekIndex: Number(match[1]),
    dayIndex: WEEKDAY_MAP[match[2]],
  };
};

/**
 * Populate and return the list of available dates.
 * @param {DateTime} wantedDayIn - Preferred date to select (may be invalid)
 * @param {Object} departures - Departures object keyed by wk{n}{day}
 * @returns {Array<DateTime>} Array of available dates
 */
export const buildAvailableDates = departures => {
  // Current week anchor for translating wk{n}{day} keys into dates.
  const startOfCurrentWeek = DateTime.now().startOf('week');

  const dateMap = new Map();

  if (!departures) {
    return [];
  }

  Object.entries(departures).forEach(([key, dayDepartures]) => {
    const parsed = parseScheduleKey(key);
    if (!parsed) {
      return;
    }

    if (!Array.isArray(dayDepartures) || dayDepartures.length === 0) {
      return;
    }

    const date = startOfCurrentWeek.plus({
      weeks: parsed.weekIndex - 1,
      days: parsed.dayIndex - 1,
    });
    const dateKey = date.toFormat(DATE_FORMAT);
    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, date);
    }
  });

  return Array.from(dateMap.values()).sort(
    (a, b) => a.toMillis() - b.toMillis(),
  );
};
