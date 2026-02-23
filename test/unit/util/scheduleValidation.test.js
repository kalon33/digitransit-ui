import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { DateTime, Settings } from 'luxon';

import {
  calculateRedirectDecision,
  validateScheduleData,
} from '../../../app/util/scheduleValidation';
import { routePagePath, PREFIX_TIMETABLE } from '../../../app/util/path';

describe('scheduleValidation', () => {
  describe('validateScheduleData', () => {
    it('should render when constant operation info is provided', () => {
      const result = validateScheduleData({
        pattern: null,
        route: null,
        constantOperationInfo: { isAlwaysAvailable: true },
      });

      expect(result.shouldRender).to.equal(true);
      expect(result.reason).to.equal('constant-operation');
    });

    it('should not render when pattern is missing but route exists', () => {
      const result = validateScheduleData({
        pattern: null,
        route: { gtfsId: 'HSL:1001' },
        constantOperationInfo: null,
      });

      expect(result.shouldRender).to.equal(false);
      expect(result.reason).to.equal('no-pattern');
    });

    it('should not render when pattern and route are missing', () => {
      const result = validateScheduleData({
        pattern: null,
        route: null,
        constantOperationInfo: null,
      });

      expect(result.shouldRender).to.equal(false);
      expect(result.reason).to.equal('no-pattern-no-route');
    });

    it('should render when pattern exists', () => {
      const result = validateScheduleData({
        pattern: { code: 'HSL:1001:0:01' },
        route: { gtfsId: 'HSL:1001' },
        constantOperationInfo: null,
      });

      expect(result.shouldRender).to.equal(true);
      expect(result.reason).to.equal('valid');
    });
  });

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
        firstDataDate: DateTime.now(),
        noTrips: true,
        patternCode: 'HSL:1001:0:01',
        routeId: 'HSL:1001',
      });

      expect(decision.shouldRedirect).to.equal(false);
      expect(decision.reason).to.equal('test-mode');
      expect(decision.redirectDate).to.equal(null);
      expect(decision.redirectPath).to.equal(null);
    });

    it('should redirect past dates to today', () => {
      const decision = calculateRedirectDecision({
        testNum: undefined,
        wantedDay: DateTime.now().minus({ days: 2 }),
        firstDataDate: DateTime.now().plus({ days: 3 }),
        noTrips: false,
        patternCode: 'HSL:1001:0:01',
        routeId: 'HSL:1001',
      });

      expect(decision.shouldRedirect).to.equal(true);
      expect(decision.reason).to.equal('past-date');
      expect(decision.redirectDate.toISODate()).to.equal(
        fixedNow.startOf('day').toISODate(),
      );
      expect(decision.redirectPath).to.equal(null);
    });

    it('should redirect invalid dates to today', () => {
      const decision = calculateRedirectDecision({
        testNum: undefined,
        wantedDay: DateTime.fromISO('invalid-date-string'),
        firstDataDate: DateTime.now().plus({ days: 3 }),
        noTrips: false,
        patternCode: 'HSL:1001:0:01',
        routeId: 'HSL:1001',
      });

      expect(decision.shouldRedirect).to.equal(true);
      expect(decision.reason).to.equal('invalid-date');
      expect(decision.redirectDate.toISODate()).to.equal(
        fixedNow.startOf('day').toISODate(),
      );
      expect(decision.redirectPath).to.equal(null);
    });

    it('should redirect to route timetable when pattern code is missing', () => {
      const routeId = 'HSL:1001';
      const decision = calculateRedirectDecision({
        testNum: undefined,
        wantedDay: undefined,
        firstDataDate: undefined,
        noTrips: false,
        patternCode: null,
        routeId,
      });

      expect(decision.shouldRedirect).to.equal(true);
      expect(decision.reason).to.equal('no-pattern');
      expect(decision.redirectDate).to.equal(null);
      expect(decision.redirectPath).to.equal(
        routePagePath(routeId, PREFIX_TIMETABLE),
      );
    });

    it('should not redirect when conditions are valid', () => {
      const decision = calculateRedirectDecision({
        testNum: undefined,
        wantedDay: DateTime.now().plus({ days: 2 }),
        firstDataDate: DateTime.now().plus({ days: 1 }),
        noTrips: false,
        patternCode: 'HSL:1001:0:01',
        routeId: 'HSL:1001',
      });

      expect(decision.shouldRedirect).to.equal(false);
      expect(decision.reason).to.equal('no-redirect');
      expect(decision.redirectDate).to.equal(null);
      expect(decision.redirectPath).to.equal(null);
    });
  });
});
