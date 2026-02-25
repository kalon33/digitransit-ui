import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { DateTime, Settings } from 'luxon';

import { calculateRedirectDecision } from '../../../app/util/scheduleValidation';
import { routePagePath, PREFIX_TIMETABLE } from '../../../app/util/path';
import { DATE_FORMAT } from '../../../app/constants';

describe('scheduleValidation', () => {
  describe('calculateRedirectDecision', () => {
    const fixedNow = DateTime.fromISO('2024-01-15T10:00:00');
    const originalTestingEnv = process.env.ROUTEPAGETESTING;

    beforeEach(() => {
      Settings.now = () => fixedNow.toMillis();
    });

    afterEach(() => {
      Settings.now = () => Date.now();
      process.env.ROUTEPAGETESTING = originalTestingEnv;
    });

    it('should skip redirect in test mode when testNum is 0', () => {
      process.env.ROUTEPAGETESTING = 'true';
      const decision = calculateRedirectDecision({
        testNum: '0',
        wantedDay: DateTime.now().minus({ days: 1 }),
        validationReason: 'valid',
        routeId: 'HSL:1001',
      });

      expect(decision.shouldRedirect).to.equal(false);
      expect(decision.reason).to.equal('test-mode');
      expect(decision.query).to.deep.equal({});
      expect(decision.redirectPath).to.equal(null);
    });

    it('should redirect past dates to today', () => {
      const decision = calculateRedirectDecision({
        testNum: undefined,
        wantedDay: DateTime.now().minus({ days: 2 }),
        validationReason: 'valid',
        routeId: 'HSL:1001',
      });

      expect(decision.shouldRedirect).to.equal(true);
      expect(decision.reason).to.equal('past-date');
      expect(decision.query.serviceDay).to.equal(
        fixedNow.startOf('day').toFormat(DATE_FORMAT),
      );
      expect(decision.redirectPath).to.equal(null);
    });

    it('should redirect invalid dates to today', () => {
      const decision = calculateRedirectDecision({
        testNum: undefined,
        wantedDay: DateTime.fromISO('invalid-date-string'),
        validationReason: 'valid',
        routeId: 'HSL:1001',
      });

      expect(decision.shouldRedirect).to.equal(true);
      expect(decision.reason).to.equal('invalid-date');
      expect(decision.query.serviceDay).to.equal(
        fixedNow.startOf('day').toFormat(DATE_FORMAT),
      );
      expect(decision.redirectPath).to.equal(null);
    });

    it('should redirect to route timetable when pattern code is missing', () => {
      const routeId = 'HSL:1001';
      const decision = calculateRedirectDecision({
        testNum: undefined,
        wantedDay: undefined,
        validationReason: 'no-pattern',
        routeId,
      });

      expect(decision.shouldRedirect).to.equal(true);
      expect(decision.reason).to.equal('no-pattern');
      expect(decision.query).to.deep.equal({});
      expect(decision.redirectPath).to.equal(
        routePagePath(routeId, PREFIX_TIMETABLE),
      );
    });

    it('should not redirect when conditions are valid', () => {
      const decision = calculateRedirectDecision({
        testNum: undefined,
        wantedDay: DateTime.now().plus({ days: 2 }),
        patternCode: 'HSL:1001:0:01',
        routeId: 'HSL:1001',
      });

      expect(decision.shouldRedirect).to.equal(false);
      expect(decision.reason).to.equal('no-redirect');
      expect(decision.query).to.deep.equal({});
      expect(decision.redirectPath).to.equal(null);
    });

    it('should include test param in query when in test mode', () => {
      process.env.ROUTEPAGETESTING = 'true';
      const decision = calculateRedirectDecision({
        testNum: '1',
        wantedDay: DateTime.now().minus({ days: 1 }),
        validationReason: 'valid',
        routeId: 'HSL:1001',
      });

      expect(decision.shouldRedirect).to.equal(true);
      expect(decision.reason).to.equal('past-date');
      expect(decision.query.test).to.equal('1');
      expect(decision.query.serviceDay).to.equal(
        fixedNow.startOf('day').toFormat(DATE_FORMAT),
      );
    });
  });
});
