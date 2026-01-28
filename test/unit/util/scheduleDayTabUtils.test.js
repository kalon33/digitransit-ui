import { expect } from 'chai';
import { describe, it } from 'mocha';
import { DateTime } from 'luxon';
import {
  separateConsecutiveDays,
  processDayTabs,
  calculateTabDate,
} from '../../../app/util/scheduleDayTabUtils';

describe('scheduleDayTabUtils', () => {
  describe('separateConsecutiveDays', () => {
    it('should keep consecutive days together', () => {
      const result = separateConsecutiveDays('12345');
      expect(result).to.deep.equal(['12345']);
    });

    it('should separate non-consecutive days', () => {
      const result = separateConsecutiveDays('135');
      expect(result).to.deep.equal(['1', '3', '5']);
    });

    it('should handle single day', () => {
      const result = separateConsecutiveDays('3');
      expect(result).to.deep.equal(['3']);
    });

    it('should handle mixed consecutive and non-consecutive', () => {
      const result = separateConsecutiveDays('1247');
      expect(result).to.deep.equal(['12', '4', '7']);
    });

    it('should handle all days of week', () => {
      const result = separateConsecutiveDays('1234567');
      expect(result).to.deep.equal(['1234567']);
    });

    it('should handle weekend days', () => {
      const result = separateConsecutiveDays('67');
      expect(result).to.deep.equal(['67']);
    });

    it('should handle weekdays', () => {
      const result = separateConsecutiveDays('12345');
      expect(result).to.deep.equal(['12345']);
    });

    it('should separate gap between weekdays and weekend', () => {
      const result = separateConsecutiveDays('567');
      expect(result).to.deep.equal(['567']);
    });

    it('should handle alternating days', () => {
      const result = separateConsecutiveDays('246');
      expect(result).to.deep.equal(['2', '4', '6']);
    });

    it('should handle multiple groups', () => {
      const result = separateConsecutiveDays('1234567');
      expect(result).to.deep.equal(['1234567']);
    });
  });

  describe('processDayTabs', () => {
    it('should return null for full week pattern', () => {
      const result = processDayTabs(['1234567']);
      expect(result).to.equal(null);
    });

    it('should return null for null input', () => {
      const result = processDayTabs(null);
      expect(result).to.equal(null);
    });

    it('should return null for undefined input', () => {
      const result = processDayTabs(undefined);
      expect(result).to.equal(null);
    });

    it('should handle single days', () => {
      const result = processDayTabs(['1', '3', '5']);
      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(3);
      expect(result).to.include('1');
      expect(result).to.include('3');
      expect(result).to.include('5');
    });

    it('should separate consecutive days in multi-day patterns', () => {
      const result = processDayTabs(['12345', '67']);
      expect(result).to.be.an('array');
      expect(result).to.include('12345');
      expect(result).to.include('67');
    });

    it('should handle mix of single and multi-day patterns', () => {
      const result = processDayTabs(['1', '234', '5', '67']);
      expect(result).to.be.an('array');
      expect(result.length).to.be.greaterThan(0);
    });

    it('should sort the result', () => {
      const result = processDayTabs(['5', '1', '3']);
      expect(result).to.deep.equal(['1', '3', '5']);
    });

    it('should handle non-consecutive multi-day pattern', () => {
      const result = processDayTabs(['135']);
      expect(result).to.be.an('array');
      expect(result.length).to.equal(3); // '1', '3', and '5'
    });

    it('should filter out empty string values', () => {
      const result = processDayTabs(['1', '', '3', '5']);
      expect(result).to.be.an('array');
      expect(result).to.not.include('');
      expect(result).to.include('1');
      expect(result).to.include('3');
      expect(result).to.include('5');
    });

    it('should handle weekday pattern', () => {
      const result = processDayTabs(['12345']);
      expect(result).to.be.an('array');
      expect(result).to.include('12345');
    });

    it('should handle weekend pattern', () => {
      const result = processDayTabs(['67']);
      expect(result).to.be.an('array');
      expect(result).to.include('67');
    });

    it('should combine single days and multi-day patterns', () => {
      const result = processDayTabs(['1', '234', '5']);
      expect(result).to.be.an('array');
      expect(result).to.include('1');
      expect(result).to.include('234');
      expect(result).to.include('5');
    });

    it('should handle complex non-consecutive patterns', () => {
      const result = processDayTabs(['1357', '246']);
      expect(result).to.be.an('array');
      expect(result.length).to.be.greaterThan(2);
    });
  });

  describe('calculateTabDate', () => {
    it('should calculate date for first day of week', () => {
      const baseDate = DateTime.fromISO('2024-01-08'); // Monday
      const result = calculateTabDate(baseDate, '1', false, null);

      expect(result.weekday).to.equal(1); // Monday
      expect(result.toFormat('yyyy-MM-dd')).to.equal('2024-01-08');
    });

    it('should calculate date for mid-week day', () => {
      const baseDate = DateTime.fromISO('2024-01-08'); // Monday
      const result = calculateTabDate(baseDate, '3', false, null);

      expect(result.weekday).to.equal(3); // Wednesday
      expect(result.toFormat('yyyy-MM-dd')).to.equal('2024-01-10');
    });

    it('should calculate date for last day of week', () => {
      const baseDate = DateTime.fromISO('2024-01-08'); // Monday
      const result = calculateTabDate(baseDate, '7', false, null);

      expect(result.weekday).to.equal(7); // Sunday
      expect(result.toFormat('yyyy-MM-dd')).to.equal('2024-01-14');
    });

    it('should handle merged data with pastDate', () => {
      const baseDate = DateTime.fromISO('2024-01-08'); // Monday
      const pastDate = '20240110'; // Wednesday
      const result = calculateTabDate(baseDate, '1', true, pastDate);

      expect(result).to.be.instanceOf(DateTime);
    });

    it('should add a week when merged and past date is after calculated date', () => {
      const baseDate = DateTime.fromISO('2024-01-08'); // Monday
      const pastDate = '20240110'; // Wednesday (day 3)
      const result = calculateTabDate(baseDate, '1', true, pastDate);

      // Since pastDate (Wed) > calculated (Mon), should add 7 days
      expect(result.weekday).to.equal(1); // Still Monday
      expect(result > baseDate).to.equal(true);
    });

    it('should not add a week when merged and past date is before calculated date', () => {
      const baseDate = DateTime.fromISO('2024-01-08'); // Monday
      const pastDate = '20240105'; // Previous Friday
      const result = calculateTabDate(baseDate, '5', true, pastDate);

      expect(result.weekday).to.equal(5); // Friday
    });

    it('should handle non-merged data regardless of pastDate', () => {
      const baseDate = DateTime.fromISO('2024-01-08'); // Monday
      const pastDate = '20240110';
      const result = calculateTabDate(baseDate, '3', false, pastDate);

      expect(result.weekday).to.equal(3); // Wednesday
      expect(result.toFormat('yyyy-MM-dd')).to.equal('2024-01-10');
    });

    it('should handle multi-character tab (use first character)', () => {
      const baseDate = DateTime.fromISO('2024-01-08'); // Monday
      const result = calculateTabDate(baseDate, '12345', false, null);

      expect(result.weekday).to.equal(1); // Uses first day (Monday)
    });

    it('should handle when baseDate matches pastDate in merged mode', () => {
      const baseDate = DateTime.fromISO('2024-01-08'); // Monday
      const pastDate = '20240108'; // Same day
      const result = calculateTabDate(baseDate, '1', true, pastDate);

      expect(result.weekday).to.equal(1);
    });

    it('should handle weekend days', () => {
      const baseDate = DateTime.fromISO('2024-01-08'); // Monday (start of week)
      const result = calculateTabDate(baseDate, '6', false, null);

      expect(result.weekday).to.equal(6); // Saturday
    });

    it('should handle Sunday (day 7)', () => {
      const baseDate = DateTime.fromISO('2024-01-08'); // Monday
      const result = calculateTabDate(baseDate, '7', false, null);

      expect(result.weekday).to.equal(7); // Sunday
    });

    it('should work with different base dates', () => {
      const baseDate1 = DateTime.fromISO('2024-01-15'); // Different week
      const baseDate2 = DateTime.fromISO('2024-02-05'); // Different month

      const result1 = calculateTabDate(baseDate1, '3', false, null);
      const result2 = calculateTabDate(baseDate2, '3', false, null);

      expect(result1.weekday).to.equal(3);
      expect(result2.weekday).to.equal(3);
      expect(result1.month).to.equal(1);
      expect(result2.month).to.equal(2);
    });

    it('should handle merged data without pastDate', () => {
      const baseDate = DateTime.fromISO('2024-01-08');
      const result = calculateTabDate(baseDate, '3', true, null);

      expect(result.weekday).to.equal(3);
    });

    it('should handle merged data with undefined pastDate', () => {
      const baseDate = DateTime.fromISO('2024-01-08');
      const result = calculateTabDate(baseDate, '3', true, undefined);

      expect(result.weekday).to.equal(3);
    });
  });
});
