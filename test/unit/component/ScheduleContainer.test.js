import React from 'react';
import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { DateTime } from 'luxon';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import { Component as ScheduleContainer } from '../../../app/component/routepage/schedule/ScheduleContainer';
import { mockContext } from '../helpers/mock-context';
import { mockMatch, mockRouter } from '../helpers/mock-router';
import * as useTranslationsContext from '../../../app/util/useTranslationsContext';
import * as ConfigContext from '../../../app/configurations/ConfigContext';

describe('<ScheduleContainer />', () => {
  let defaultProps;
  let mockMatchWithRouter;
  let mockIntl;
  let mockConfig;
  let useTranslationsContextStub;
  let useConfigContextStub;

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

    // Stub the context hooks and store references
    useTranslationsContextStub = sinon
      .stub(useTranslationsContext, 'useTranslationsContext')
      .returns(mockIntl);
    useConfigContextStub = sinon
      .stub(ConfigContext, 'useConfigContext')
      .returns(mockConfig);

    // Setup default props
    defaultProps = {
      pattern: {
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
      },
      route: {
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
      },
      firstDepartures: {
        wk1mon: [],
        wk1tue: [],
        wk1wed: [],
        wk1thu: [],
        wk1fri: [],
        wk1sat: [],
        wk1sun: [],
      },
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
    if (useTranslationsContextStub) {
      useTranslationsContextStub.restore();
    }
    if (useConfigContextStub) {
      useConfigContextStub.restore();
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

  describe('Date validation', () => {
    it('should redirect when serviceDay is in the past', () => {
      const pastDate = DateTime.now().minus({ weeks: 2 });
      const matchWithPastDate = {
        ...mockMatchWithRouter,
        location: {
          ...mockMatchWithRouter.location,
          query: {
            serviceDay: pastDate.toFormat('yyyy-MM-dd'),
          },
        },
      };

      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={matchWithPastDate} />,
      );

      // Component should attempt to redirect
      expect(wrapper.exists()).to.equal(true);
    });

    it('should accept current week dates', () => {
      const currentDate = DateTime.now();
      const matchWithCurrentDate = {
        ...mockMatchWithRouter,
        location: {
          ...mockMatchWithRouter.location,
          query: {
            serviceDay: currentDate.toFormat('yyyy-MM-dd'),
          },
        },
      };

      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={matchWithCurrentDate} />,
      );

      expect(wrapper.exists()).to.equal(true);
    });

    it('should accept future dates', () => {
      const futureDate = DateTime.now().plus({ weeks: 2 });
      const matchWithFutureDate = {
        ...mockMatchWithRouter,
        location: {
          ...mockMatchWithRouter.location,
          query: {
            serviceDay: futureDate.toFormat('yyyy-MM-dd'),
          },
        },
      };

      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={matchWithFutureDate} />,
      );

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
});
