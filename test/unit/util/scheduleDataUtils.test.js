import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { DateTime, Settings } from 'luxon';
import { populateData } from '../../../app/util/scheduleDataUtils';

const DATE_FORMAT_SCHEDULE = 'd.L.yyyy';

describe('scheduleDataUtils', () => {
  describe('populateData', () => {
    const fixedNow = DateTime.fromISO('2024-01-15T10:00:00');

    beforeEach(() => {
      Settings.now = () => fixedNow.toMillis();
    });

    afterEach(() => {
      Settings.now = () => Date.now();
    });

    it('should populate data with proper structure', () => {
      const wantedDay = DateTime.fromISO('2024-01-15');
      const departures = {
        wk1mon: [{ departureStoptime: { scheduledDeparture: 28800 } }],
        wk1tue: [{ departureStoptime: { scheduledDeparture: 30600 } }],
      };

      const result = populateData(wantedDay, departures);

      expect(result).to.be.an('object');
      expect(result.dates).to.be.an('array');
      expect(result.selectedDay).to.be.an('object');
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
      expect(result.dates).to.have.lengthOf(4);
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

    it('should create proper date data in response', () => {
      const wantedDay = DateTime.fromISO('2024-01-15');
      const departures = {
        wk1mon: [{ departureStoptime: { scheduledDeparture: 28800 } }],
      };

      const result = populateData(wantedDay, departures);
      const { selectedDay } = result;

      expect(selectedDay.toFormat(DATE_FORMAT_SCHEDULE)).to.equal(
        wantedDay.toFormat(DATE_FORMAT_SCHEDULE),
      );
      expect(selectedDay.weekday).to.equal(wantedDay.weekday);
    });

    it('should create options for other dates', () => {
      const wantedDay = DateTime.now().startOf('week');
      const departures = {
        wk1mon: [{ departureStoptime: { scheduledDeparture: 28800 } }],
        wk1tue: [{ departureStoptime: { scheduledDeparture: 30600 } }],
        wk1wed: [{ departureStoptime: { scheduledDeparture: 32400 } }],
      };

      const result = populateData(wantedDay, departures);

      expect(result.dates).to.be.an('array');
      expect(result.dates).to.have.lengthOf(3);
    });

    it('should use current date when wantedDay is not provided', () => {
      const departures = {
        wk1mon: [{ departureStoptime: { scheduledDeparture: 28800 } }],
      };

      const result = populateData(undefined, departures);

      expect(result).to.not.equal(undefined);
      const today = DateTime.now();
      expect(result.selectedDay.toFormat(DATE_FORMAT_SCHEDULE)).to.equal(
        today.toFormat(DATE_FORMAT_SCHEDULE),
      );
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
      expect(result.dates).to.have.lengthOf(0);
      expect(result.selectedDay).to.be.an('object');
    });
  });
});
