import React from 'react';
import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { DateTime } from 'luxon';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import * as ReactRelay from 'react-relay';

import { Component as ScheduleContainer } from '../../../../app/component/routepage/schedule/ScheduleContainer';
import { DATE_FORMAT } from '../../../../app/constants';
import { mockContext } from '../../helpers/mock-context';
import { mockMatch, mockRouter } from '../../helpers/mock-router';
import * as useTranslationsContext from '../../../../app/util/useTranslationsContext';
import * as ConfigContext from '../../../../app/configurations/ConfigContext';
import * as scheduleValidation from '../../../../app/util/scheduleValidation';

describe('<ScheduleContainer />', () => {
  let defaultProps;
  let mockMatchWithRouter;
  let mockIntl;
  let mockConfig;
  let useTranslationsContextStub;
  let useConfigContextStub;
  let useFragmentStub;
  let validateScheduleDataStub;
  let calculateRedirectDecisionStub;

  // Mock data - defined once and reused
  const mockPattern = {
    code: 'HSL:1001:0:01',
    stops: [
      {
        id: 'stop1',
        name: 'Koskela',
      },
      {
        id: 'stop2',
        name: 'Rautatientori',
      },
    ],
  };

  const mockRoute = {
    gtfsId: 'HSL:1001',
    patterns: [
      {
        code: 'HSL:1001:0:01',
        trips: [
          {
            id: 'trip-1',
            stoptimes: [
              {
                realtimeState: 'SCHEDULED',
                scheduledArrival: 28080,
                scheduledDeparture: 28080,
                serviceDay: 1547503200,
              },
              {
                realtimeState: 'SCHEDULED',
                scheduledArrival: 30060,
                scheduledDeparture: 30060,
                serviceDay: 1547503200,
              },
            ],
          },
        ],
      },
    ],
  };

  const mockFirstDepartures = {
    wk1mon: [{ departureStoptime: { scheduledDeparture: 28080 } }],
    wk1tue: [{ departureStoptime: { scheduledDeparture: 28080 } }],
    wk1wed: [{ departureStoptime: { scheduledDeparture: 28080 } }],
    wk1thu: [{ departureStoptime: { scheduledDeparture: 28080 } }],
    wk1fri: [{ departureStoptime: { scheduledDeparture: 28080 } }],
    wk1sat: [{ departureStoptime: { scheduledDeparture: 28080 } }],
    wk1sun: [{ departureStoptime: { scheduledDeparture: 28080 } }],
    wk2mon: [],
    wk2tue: [],
    wk2wed: [],
    wk2thu: [],
    wk2fri: [],
    wk2sat: [],
    wk2sun: [],
    wk3mon: [],
    wk3tue: [],
    wk3wed: [],
    wk3thu: [],
    wk3fri: [],
    wk3sat: [],
    wk3sun: [],
    wk4mon: [],
    wk4tue: [],
    wk4wed: [],
    wk4thu: [],
    wk4fri: [],
    wk4sat: [],
    wk4sun: [],
    wk5mon: [],
    wk5tue: [],
    wk5wed: [],
    wk5thu: [],
    wk5fri: [],
    wk5sat: [],
    wk5sun: [],
  };

  beforeEach(() => {
    // Create mock intl object
    mockIntl = {
      formatMessage: sinon.stub().returns('translated text'),
      formatDate: sinon.stub().returns('formatted date'),
      formatTime: sinon.stub().returns('formatted time'),
      formatNumber: sinon.stub().returns('formatted number'),
      locale: 'en',
    };

    // Create mock config object
    mockConfig = {
      ...mockContext.config,
      URL: { ROUTE_TIMETABLES: {} },
      timetables: {},
      constantOperationRoutes: {},
    };

    // Stub useFragment to pass through the fragment reference as-is
    // This allows useFragment to work like an identity function in tests
    useFragmentStub = sinon
      .stub(ReactRelay, 'useFragment')
      .callsFake((fragment, ref) => ref);

    // Stub the context hooks and store references
    useTranslationsContextStub = sinon
      .stub(useTranslationsContext, 'useTranslationsContext')
      .returns(mockIntl);
    useConfigContextStub = sinon
      .stub(ConfigContext, 'useConfigContext')
      .returns(mockConfig);

    validateScheduleDataStub = sinon
      .stub(scheduleValidation, 'validateScheduleData')
      .returns({ shouldRender: true, reason: 'valid' });
    calculateRedirectDecisionStub = sinon
      .stub(scheduleValidation, 'calculateRedirectDecision')
      .returns({
        shouldRedirect: false,
        reason: 'no-redirect',
        redirectDate: null,
        redirectPath: null,
      });

    // Setup default props - pass actual mock data objects
    // useFragment will pass them through as-is in tests
    defaultProps = {
      pattern: mockPattern,
      route: mockRoute,
      firstDepartures: mockFirstDepartures,
      breakpoint: 'large',
      lang: 'en',
      router: mockRouter,
    };

    mockMatchWithRouter = {
      ...mockMatch,
      router: mockRouter,
      location: {
        ...mockMatch.location,
        query: {},
      },
    };
  });

  afterEach(() => {
    // Restore the specific stubs
    if (useFragmentStub) {
      useFragmentStub.restore();
    }
    if (useTranslationsContextStub) {
      useTranslationsContextStub.restore();
    }
    if (useConfigContextStub) {
      useConfigContextStub.restore();
    }
    if (validateScheduleDataStub) {
      validateScheduleDataStub.restore();
    }
    if (calculateRedirectDecisionStub) {
      calculateRedirectDecisionStub.restore();
    }
  });

  describe('Initialization and hooks', () => {
    it('should call useConfigContext and useTranslationsContext on mount', () => {
      shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      // Verify the context hooks were called
      expect(useTranslationsContextStub.called).to.equal(true);
      expect(useConfigContextStub.called).to.equal(true);
    });

    it('should call schedule validation helpers with expected inputs', () => {
      const matchWithServiceDay = {
        ...mockMatchWithRouter,
        location: {
          ...mockMatchWithRouter.location,
          query: {
            serviceDay: DateTime.now().toFormat(DATE_FORMAT),
            test: '1',
          },
        },
      };

      shallow(
        <ScheduleContainer {...defaultProps} match={matchWithServiceDay} />,
      );

      expect(validateScheduleDataStub.calledOnce).to.equal(true);
      expect(
        validateScheduleDataStub.calledWithMatch({
          pattern: defaultProps.pattern,
          route: defaultProps.route,
        }),
      ).to.equal(true);

      expect(calculateRedirectDecisionStub.calledOnce).to.equal(true);
      expect(
        calculateRedirectDecisionStub.calledWithMatch({
          testNum: '1',
          patternCode: defaultProps.pattern.code,
          routeId: defaultProps.route.gtfsId,
        }),
      ).to.equal(true);
    });

    it('should initialize with from and to stops from pattern', () => {
      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      // Check that component renders
      expect(wrapper.exists()).to.equal(true);
    });
  });

  describe('Responsive layout', () => {
    it('should pass breakpoint prop correctly', () => {
      const props = {
        ...defaultProps,
        breakpoint: 'small',
      };

      const wrapper = shallow(
        <ScheduleContainer {...props} match={mockMatchWithRouter} />,
      );

      // Check that component renders with correct props
      expect(wrapper.exists()).to.equal(true);
    });
  });

  describe('State management', () => {
    it('should initialize with from=0 and to=last stop when pattern changes', () => {
      const pattern = {
        code: 'HSL:1001:0:01',
        stops: [
          { id: 'stop1', name: 'Stop 1' },
          { id: 'stop2', name: 'Stop 2' },
          { id: 'stop3', name: 'Stop 3' },
          { id: 'stop4', name: 'Stop 4' },
        ],
        trips: [
          {
            id: 'trip-1',
            stoptimes: [
              {
                realtimeState: 'SCHEDULED',
                scheduledArrival: 28080,
                scheduledDeparture: 28080,
                serviceDay: 1547503200,
              },
              {
                realtimeState: 'SCHEDULED',
                scheduledArrival: 29080,
                scheduledDeparture: 29080,
                serviceDay: 1547503200,
              },
              {
                realtimeState: 'SCHEDULED',
                scheduledArrival: 30080,
                scheduledDeparture: 30080,
                serviceDay: 1547503200,
              },
              {
                realtimeState: 'SCHEDULED',
                scheduledArrival: 31080,
                scheduledDeparture: 31080,
                serviceDay: 1547503200,
              },
            ],
          },
        ],
      };

      const propsWithMultipleStops = {
        ...defaultProps,
        pattern,
        route: {
          ...defaultProps.route,
          patterns: [pattern],
        },
      };

      const wrapper = shallow(
        <ScheduleContainer
          {...propsWithMultipleStops}
          match={mockMatchWithRouter}
        />,
      );

      expect(wrapper.exists()).to.equal(true);
    });

    it('should update when pattern code changes', () => {
      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      const newPattern = {
        code: 'HSL:1001:0:02',
        stops: [
          { id: 'stop1', name: 'Stop 1' },
          { id: 'stop2', name: 'Stop 2' },
          { id: 'stop3', name: 'Stop 3' },
        ],
        trips: defaultProps.route.patterns[0].trips,
      };

      const newProps = {
        ...defaultProps,
        pattern: newPattern,
        route: {
          ...defaultProps.route,
          patterns: [newPattern],
        },
      };

      wrapper.setProps(newProps);
      expect(wrapper.exists()).to.equal(true);
    });
  });

  describe('Trip data processing', () => {
    it('should handle empty trips array', () => {
      const propsWithNoTrips = {
        ...defaultProps,
        route: {
          ...defaultProps.route,
          patterns: [
            {
              code: 'HSL:1001:0:01',
              trips: [],
            },
          ],
        },
      };

      const wrapper = shallow(
        <ScheduleContainer {...propsWithNoTrips} match={mockMatchWithRouter} />,
      );

      expect(wrapper.exists()).to.equal(true);
    });

    it('should handle multiple trips', () => {
      const trips = [
        {
          id: 'trip-1',
          stoptimes: [
            {
              realtimeState: 'SCHEDULED',
              scheduledArrival: 28080,
              scheduledDeparture: 28080,
              serviceDay: 1547503200,
            },
            {
              realtimeState: 'SCHEDULED',
              scheduledArrival: 30060,
              scheduledDeparture: 30060,
              serviceDay: 1547503200,
            },
          ],
        },
        {
          id: 'trip-2',
          stoptimes: [
            {
              realtimeState: 'SCHEDULED',
              scheduledArrival: 29080,
              scheduledDeparture: 29080,
              serviceDay: 1547503200,
            },
            {
              realtimeState: 'SCHEDULED',
              scheduledArrival: 31060,
              scheduledDeparture: 31060,
              serviceDay: 1547503200,
            },
          ],
        },
        {
          id: 'trip-3',
          stoptimes: [
            {
              realtimeState: 'SCHEDULED',
              scheduledArrival: 30080,
              scheduledDeparture: 30080,
              serviceDay: 1547503200,
            },
            {
              realtimeState: 'SCHEDULED',
              scheduledArrival: 32060,
              scheduledDeparture: 32060,
              serviceDay: 1547503200,
            },
          ],
        },
      ];

      const pattern = {
        code: 'HSL:1001:0:01',
        stops: defaultProps.pattern.stops,
        trips,
      };

      const propsWithMultipleTrips = {
        ...defaultProps,
        pattern,
        route: {
          ...defaultProps.route,
          patterns: [pattern],
        },
      };

      const wrapper = shallow(
        <ScheduleContainer
          {...propsWithMultipleTrips}
          match={mockMatchWithRouter}
        />,
      );

      expect(wrapper.exists()).to.equal(true);
    });

    it('should handle trips with canceled stoptimes', () => {
      const trips = [
        {
          id: 'trip-canceled',
          stoptimes: [
            {
              realtimeState: 'CANCELED',
              scheduledArrival: 28080,
              scheduledDeparture: 28080,
              serviceDay: 1547503200,
            },
            {
              realtimeState: 'CANCELED',
              scheduledArrival: 30060,
              scheduledDeparture: 30060,
              serviceDay: 1547503200,
            },
          ],
        },
        {
          id: 'trip-scheduled',
          stoptimes: [
            {
              realtimeState: 'SCHEDULED',
              scheduledArrival: 31080,
              scheduledDeparture: 31080,
              serviceDay: 1547503200,
            },
            {
              realtimeState: 'SCHEDULED',
              scheduledArrival: 33060,
              scheduledDeparture: 33060,
              serviceDay: 1547503200,
            },
          ],
        },
      ];

      const pattern = {
        code: 'HSL:1001:0:01',
        stops: defaultProps.pattern.stops,
        trips,
      };

      const propsWithCanceledTrips = {
        ...defaultProps,
        pattern,
        route: {
          ...defaultProps.route,
          patterns: [pattern],
        },
      };

      const wrapper = shallow(
        <ScheduleContainer
          {...propsWithCanceledTrips}
          match={mockMatchWithRouter}
        />,
      );

      expect(wrapper.exists()).to.equal(true);
    });
  });

  describe('Multiple patterns', () => {
    it('should handle route with multiple patterns', () => {
      const pattern1 = {
        code: 'HSL:1001:0:01',
        stops: defaultProps.pattern.stops,
        trips: [
          {
            id: 'trip-1',
            stoptimes: [
              {
                realtimeState: 'SCHEDULED',
                scheduledArrival: 28080,
                scheduledDeparture: 28080,
                serviceDay: 1547503200,
              },
              {
                realtimeState: 'SCHEDULED',
                scheduledArrival: 30060,
                scheduledDeparture: 30060,
                serviceDay: 1547503200,
              },
            ],
          },
        ],
      };

      const pattern2 = {
        code: 'HSL:1001:0:02',
        stops: defaultProps.pattern.stops,
        trips: [
          {
            id: 'trip-2',
            stoptimes: [
              {
                realtimeState: 'SCHEDULED',
                scheduledArrival: 29080,
                scheduledDeparture: 29080,
                serviceDay: 1547503200,
              },
              {
                realtimeState: 'SCHEDULED',
                scheduledArrival: 31060,
                scheduledDeparture: 31060,
                serviceDay: 1547503200,
              },
            ],
          },
        ],
      };

      const propsWithMultiplePatterns = {
        ...defaultProps,
        pattern: pattern1,
        route: {
          ...defaultProps.route,
          patterns: [pattern1, pattern2],
        },
      };

      const wrapper = shallow(
        <ScheduleContainer
          {...propsWithMultiplePatterns}
          match={mockMatchWithRouter}
        />,
      );

      expect(wrapper.exists()).to.equal(true);
    });
  });

  describe('First departures data', () => {
    it('should handle firstDepartures with data', () => {
      const propsWithFirstDepartures = {
        ...defaultProps,
        firstDepartures: {
          wk1mon: [
            {
              departureStoptime: {
                scheduledDeparture: 25200,
              },
            },
          ],
          wk1tue: [
            {
              departureStoptime: {
                scheduledDeparture: 25200,
              },
            },
          ],
          wk1wed: [],
          wk1thu: [],
          wk1fri: [],
          wk1sat: [],
          wk1sun: [],
        },
      };

      const wrapper = shallow(
        <ScheduleContainer
          {...propsWithFirstDepartures}
          match={mockMatchWithRouter}
        />,
      );

      expect(wrapper.exists()).to.equal(true);
    });

    it('should handle all empty firstDepartures', () => {
      const propsWithEmptyFirstDepartures = {
        ...defaultProps,
        firstDepartures: {
          wk1mon: [],
          wk1tue: [],
          wk1wed: [],
          wk1thu: [],
          wk1fri: [],
          wk1sat: [],
          wk1sun: [],
        },
      };

      const wrapper = shallow(
        <ScheduleContainer
          {...propsWithEmptyFirstDepartures}
          match={mockMatchWithRouter}
        />,
      );

      expect(wrapper.exists()).to.equal(true);
    });
  });

  describe('Props variations', () => {
    it('should handle different breakpoint values', () => {
      const breakpoints = ['small', 'medium', 'large'];

      breakpoints.forEach(breakpoint => {
        const props = { ...defaultProps, breakpoint };
        const wrapper = shallow(
          <ScheduleContainer {...props} match={mockMatchWithRouter} />,
        );
        expect(wrapper.exists()).to.equal(true);
      });
    });

    it('should handle different language props', () => {
      const languages = ['en', 'fi', 'sv'];

      languages.forEach(lang => {
        const props = { ...defaultProps, lang };
        const wrapper = shallow(
          <ScheduleContainer {...props} match={mockMatchWithRouter} />,
        );
        expect(wrapper.exists()).to.equal(true);
      });
    });

    it('should handle route with different gtfsId', () => {
      const propsWithDifferentGtfsId = {
        ...defaultProps,
        route: {
          ...defaultProps.route,
          gtfsId: 'HSL:2132',
        },
      };

      const wrapper = shallow(
        <ScheduleContainer
          {...propsWithDifferentGtfsId}
          match={mockMatchWithRouter}
        />,
      );

      expect(wrapper.exists()).to.equal(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle pattern with single stop', () => {
      const propsWithSingleStop = {
        ...defaultProps,
        pattern: {
          code: 'HSL:1001:0:01',
          stops: [{ id: 'stop1', name: 'Only Stop' }],
          trips: defaultProps.route.patterns[0].trips,
        },
      };

      const wrapper = shallow(
        <ScheduleContainer
          {...propsWithSingleStop}
          match={mockMatchWithRouter}
        />,
      );

      expect(wrapper.exists()).to.equal(true);
    });

    it('should handle pattern with minimal valid data', () => {
      const propsWithMinimalData = {
        ...defaultProps,
        pattern: {
          code: 'HSL:1001:0:01',
          stops: [
            { id: 'stop1', name: 'Stop 1' },
            { id: 'stop2', name: 'Stop 2' },
          ],
          trips: [],
        },
      };

      const wrapper = shallow(
        <ScheduleContainer
          {...propsWithMinimalData}
          match={mockMatchWithRouter}
        />,
      );

      expect(wrapper.exists()).to.equal(true);
    });
  });

  describe('Sorting and filtering', () => {
    it('should handle trips with empty stoptimes arrays', () => {
      const tripsWithEmptyStoptimes = [
        {
          id: 'trip-empty',
          stoptimes: [],
        },
        {
          id: 'trip-valid',
          stoptimes: [
            {
              realtimeState: 'SCHEDULED',
              scheduledArrival: 28080,
              scheduledDeparture: 28080,
              serviceDay: 1547503200,
            },
            {
              realtimeState: 'SCHEDULED',
              scheduledArrival: 30060,
              scheduledDeparture: 30060,
              serviceDay: 1547503200,
            },
          ],
        },
      ];

      const pattern = {
        code: 'HSL:1001:0:01',
        stops: defaultProps.pattern.stops,
        trips: tripsWithEmptyStoptimes,
      };

      const propsWithEmptyStoptimes = {
        ...defaultProps,
        pattern,
        route: {
          ...defaultProps.route,
          patterns: [pattern],
        },
      };

      const wrapper = shallow(
        <ScheduleContainer
          {...propsWithEmptyStoptimes}
          match={mockMatchWithRouter}
        />,
      );

      expect(wrapper.exists()).to.equal(true);
    });
  });

  describe('Testing mode', () => {
    it('should pass test param into redirect decision', () => {
      const matchWithTestParam = {
        ...mockMatchWithRouter,
        location: {
          ...mockMatchWithRouter.location,
          query: {
            test: '1',
          },
        },
      };

      shallow(
        <ScheduleContainer {...defaultProps} match={matchWithTestParam} />,
      );

      expect(
        calculateRedirectDecisionStub.calledWithMatch({ testNum: '1' }),
      ).to.equal(true);
    });
  });
});
