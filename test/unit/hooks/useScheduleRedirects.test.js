import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { DateTime } from 'luxon';
import { renderHook } from '@testing-library/react-hooks/dom';
import sinon from 'sinon';

import { useScheduleRedirects } from '../../../app/hooks/useScheduleRedirects';
import { DATE_FORMAT } from '../../../app/constants';

describe('useScheduleRedirects', () => {
  let mockRouter;
  let mockMatch;
  let routerReplaceSpy;
  const originalTestingEnv = process.env.ROUTEPAGETESTING;

  beforeEach(() => {
    routerReplaceSpy = sinon.spy();
    mockRouter = {
      replace: routerReplaceSpy,
    };

    mockMatch = {
      location: {
        pathname: '/route/HSL:1001/timetable/HSL:1001:0:01',
        query: {},
      },
    };
  });

  afterEach(() => {
    process.env.ROUTEPAGETESTING = originalTestingEnv;
  });

  it('should not redirect when shouldRedirect is false', () => {
    const redirectDecision = {
      shouldRedirect: false,
      redirectDate: null,
      redirectPath: null,
      reason: 'no-redirect',
    };

    renderHook(() =>
      useScheduleRedirects({
        match: mockMatch,
        router: mockRouter,
        redirectDecision,
      }),
    );

    expect(routerReplaceSpy.called).to.equal(false);
  });

  it('should redirect with date when redirectDate is provided', () => {
    const redirectDate = DateTime.fromISO('2024-01-15');
    const redirectDecision = {
      shouldRedirect: true,
      redirectDate,
      redirectPath: null,
      reason: 'past-date',
    };

    renderHook(() =>
      useScheduleRedirects({
        match: mockMatch,
        router: mockRouter,
        redirectDecision,
      }),
    );

    expect(routerReplaceSpy.calledOnce).to.equal(true);
    const callArg = routerReplaceSpy.firstCall.args[0];
    expect(callArg.pathname).to.equal(mockMatch.location.pathname);
    expect(callArg.query.serviceDay).to.equal(
      redirectDate.toFormat(DATE_FORMAT),
    );
  });

  it('should redirect with path when redirectPath is provided', () => {
    const redirectPath = '/route/HSL:1001/timetable';
    const redirectDecision = {
      shouldRedirect: true,
      redirectDate: null,
      redirectPath,
      reason: 'no-pattern',
    };

    renderHook(() =>
      useScheduleRedirects({
        match: mockMatch,
        router: mockRouter,
        redirectDecision,
      }),
    );

    expect(routerReplaceSpy.calledOnce).to.equal(true);
    const callArg = routerReplaceSpy.firstCall.args[0];
    expect(callArg.pathname).to.equal(redirectPath);
    expect(callArg.query.serviceDay).to.equal(undefined);
  });

  it('should redirect with both path and date when both are provided', () => {
    const redirectDate = DateTime.fromISO('2024-01-15');
    const redirectPath = '/route/HSL:1001/timetable';
    const redirectDecision = {
      shouldRedirect: true,
      redirectDate,
      redirectPath,
      reason: 'complex-redirect',
    };

    renderHook(() =>
      useScheduleRedirects({
        match: mockMatch,
        router: mockRouter,
        redirectDecision,
      }),
    );

    expect(routerReplaceSpy.calledOnce).to.equal(true);
    const callArg = routerReplaceSpy.firstCall.args[0];
    expect(callArg.pathname).to.equal(redirectPath);
    expect(callArg.query.serviceDay).to.equal(
      redirectDate.toFormat(DATE_FORMAT),
    );
  });

  it('should preserve test param in testing mode', () => {
    process.env.ROUTEPAGETESTING = 'true';
    const redirectDate = DateTime.fromISO('2024-01-15');
    const redirectDecision = {
      shouldRedirect: true,
      redirectDate,
      redirectPath: null,
      reason: 'past-date',
    };

    const matchWithTest = {
      ...mockMatch,
      location: {
        ...mockMatch.location,
        query: { test: '1' },
      },
    };

    renderHook(() =>
      useScheduleRedirects({
        match: matchWithTest,
        router: mockRouter,
        redirectDecision,
      }),
    );

    expect(routerReplaceSpy.calledOnce).to.equal(true);
    const callArg = routerReplaceSpy.firstCall.args[0];
    expect(callArg.query.test).to.equal('1');
    expect(callArg.query.serviceDay).to.equal(
      redirectDate.toFormat(DATE_FORMAT),
    );
  });

  it('should preserve existing query params', () => {
    const redirectDate = DateTime.fromISO('2024-01-15');
    const redirectDecision = {
      shouldRedirect: true,
      redirectDate,
      redirectPath: null,
      reason: 'past-date',
    };

    const matchWithQuery = {
      ...mockMatch,
      location: {
        ...mockMatch.location,
        query: { someParam: 'value' },
      },
    };

    renderHook(() =>
      useScheduleRedirects({
        match: matchWithQuery,
        router: mockRouter,
        redirectDecision,
      }),
    );

    expect(routerReplaceSpy.calledOnce).to.equal(true);
    const callArg = routerReplaceSpy.firstCall.args[0];
    expect(callArg.query.someParam).to.equal('value');
    expect(callArg.query.serviceDay).to.equal(
      redirectDate.toFormat(DATE_FORMAT),
    );
  });

  it('should redirect when redirectDecision changes', () => {
    const initialDecision = {
      shouldRedirect: false,
      redirectDate: null,
      redirectPath: null,
      reason: 'no-redirect',
    };

    const { rerender } = renderHook(
      ({ redirectDecision }) =>
        useScheduleRedirects({
          match: mockMatch,
          router: mockRouter,
          redirectDecision,
        }),
      {
        initialProps: { redirectDecision: initialDecision },
      },
    );

    expect(routerReplaceSpy.called).to.equal(false);

    const newDecision = {
      shouldRedirect: true,
      redirectDate: DateTime.fromISO('2024-01-15'),
      redirectPath: null,
      reason: 'past-date',
    };

    rerender({ redirectDecision: newDecision });

    expect(routerReplaceSpy.calledOnce).to.equal(true);
  });
});
