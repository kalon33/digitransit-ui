import { expect } from 'chai';
import { describe, it } from 'mocha';
import { DateTime } from 'luxon';
import {
  getFirstDepartureDate,
  populateData,
  DATA_INDEX,
  RANGE_INDEX,
} from '../../../app/util/scheduleDataUtils';
import {
  modifyDepartures,
  isEmptyWeek,
  getMostFrequent,
} from '../../../app/util/scheduleWeekProcessing';

describe('scheduleDataUtils', () => {
  describe('getMostFrequent', () => {
    it('should return the most frequent pattern', () => {
      const arr = [
        [['1234567', 123, '25200,26400']],
        [['1234567', 123, '25200,26400']],
        [['1234567', 456, '28800,30000']],
      ];

      const result = getMostFrequent(arr);
      expect(result).to.deep.equal([['1234567', 123, '25200,26400']]);
    });

    it('should handle single element array', () => {
      const arr = [[['12345', 100, '25200']]];
      const result = getMostFrequent(arr);
      expect(result).to.deep.equal([['12345', 100, '25200']]);
    });

    it('should handle all different patterns', () => {
      const arr = [
        [['1', 100, '25200']],
        [['2', 200, '26400']],
        [['3', 300, '27600']],
      ];

      const result = getMostFrequent(arr);
      expect(result).to.not.equal(undefined);
      expect(result).to.be.an('array');
    });

    it('should return first when there is a tie', () => {
      const arr = [[['1', 100, '25200']], [['2', 200, '26400']]];

      const result = getMostFrequent(arr);
      expect(result).to.not.equal(undefined);
    });
  });

  describe('modifyDepartures', () => {
    it('should modify departures with proper structure', () => {
      const departures = {
        wk1mon: [
          {
            departureStoptime: { scheduledDeparture: 28800 },
          },
        ],
        wk1tue: [
          {
            departureStoptime: { scheduledDeparture: 28800 },
          },
        ],
        wk1wed: [
          {
            departureStoptime: { scheduledDeparture: 28800 },
          },
        ],
        wk1thu: [
          {
            departureStoptime: { scheduledDeparture: 28800 },
          },
        ],
        wk1fri: [
          {
            departureStoptime: { scheduledDeparture: 28800 },
          },
        ],
        wk1sat: [
          {
            departureStoptime: { scheduledDeparture: 32400 },
          },
        ],
        wk1sun: [
          {
            departureStoptime: { scheduledDeparture: 32400 },
          },
        ],
      };

      const result = modifyDepartures(departures);
      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(1); // 1 week
      expect(result[0]).to.be.an('array');
    });

    it('should return unmodified data when departures is null', () => {
      const result = modifyDepartures(null);
      expect(result).to.equal(null);
    });

    it('should handle empty departures', () => {
      const departures = {
        wk1mon: [],
        wk1tue: [],
        wk1wed: [],
        wk1thu: [],
        wk1fri: [],
        wk1sat: [],
        wk1sun: [],
      };

      const result = modifyDepartures(departures);
      expect(result).to.be.an('array');
    });

    it('should handle multiple weeks of departures', () => {
      const departures = {
        wk1mon: [{ departureStoptime: { scheduledDeparture: 28800 } }],
        wk1tue: [{ departureStoptime: { scheduledDeparture: 28800 } }],
        wk1wed: [{ departureStoptime: { scheduledDeparture: 28800 } }],
        wk1thu: [{ departureStoptime: { scheduledDeparture: 28800 } }],
        wk1fri: [{ departureStoptime: { scheduledDeparture: 28800 } }],
        wk1sat: [{ departureStoptime: { scheduledDeparture: 32400 } }],
        wk1sun: [{ departureStoptime: { scheduledDeparture: 32400 } }],
        wk2mon: [{ departureStoptime: { scheduledDeparture: 28800 } }],
        wk2tue: [{ departureStoptime: { scheduledDeparture: 28800 } }],
        wk2wed: [{ departureStoptime: { scheduledDeparture: 28800 } }],
        wk2thu: [{ departureStoptime: { scheduledDeparture: 28800 } }],
        wk2fri: [{ departureStoptime: { scheduledDeparture: 28800 } }],
        wk2sat: [{ departureStoptime: { scheduledDeparture: 32400 } }],
        wk2sun: [{ departureStoptime: { scheduledDeparture: 32400 } }],
      };

      const result = modifyDepartures(departures);
      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(2); // 2 weeks
    });

    it('should sort departures by scheduledDeparture', () => {
      const departures = {
        wk1mon: [
          { departureStoptime: { scheduledDeparture: 32400 } },
          { departureStoptime: { scheduledDeparture: 28800 } },
          { departureStoptime: { scheduledDeparture: 30600 } },
        ],
        wk1tue: [],
        wk1wed: [],
        wk1thu: [],
        wk1fri: [],
        wk1sat: [],
        wk1sun: [],
      };

      const result = modifyDepartures(departures);
      expect(result).to.be.an('array');
      expect(result[0]).to.be.an('array');
    });
  });

  describe('isEmptyWeek', () => {
    it('should return true for empty week pattern', () => {
      const departures = [['1234567', 0, '']];
      expect(isEmptyWeek(departures)).to.equal(true);
    });

    it('should return false for non-empty week', () => {
      const departures = [['12345', 10, '28800,30600']];
      expect(isEmptyWeek(departures)).to.equal(false);
    });

    it('should return false for null departures', () => {
      expect(isEmptyWeek(null)).to.equal(false);
    });

    it('should return false for empty array', () => {
      expect(isEmptyWeek([])).to.equal(false);
    });

    it('should return false when first element is missing', () => {
      const departures = [null, ['1234567', 0, '']];
      expect(isEmptyWeek(departures)).to.equal(false);
    });

    it('should handle partially matching pattern', () => {
      const departures = [['1234567', 0, 'notEmpty']];
      expect(isEmptyWeek(departures)).to.equal(false);
    });
  });

  describe('getFirstDepartureDate', () => {
    it('should return undefined for empty departures', () => {
      const result = getFirstDepartureDate([]);
      expect(result).to.equal(undefined);
    });

    it('should return undefined for null departures', () => {
      const result = getFirstDepartureDate(null);
      expect(result).to.equal(undefined);
    });

    it('should return date when current day has departures', () => {
      const date = DateTime.fromISO('2024-01-15'); // Monday
      const departures = [['1', 10, '28800']]; // Monday has departures

      const result = getFirstDepartureDate(departures, date);
      expect(result).to.not.equal(undefined);
    });

    it('should return undefined when no day matches', () => {
      const date = DateTime.fromISO('2024-01-15'); // Monday (weekday = 1)
      const departures = [['7', 10, '28800']]; // Only Sunday has departures

      const result = getFirstDepartureDate(departures, date);
      expect(result).to.equal(undefined);
    });

    it('should check previous day when current day has no departures', () => {
      const date = DateTime.fromISO('2024-01-16'); // Tuesday (weekday = 2)
      const departures = [
        ['1', 10, '28800'], // Monday has departures
        ['2', 0, ''], // Tuesday has no departures
      ];

      const result = getFirstDepartureDate(departures, date);
      expect(result).to.not.equal(undefined);
    });

    it('should return today when first day and in current week', () => {
      const now = DateTime.now();
      const departures = [[now.weekday.toString(), 10, '28800']];

      const result = getFirstDepartureDate(departures, now);
      expect(result).to.not.equal(undefined);
      expect(result.hasSame(DateTime.now(), 'day')).to.equal(true);
    });

    it('should return undefined when first day has no departures', () => {
      const date = DateTime.fromISO('2024-01-15'); // Monday
      const departures = [['1', 0, '']]; // Monday has no departures

      const result = getFirstDepartureDate(departures, date);
      expect(result).to.equal(undefined);
    });
  });

  describe('populateData', () => {
    it('should populate data with proper structure', () => {
      const wantedDay = DateTime.fromISO('2024-01-15');
      const departures = [[['1234567', 10, '28800,30600']]];

      const result = populateData(wantedDay, departures, false, 1);

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(6);
      expect(result[DATA_INDEX.WEEK_STARTS]).to.be.an('array');
      expect(result[DATA_INDEX.DAYS]).to.be.an('array');
      expect(result[DATA_INDEX.RANGE]).to.be.an('array');
      expect(result[DATA_INDEX.OPTIONS]).to.be.an('array');
      expect(result[DATA_INDEX.WEEKS_ARE_SAME]).to.be.a('boolean');
    });

    it('should handle single week of departures', () => {
      const wantedDay = DateTime.now();
      const departures = [[['12345', 5, '28800,30600,32400']]];

      const result = populateData(wantedDay, departures, false, 1);

      expect(result[DATA_INDEX.WEEK_STARTS]).to.have.lengthOf(1);
    });

    it('should handle multiple weeks with same schedule', () => {
      const wantedDay = DateTime.now();
      const departures = [
        [['1234567', 10, '28800,30600']],
        [['1234567', 10, '28800,30600']],
      ];

      const result = populateData(wantedDay, departures, false, 1);

      expect(result[DATA_INDEX.WEEKS_ARE_SAME]).to.equal(true);
    });

    it('should handle multiple weeks with different schedules', () => {
      const wantedDay = DateTime.now();
      const departures = [
        [['12345', 10, '28800,30600']],
        [['67', 5, '32400,34200']],
      ];

      const result = populateData(wantedDay, departures, false, 1);

      expect(result[DATA_INDEX.WEEKS_ARE_SAME]).to.equal(false);
    });

    it('should filter out empty weeks', () => {
      const wantedDay = DateTime.now();
      const departures = [[], [['1234567', 10, '28800,30600']]];

      const result = populateData(wantedDay, departures, false, 1);

      expect(result[DATA_INDEX.WEEK_STARTS].length).to.be.at.most(
        departures.length,
      );
    });

    it('should create proper date range in range data', () => {
      const wantedDay = DateTime.fromISO('2024-01-15');
      const departures = [[['1234567', 10, '28800,30600']]];

      const result = populateData(wantedDay, departures, false, 1);
      const range = result[DATA_INDEX.RANGE];

      expect(range[RANGE_INDEX.TIME_RANGE]).to.be.a('string');
      expect(range[RANGE_INDEX.WANTED_DAY]).to.deep.equal(wantedDay);
      expect(range[RANGE_INDEX.WEEKDAY]).to.equal(wantedDay.weekday);
      expect(range[RANGE_INDEX.DAY_ARRAY]).to.not.equal(undefined);
      expect(range[RANGE_INDEX.WEEK_START]).to.not.equal(undefined);
    });

    it('should create options for other date ranges', () => {
      const wantedDay = DateTime.now().startOf('week');
      const departures = [
        [['1234567', 10, '28800,30600']],
        [['1234567', 10, '28800,30600']],
        [['1234567', 10, '28800,30600']],
      ];

      const result = populateData(wantedDay, departures, false, 1);

      expect(result[DATA_INDEX.OPTIONS]).to.be.an('array');
    });

    it('should handle merged data flag', () => {
      const wantedDay = DateTime.now();
      const departures = [[['1234567', 10, '28800,30600']]];

      const result = populateData(wantedDay, departures, true, 2);

      expect(result).to.not.equal(undefined);
      expect(result[DATA_INDEX.PAST_DATE]).to.not.equal(undefined);
    });

    it('should handle different dataExistsDay values', () => {
      const wantedDay = DateTime.now();
      const departures = [[['234567', 10, '28800,30600']]]; // Starts on Tuesday

      const result = populateData(wantedDay, departures, false, 2);

      expect(result).to.not.equal(undefined);
      expect(result[DATA_INDEX.PAST_DATE]).to.not.equal(undefined);
    });

    it('should use current date when wantedDay is not provided', () => {
      const departures = [[['1234567', 10, '28800,30600']]];

      const result = populateData(undefined, departures, false, 1);

      expect(result).to.not.equal(undefined);
      const range = result[DATA_INDEX.RANGE];
      expect(
        range[RANGE_INDEX.WANTED_DAY].hasSame(DateTime.now(), 'day'),
      ).to.equal(true);
    });

    it('should handle empty departure arrays in weeks', () => {
      const wantedDay = DateTime.now();
      const departures = [[], []];

      const result = populateData(wantedDay, departures, false, 1);

      expect(result).to.not.equal(undefined);
      expect(result[DATA_INDEX.WEEK_STARTS]).to.be.an('array');
    });

    it('should remove duplicate consecutive weeks', () => {
      const wantedDay = DateTime.now();
      const departures = [
        [['1234567', 10, '28800,30600']],
        [['1234567', 10, '28800,30600']],
        [['1234567', 10, '28800,30600']],
      ];

      const result = populateData(wantedDay, departures, false, 1);

      // Should collapse duplicate consecutive weeks
      expect(result[DATA_INDEX.WEEK_STARTS]).to.be.an('array');
    });

    it('should handle weeks with only some days having departures', () => {
      const wantedDay = DateTime.now();
      const departures = [
        [
          ['1', 5, '28800,30600'],
          ['23', 0, ''],
          ['4567', 8, '32400,34200'],
        ],
      ];

      const result = populateData(wantedDay, departures, false, 1);

      expect(result).to.not.equal(undefined);
      expect(result[DATA_INDEX.DAYS]).to.be.an('array');
    });
  });

  describe('DATA_INDEX constants', () => {
    it('should have correct index values', () => {
      expect(DATA_INDEX.WEEK_STARTS).to.equal(0);
      expect(DATA_INDEX.DAYS).to.equal(1);
      expect(DATA_INDEX.RANGE).to.equal(2);
      expect(DATA_INDEX.OPTIONS).to.equal(3);
      expect(DATA_INDEX.WEEKS_ARE_SAME).to.equal(4);
      expect(DATA_INDEX.PAST_DATE).to.equal(5);
    });
  });

  describe('RANGE_INDEX constants', () => {
    it('should have correct index values', () => {
      expect(RANGE_INDEX.TIME_RANGE).to.equal(0);
      expect(RANGE_INDEX.WANTED_DAY).to.equal(1);
      expect(RANGE_INDEX.WEEKDAY).to.equal(2);
      expect(RANGE_INDEX.DAY_ARRAY).to.equal(3);
      expect(RANGE_INDEX.WEEK_START).to.equal(4);
    });
  });
});
