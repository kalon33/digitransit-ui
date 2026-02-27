import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { DateTime } from 'luxon';
import { renderHook } from '@testing-library/react-hooks/dom';
import sinon from 'sinon';

import { useRouterRedirect } from '../../../app/hooks/useRouterRedirect';
import { DATE_FORMAT } from '../../../app/constants';

describe('useRouterRedirect', () => {
  let mockRouter;
  let mockMatch;
  let routerReplaceSpy;

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

  describe('Redirect behavior', () => {
    it('does not redirect when disabled', () => {
      renderHook(() =>
        useRouterRedirect({
          match: mockMatch,
          router: mockRouter,
          shouldRedirect: false,
        }),
      );

      expect(routerReplaceSpy.called).to.equal(false);
    });

    it('redirects when enabled', () => {
      renderHook(() =>
        useRouterRedirect({
          match: mockMatch,
          router: mockRouter,
          shouldRedirect: true,
        }),
      );

      expect(routerReplaceSpy.calledOnce).to.equal(true);
    });

    it('triggers redirect when shouldRedirect changes from false to true', () => {
      const { rerender } = renderHook(
        ({ shouldRedirect }) =>
          useRouterRedirect({
            match: mockMatch,
            router: mockRouter,
            shouldRedirect,
          }),
        {
          initialProps: { shouldRedirect: false },
        },
      );

      expect(routerReplaceSpy.called).to.equal(false);

      rerender({ shouldRedirect: true });

      expect(routerReplaceSpy.calledOnce).to.equal(true);
    });
  });

  describe('Path handling', () => {
    it('keeps current pathname when no new pathname provided', () => {
      renderHook(() =>
        useRouterRedirect({
          match: mockMatch,
          router: mockRouter,
          shouldRedirect: true,
        }),
      );

      const redirectTarget = routerReplaceSpy.firstCall.args[0];
      expect(redirectTarget.pathname).to.equal(mockMatch.location.pathname);
    });

    it('uses new pathname when provided', () => {
      const newPath = '/route/HSL:1001/timetable';

      renderHook(() =>
        useRouterRedirect({
          match: mockMatch,
          router: mockRouter,
          shouldRedirect: true,
          pathname: newPath,
        }),
      );

      const redirectTarget = routerReplaceSpy.firstCall.args[0];
      expect(redirectTarget.pathname).to.equal(newPath);
    });
  });

  describe('Query parameter merging', () => {
    it('adds new query params to empty query', () => {
      const serviceDay = DateTime.fromISO('2024-01-15').toFormat(DATE_FORMAT);

      renderHook(() =>
        useRouterRedirect({
          match: mockMatch,
          router: mockRouter,
          shouldRedirect: true,
          query: { serviceDay },
        }),
      );

      const redirectTarget = routerReplaceSpy.firstCall.args[0];
      expect(redirectTarget.query).to.deep.equal({ serviceDay });
    });

    it('preserves existing query params while adding new ones', () => {
      const matchWithQuery = {
        ...mockMatch,
        location: {
          ...mockMatch.location,
          query: { existing: 'value', other: 'param' },
        },
      };
      const serviceDay = DateTime.fromISO('2024-01-15').toFormat(DATE_FORMAT);

      renderHook(() =>
        useRouterRedirect({
          match: matchWithQuery,
          router: mockRouter,
          shouldRedirect: true,
          query: { serviceDay },
        }),
      );

      const redirectTarget = routerReplaceSpy.firstCall.args[0];
      expect(redirectTarget.query).to.deep.equal({
        existing: 'value',
        other: 'param',
        serviceDay,
      });
    });

    it('overwrites existing params with new values for same key', () => {
      const matchWithQuery = {
        ...mockMatch,
        location: {
          ...mockMatch.location,
          query: { serviceDay: '2024-01-01' },
        },
      };
      const newServiceDay =
        DateTime.fromISO('2024-01-15').toFormat(DATE_FORMAT);

      renderHook(() =>
        useRouterRedirect({
          match: matchWithQuery,
          router: mockRouter,
          shouldRedirect: true,
          query: { serviceDay: newServiceDay },
        }),
      );

      const redirectTarget = routerReplaceSpy.firstCall.args[0];
      expect(redirectTarget.query.serviceDay).to.equal(newServiceDay);
    });

    it('handles both pathname and query changes together', () => {
      const matchWithQuery = {
        ...mockMatch,
        location: {
          ...mockMatch.location,
          query: { existing: 'value' },
        },
      };
      const newPath = '/route/HSL:1001/timetable';
      const serviceDay = DateTime.fromISO('2024-01-15').toFormat(DATE_FORMAT);

      renderHook(() =>
        useRouterRedirect({
          match: matchWithQuery,
          router: mockRouter,
          shouldRedirect: true,
          pathname: newPath,
          query: { serviceDay },
        }),
      );

      const redirectTarget = routerReplaceSpy.firstCall.args[0];
      expect(redirectTarget.pathname).to.equal(newPath);
      expect(redirectTarget.query).to.deep.equal({
        existing: 'value',
        serviceDay,
      });
    });
  });
});
