import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { DateTime } from 'luxon';
import { renderHook } from '@testing-library/react-hooks/dom';
import sinon from 'sinon';

import { useRouterRedirect } from '../../../app/hooks/useRouterRedirect';
import { DATE_FORMAT } from '../../../app/constants';

describe('useRouterRedirect', () => {
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
    renderHook(() =>
      useRouterRedirect({
        match: mockMatch,
        router: mockRouter,
        shouldRedirect: false,
      }),
    );

    expect(routerReplaceSpy.called).to.equal(false);
  });

  it('should redirect with query params when provided', () => {
    const redirectDate = DateTime.fromISO('2024-01-15');

    renderHook(() =>
      useRouterRedirect({
        match: mockMatch,
        router: mockRouter,
        shouldRedirect: true,
        query: { serviceDay: redirectDate.toFormat(DATE_FORMAT) },
      }),
    );

    expect(routerReplaceSpy.calledOnce).to.equal(true);
    const callArg = routerReplaceSpy.firstCall.args[0];
    expect(callArg.pathname).to.equal(mockMatch.location.pathname);
    expect(callArg.query.serviceDay).to.equal(
      redirectDate.toFormat(DATE_FORMAT),
    );
  });

  it('should redirect with path when pathname is provided', () => {
    const redirectPath = '/route/HSL:1001/timetable';

    renderHook(() =>
      useRouterRedirect({
        match: mockMatch,
        router: mockRouter,
        shouldRedirect: true,
        pathname: redirectPath,
      }),
    );

    expect(routerReplaceSpy.calledOnce).to.equal(true);
    const callArg = routerReplaceSpy.firstCall.args[0];
    expect(callArg.pathname).to.equal(redirectPath);
    expect(callArg.query.serviceDay).to.equal(undefined);
  });

  it('should redirect with both path and query when both are provided', () => {
    const redirectDate = DateTime.fromISO('2024-01-15');
    const redirectPath = '/route/HSL:1001/timetable';

    renderHook(() =>
      useRouterRedirect({
        match: mockMatch,
        router: mockRouter,
        shouldRedirect: true,
        pathname: redirectPath,
        query: { serviceDay: redirectDate.toFormat(DATE_FORMAT) },
      }),
    );

    expect(routerReplaceSpy.calledOnce).to.equal(true);
    const callArg = routerReplaceSpy.firstCall.args[0];
    expect(callArg.pathname).to.equal(redirectPath);
    expect(callArg.query.serviceDay).to.equal(
      redirectDate.toFormat(DATE_FORMAT),
    );
  });

  it('should preserve test param from existing query', () => {
    process.env.ROUTEPAGETESTING = 'true';
    const redirectDate = DateTime.fromISO('2024-01-15');

    const matchWithTest = {
      ...mockMatch,
      location: {
        ...mockMatch.location,
        query: { test: '1' },
      },
    };

    renderHook(() =>
      useRouterRedirect({
        match: matchWithTest,
        router: mockRouter,
        shouldRedirect: true,
        query: { serviceDay: redirectDate.toFormat(DATE_FORMAT) },
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

    const matchWithQuery = {
      ...mockMatch,
      location: {
        ...mockMatch.location,
        query: { someParam: 'value' },
      },
    };

    renderHook(() =>
      useRouterRedirect({
        match: matchWithQuery,
        router: mockRouter,
        shouldRedirect: true,
        query: { serviceDay: redirectDate.toFormat(DATE_FORMAT) },
      }),
    );

    expect(routerReplaceSpy.calledOnce).to.equal(true);
    const callArg = routerReplaceSpy.firstCall.args[0];
    expect(callArg.query.someParam).to.equal('value');
    expect(callArg.query.serviceDay).to.equal(
      redirectDate.toFormat(DATE_FORMAT),
    );
  });

  it('should redirect when shouldRedirect changes', () => {
    const { rerender } = renderHook(
      ({ shouldRedirect, query }) =>
        useRouterRedirect({
          match: mockMatch,
          router: mockRouter,
          shouldRedirect,
          query,
        }),
      {
        initialProps: { shouldRedirect: false, query: {} },
      },
    );

    expect(routerReplaceSpy.called).to.equal(false);

    rerender({
      shouldRedirect: true,
      query: {
        serviceDay: DateTime.fromISO('2024-01-15').toFormat(DATE_FORMAT),
      },
    });

    expect(routerReplaceSpy.calledOnce).to.equal(true);
  });
});
