import { expect } from 'chai';
import { describe, it } from 'mocha';
import { DateTime } from 'luxon';
import { populateData } from '../../../app/util/scheduleDataUtils';

describe('scheduleDataUtils', () => {
  describe('populateData', () => {
    it('should populate data with proper structure', () => {
      const wantedDay = DateTime.fromISO('2024-01-15');
      const departures = {
        wk1mon: [{ departureStoptime: { scheduledDeparture: 28800 } }],
        wk1tue: [{ departureStoptime: { scheduledDeparture: 30600 } }],
      };

      const result = populateData(wantedDay, departures);

      expect(result).to.be.an('object');
      expect(result.dates).to.be.an('array');
      expect(result.range).to.be.an('object');
      expect(result.options).to.be.an('array');
      expect(result.meta.firstServiceDay).to.not.equal(undefined);
    });

    it('should handle single week of departures', () => {
      const wantedDay = DateTime.now();
      const departures = {
        wk1mon: [{ departureStoptime: { scheduledDeparture: 28800 } }],
        wk1tue: [{ departureStoptime: { scheduledDeparture: 30600 } }],
        wk1wed: [{ departureStoptime: { scheduledDeparture: 32400 } }],
      };

      const result = populateData(wantedDay, departures);

      expect(result.dates).to.have.lengthOf(3);
    });

    it('should handle multiple weeks with same schedule', () => {
      const wantedDay = DateTime.now();
      const departures = {
        wk1mon: [{ departureStoptime: { scheduledDeparture: 28800 } }],
        wk1tue: [{ departureStoptime: { scheduledDeparture: 30600 } }],
        wk2mon: [{ departureStoptime: { scheduledDeparture: 28800 } }],
        wk2tue: [{ departureStoptime: { scheduledDeparture: 30600 } }],
      };

      const result = populateData(wantedDay, departures);

      expect(result.dates).to.have.lengthOf(4);
    });

    it('should handle multiple weeks with different schedules', () => {
      const wantedDay = DateTime.now();
      const departures = {
        wk1mon: [{ departureStoptime: { scheduledDeparture: 28800 } }],
        wk1tue: [{ departureStoptime: { scheduledDeparture: 30600 } }],
        wk2sat: [{ departureStoptime: { scheduledDeparture: 32400 } }],
        wk2sun: [{ departureStoptime: { scheduledDeparture: 34200 } }],
      };

      const result = populateData(wantedDay, departures);

      expect(result.dates).to.be.an('array');
    });

    it('should filter out empty weeks', () => {
      const wantedDay = DateTime.now();
      const departures = {
        wk1mon: [],
        wk1tue: [],
        wk2mon: [{ departureStoptime: { scheduledDeparture: 28800 } }],
      };

      const result = populateData(wantedDay, departures);

      expect(result.dates).to.have.lengthOf(1);
    });

    it('should create proper date range in range data', () => {
      const wantedDay = DateTime.fromISO('2024-01-15');
      const departures = {
        wk1mon: [{ departureStoptime: { scheduledDeparture: 28800 } }],
      };

      const result = populateData(wantedDay, departures);
      const { range } = result;

      expect(range.timeRange).to.be.a('string');
      expect(range.wantedDay).to.deep.equal(wantedDay);
      expect(range.weekday).to.equal(wantedDay.weekday);
    });

    it('should create options for other dates', () => {
      const wantedDay = DateTime.now().startOf('week');
      const departures = {
        wk1mon: [{ departureStoptime: { scheduledDeparture: 28800 } }],
        wk1tue: [{ departureStoptime: { scheduledDeparture: 30600 } }],
        wk1wed: [{ departureStoptime: { scheduledDeparture: 32400 } }],
      };

      const result = populateData(wantedDay, departures);

      expect(result.options).to.be.an('array');
      expect(result.options).to.have.lengthOf(2);
    });

    it('should use current date when wantedDay is not provided', () => {
      const departures = {
        wk1mon: [{ departureStoptime: { scheduledDeparture: 28800 } }],
      };

      const result = populateData(undefined, departures);

      expect(result).to.not.equal(undefined);
      const { range } = result;
      const today = DateTime.now();
      const firstAvailable = result.dates[0];
      if (firstAvailable && firstAvailable.hasSame(today, 'day')) {
        expect(range.wantedDay.hasSame(today, 'day')).to.equal(true);
      } else if (firstAvailable) {
        expect(range.wantedDay.hasSame(firstAvailable, 'day')).to.equal(true);
      } else {
        expect(range.wantedDay.hasSame(today, 'day')).to.equal(true);
      }
    });

    it('should handle empty departure arrays', () => {
      const wantedDay = DateTime.now();
      const departures = {
        wk1mon: [],
        wk1tue: [],
      };

      const result = populateData(wantedDay, departures);

      expect(result).to.not.equal(undefined);
      expect(result.dates).to.be.an('array');
    });
  });
});
