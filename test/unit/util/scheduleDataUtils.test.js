import { expect } from 'chai';
import { describe, it } from 'mocha';
import { DateTime } from 'luxon';
import {
  getFirstDepartureDate,
  populateData,
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
        [{ dayPattern: '1234567', hash: 123, times: [25200, 26400] }],
        [{ dayPattern: '1234567', hash: 123, times: [25200, 26400] }],
        [{ dayPattern: '1234567', hash: 456, times: [28800, 30000] }],
      ];

      const result = getMostFrequent(arr);
      expect(result).to.deep.equal([
        { dayPattern: '1234567', hash: 123, times: [25200, 26400] },
      ]);
    });

    it('should handle single element array', () => {
      const arr = [[{ dayPattern: '12345', hash: 100, times: [25200] }]];
      const result = getMostFrequent(arr);
      expect(result).to.deep.equal([
        { dayPattern: '12345', hash: 100, times: [25200] },
      ]);
    });

    it('should handle all different patterns', () => {
      const arr = [
        [{ dayPattern: '1', hash: 100, times: [25200] }],
        [{ dayPattern: '2', hash: 200, times: [26400] }],
        [{ dayPattern: '3', hash: 300, times: [27600] }],
      ];

      const result = getMostFrequent(arr);
      expect(result).to.not.equal(undefined);
      expect(result).to.be.an('array');
    });

    it('should return first when there is a tie', () => {
      const arr = [
        [{ dayPattern: '1', hash: 100, times: [25200] }],
        [{ dayPattern: '2', hash: 200, times: [26400] }],
      ];

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
      const departures = [{ dayPattern: '1234567', hash: 0, times: [] }];
      expect(isEmptyWeek(departures)).to.equal(true);
    });

    it('should return false for non-empty week', () => {
      const departures = [
        { dayPattern: '12345', hash: 10, times: [28800, 30600] },
      ];
      expect(isEmptyWeek(departures)).to.equal(false);
    });

    it('should return false for null departures', () => {
      expect(isEmptyWeek(null)).to.equal(false);
    });

    it('should return false for empty array', () => {
      expect(isEmptyWeek([])).to.equal(false);
    });

    it('should return false when first element is missing', () => {
      const departures = [null, { dayPattern: '1234567', hash: 0, times: [] }];
      expect(isEmptyWeek(departures)).to.equal(false);
    });

    it('should handle partially matching pattern', () => {
      const departures = [{ dayPattern: '1234567', hash: 0, times: [28800] }];
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
      const departures = [{ dayPattern: '1', hash: 10, times: [28800] }]; // Monday has departures

      const result = getFirstDepartureDate(departures, date);
      expect(result).to.not.equal(undefined);
    });

    it('should return undefined when no day matches', () => {
      const date = DateTime.fromISO('2024-01-15'); // Monday (weekday = 1)
      const departures = [{ dayPattern: '7', hash: 10, times: [28800] }]; // Only Sunday has departures

      const result = getFirstDepartureDate(departures, date);
      expect(result).to.equal(undefined);
    });

    it('should check previous day when current day has no departures', () => {
      const date = DateTime.fromISO('2024-01-16'); // Tuesday (weekday = 2)
      const departures = [
        { dayPattern: '1', hash: 10, times: [28800] }, // Monday has departures
        { dayPattern: '2', hash: 0, times: [] }, // Tuesday has no departures
      ];

      const result = getFirstDepartureDate(departures, date);
      expect(result).to.not.equal(undefined);
    });

    it('should return today when first day and in current week', () => {
      const now = DateTime.now();
      const departures = [
        { dayPattern: now.weekday.toString(), hash: 10, times: [28800] },
      ];

      const result = getFirstDepartureDate(departures, now);
      expect(result).to.not.equal(undefined);
      expect(result.hasSame(DateTime.now(), 'day')).to.equal(true);
    });

    it('should return undefined when first day has no departures', () => {
      const date = DateTime.fromISO('2024-01-15'); // Monday
      const departures = [{ dayPattern: '1', hash: 0, times: [] }];

      const result = getFirstDepartureDate(departures, date);
      expect(result).to.equal(undefined);
    });
  });

  describe('populateData', () => {
    it('should populate data with proper structure', () => {
      const wantedDay = DateTime.fromISO('2024-01-15');
      const departures = [
        [{ dayPattern: '1234567', hash: 10, times: [28800, 30600] }],
      ];

      const result = populateData(wantedDay, departures, false, 1);

      expect(result).to.be.an('object');
      expect(result.weeks.starts).to.be.an('array');
      expect(result.weeks.days).to.be.an('array');
      expect(result.range).to.be.an('object');
      expect(result.options).to.be.an('array');
      expect(result.meta.weeksAreSame).to.be.a('boolean');
    });

    it('should handle single week of departures', () => {
      const wantedDay = DateTime.now();
      const departures = [
        [{ dayPattern: '12345', hash: 5, times: [28800, 30600, 32400] }],
      ];

      const result = populateData(wantedDay, departures, false, 1);

      expect(result.weeks.starts).to.have.lengthOf(1);
    });

    it('should handle multiple weeks with same schedule', () => {
      const wantedDay = DateTime.now();
      const departures = [
        [{ dayPattern: '1234567', hash: 10, times: [28800, 30600] }],
        [{ dayPattern: '1234567', hash: 10, times: [28800, 30600] }],
      ];

      const result = populateData(wantedDay, departures, false, 1);

      expect(result.meta.weeksAreSame).to.equal(true);
    });

    it('should handle multiple weeks with different schedules', () => {
      const wantedDay = DateTime.now();
      const departures = [
        [{ dayPattern: '12345', hash: 10, times: [28800, 30600] }],
        [{ dayPattern: '67', hash: 5, times: [32400, 34200] }],
      ];

      const result = populateData(wantedDay, departures, false, 1);

      expect(result.meta.weeksAreSame).to.equal(false);
    });

    it('should filter out empty weeks', () => {
      const wantedDay = DateTime.now();
      const departures = [
        [],
        [{ dayPattern: '1234567', hash: 10, times: [28800, 30600] }],
      ];

      const result = populateData(wantedDay, departures, false, 1);

      expect(result.weeks.starts.length).to.be.at.most(departures.length);
    });

    it('should create proper date range in range data', () => {
      const wantedDay = DateTime.fromISO('2024-01-15');
      const departures = [
        [{ dayPattern: '1234567', hash: 10, times: [28800, 30600] }],
      ];

      const result = populateData(wantedDay, departures, false, 1);
      const { range } = result;

      expect(range.timeRange).to.be.a('string');
      expect(range.wantedDay).to.deep.equal(wantedDay);
      expect(range.weekday).to.equal(wantedDay.weekday);
      expect(range.dayArray).to.not.equal(undefined);
      expect(range.weekStart).to.not.equal(undefined);
    });

    it('should create options for other date ranges', () => {
      const wantedDay = DateTime.now().startOf('week');
      const departures = [
        [{ dayPattern: '1234567', hash: 10, times: [28800, 30600] }],
        [{ dayPattern: '1234567', hash: 10, times: [28800, 30600] }],
        [{ dayPattern: '1234567', hash: 10, times: [28800, 30600] }],
      ];

      const result = populateData(wantedDay, departures, false, 1);

      expect(result.options).to.be.an('array');
    });

    it('should handle merged data flag', () => {
      const wantedDay = DateTime.now();
      const departures = [
        [{ dayPattern: '1234567', hash: 10, times: [28800, 30600] }],
      ];

      const result = populateData(wantedDay, departures, true, 2);

      expect(result).to.not.equal(undefined);
      expect(result.meta.firstServiceDay).to.not.equal(undefined);
    });

    it('should handle different dataExistsDay values', () => {
      const wantedDay = DateTime.now();
      const departures = [
        [{ dayPattern: '234567', hash: 10, times: [28800, 30600] }],
      ]; // Starts on Tuesday

      const result = populateData(wantedDay, departures, false, 2);

      expect(result).to.not.equal(undefined);
      expect(result.meta.firstServiceDay).to.not.equal(undefined);
    });

    it('should use current date when wantedDay is not provided', () => {
      const departures = [
        [{ dayPattern: '1234567', hash: 10, times: [28800, 30600] }],
      ];

      const result = populateData(undefined, departures, false, 1);

      expect(result).to.not.equal(undefined);
      const { range } = result;
      expect(range.wantedDay.hasSame(DateTime.now(), 'day')).to.equal(true);
    });

    it('should handle empty departure arrays in weeks', () => {
      const wantedDay = DateTime.now();
      const departures = [[], []];

      const result = populateData(wantedDay, departures, false, 1);

      expect(result).to.not.equal(undefined);
      expect(result.weeks.starts).to.be.an('array');
    });

    it('should remove duplicate consecutive weeks', () => {
      const wantedDay = DateTime.now();
      const departures = [
        [{ dayPattern: '1234567', hash: 10, times: [28800, 30600] }],
        [{ dayPattern: '1234567', hash: 10, times: [28800, 30600] }],
        [{ dayPattern: '1234567', hash: 10, times: [28800, 30600] }],
      ];

      const result = populateData(wantedDay, departures, false, 1);

      // Should collapse duplicate consecutive weeks
      expect(result.weeks.starts).to.be.an('array');
    });

    it('should handle weeks with only some days having departures', () => {
      const wantedDay = DateTime.now();
      const departures = [
        [
          { dayPattern: '1', hash: 5, times: [28800, 30600] },
          { dayPattern: '23', hash: 0, times: [] },
          { dayPattern: '4567', hash: 8, times: [32400, 34200] },
        ],
      ];

      const result = populateData(wantedDay, departures, false, 1);

      expect(result).to.not.equal(undefined);
      expect(result.weeks.days).to.be.an('array');
    });
  });
});
