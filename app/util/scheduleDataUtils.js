import { DateTime } from 'luxon';
import { DATE_FORMAT } from '../constants';

const DATE_FORMAT_SCHEDULE = 'd.L.yyyy';

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

const buildAvailableDates = (departures, startOfCurrentWeek) => {
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

const buildDateOptions = (availableDates, selectedDay) => {
  const selectedKey = selectedDay?.toFormat(DATE_FORMAT);

  return availableDates
    .filter(date => date.toFormat(DATE_FORMAT) !== selectedKey)
    .map(date => ({
      label: date.toFormat(DATE_FORMAT_SCHEDULE),
      value: date.toFormat(DATE_FORMAT),
      date,
    }));
};

/**
 * Populate and process departure data to display schedule information and options.
 * @param {DateTime} wantedDayIn - The date to display schedule for
 * @param {Object} departures - Departures object keyed by wk{n}{day}
 * @returns {Object} {
 *   dates: Array<DateTime>,
 *   range: { timeRange: string, wantedDay: DateTime, weekday: number },
 *   options: Array,
 *   meta: { firstServiceDay: DateTime }
 * }
 */
export const populateData = (wantedDayIn, departures) => {
  const wantedDay =
    wantedDayIn && wantedDayIn.isValid ? wantedDayIn : DateTime.now();
  const startOfCurrentWeek = DateTime.now().startOf('week');

  const availableDates = buildAvailableDates(departures, startOfCurrentWeek);

  const selectedDay =
    (wantedDayIn && wantedDayIn.isValid && wantedDayIn) ||
    availableDates.find(date => date.hasSame(wantedDay, 'day')) ||
    availableDates[0] ||
    wantedDay;

  const optionsWithDates = buildDateOptions(availableDates, selectedDay);

  const range = {
    timeRange: selectedDay.toFormat(DATE_FORMAT_SCHEDULE),
    wantedDay: selectedDay,
    weekday: selectedDay.weekday,
  };

  const firstServiceDay = availableDates[0] || selectedDay;

  return {
    dates: availableDates,
    range,
    options: optionsWithDates,
    meta: {
      firstServiceDay,
    },
  };
};
