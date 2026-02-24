import React from 'react';
import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { DateTime } from 'luxon';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import * as ReactRelay from 'react-relay';

import { Component as ScheduleContainer } from '../../../../app/component/routepage/schedule/ScheduleContainer';
import ScheduleHeader from '../../../../app/component/routepage/schedule/ScheduleHeader';
import ScheduleTripList from '../../../../app/component/routepage/schedule/ScheduleTripList';
import DateSelectGrouped from '../../../../app/component/stop/DateSelectGrouped';
import ScheduleConstantOperation from '../../../../app/component/routepage/schedule/ScheduleConstantOperation';
import RouteControlPanel from '../../../../app/component/routepage/RouteControlPanel';
import SecondaryButton from '../../../../app/component/SecondaryButton';
import { DATE_FORMAT } from '../../../../app/constants';
import { mockContext } from '../../helpers/mock-context';
import { mockMatch, mockRouter } from '../../helpers/mock-router';
import * as useTranslationsContext from '../../../../app/util/useTranslationsContext';
import * as ConfigContext from '../../../../app/configurations/ConfigContext';
import * as scheduleValidation from '../../../../app/util/scheduleValidation';
import * as scheduleDataUtils from '../../../../app/util/scheduleDataUtils';
import * as scheduleTripsUtils from '../../../../app/util/scheduleTripsUtils';
import * as scheduleRedirectHook from '../../../../app/hooks/useScheduleRedirects';

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
  let buildAvailableDatesStub;
  let getTripsListStub;
  let selectScheduleDataStub;
  let useScheduleRedirectsStub;
  let routerReplaceSpy;

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

    buildAvailableDatesStub = sinon
      .stub(scheduleDataUtils, 'buildAvailableDates')
      .returns([
        DateTime.fromISO('2024-01-01'),
        DateTime.fromISO('2024-01-02'),
      ]);

    getTripsListStub = sinon.stub(scheduleTripsUtils, 'getTripsList').returns({
      trips: [{ id: 'trip-1', stoptimes: [] }],
      noTripsMessage: null,
    });

    selectScheduleDataStub = sinon
      .stub(scheduleDataUtils, 'selectScheduleData')
      .returns(mockFirstDepartures);

    useScheduleRedirectsStub = sinon
      .stub(scheduleRedirectHook, 'useScheduleRedirects')
      .returns(undefined);

    routerReplaceSpy = sinon.spy(mockRouter, 'replace');

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
    if (buildAvailableDatesStub) {
      buildAvailableDatesStub.restore();
    }
    if (getTripsListStub) {
      getTripsListStub.restore();
    }
    if (selectScheduleDataStub) {
      selectScheduleDataStub.restore();
    }
    if (useScheduleRedirectsStub) {
      useScheduleRedirectsStub.restore();
    }
    if (routerReplaceSpy) {
      routerReplaceSpy.restore();
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

      const header = wrapper.find(ScheduleHeader);
      expect(header).to.have.lengthOf(1);
      expect(header.prop('stops')).to.equal(defaultProps.pattern.stops);
      expect(header.prop('from')).to.equal(0);
      expect(header.prop('to')).to.equal(defaultProps.pattern.stops.length - 1);

      const tripList = wrapper.find(ScheduleTripList);
      expect(tripList).to.have.lengthOf(1);
      expect(tripList.prop('trips')).to.deep.equal(
        getTripsListStub.getCall(0).returnValue.trips,
      );
      expect(tripList.prop('fromIdx')).to.equal(0);
      expect(tripList.prop('toIdx')).to.equal(
        defaultProps.pattern.stops.length - 1,
      );
    });
  });

  describe('Layout and interactions', () => {
    it('should render route controls and date select', () => {
      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      const controlPanel = wrapper.find(RouteControlPanel);
      expect(controlPanel).to.have.lengthOf(1);
      expect(controlPanel.prop('route')).to.equal(defaultProps.route);
      expect(controlPanel.prop('breakpoint')).to.equal(defaultProps.breakpoint);

      const dateSelect = wrapper.find(DateSelectGrouped);
      expect(dateSelect).to.have.lengthOf(1);
      expect(dateSelect.prop('dateFormat')).to.equal(DATE_FORMAT);
    });

    it('should update trip list bounds when header changes', () => {
      const patternWithMoreStops = {
        ...defaultProps.pattern,
        stops: [
          { id: 'stop1', name: 'Stop 1' },
          { id: 'stop2', name: 'Stop 2' },
          { id: 'stop3', name: 'Stop 3' },
          { id: 'stop4', name: 'Stop 4' },
        ],
      };
      const props = {
        ...defaultProps,
        pattern: patternWithMoreStops,
        route: {
          ...defaultProps.route,
          patterns: [
            { ...defaultProps.route.patterns[0], ...patternWithMoreStops },
          ],
        },
      };

      const wrapper = shallow(
        <ScheduleContainer {...props} match={mockMatchWithRouter} />,
      );

      wrapper.find(ScheduleHeader).prop('onFromSelectChange')(2);
      wrapper.update();

      const tripList = wrapper.find(ScheduleTripList);
      expect(tripList.prop('fromIdx')).to.equal(2);
      expect(tripList.prop('toIdx')).to.equal(3);

      wrapper.find(ScheduleHeader).prop('onToSelectChange')(2);
      wrapper.update();
      expect(wrapper.find(ScheduleTripList).prop('toIdx')).to.equal(2);
    });

    it('should trigger router replace when other dates selection changes', () => {
      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      wrapper.find(DateSelectGrouped).prop('onDateChange')('20240102');

      expect(routerReplaceSpy.calledOnce).to.equal(true);
      expect(
        routerReplaceSpy.calledWithMatch({
          query: { serviceDay: '20240102' },
        }),
      ).to.equal(true);
    });

    it('should still render date select when no options are available', () => {
      buildAvailableDatesStub.returns([DateTime.fromISO('2024-01-01')]);

      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      expect(wrapper.find(DateSelectGrouped)).to.have.lengthOf(1);
    });
  });

  describe('Conditional rendering', () => {
    it('should render constant operation view when validation says so', () => {
      mockConfig.constantOperationRoutes = {
        'HSL:1001': {
          en: { text: 'Always on', link: 'https://example.com' },
        },
      };
      validateScheduleDataStub.returns({
        shouldRender: true,
        reason: 'constant-operation',
      });

      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      const constantOp = wrapper.find(ScheduleConstantOperation);
      expect(constantOp).to.have.lengthOf(1);
      expect(constantOp.prop('match')).to.equal(mockMatchWithRouter);
      expect(constantOp.prop('route')).to.equal(defaultProps.route);
    });

    it('should return null when redirect decision requires redirect', () => {
      calculateRedirectDecisionStub.returns({
        shouldRedirect: true,
        reason: 'no-redirect',
        redirectDate: null,
        redirectPath: null,
      });

      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      expect(wrapper.isEmptyRender()).to.equal(true);
      expect(useScheduleRedirectsStub.calledOnce).to.equal(true);
      expect(
        useScheduleRedirectsStub.firstCall.args[0].redirectDecision
          .shouldRedirect,
      ).to.equal(true);
    });

    it('should render no-trips message when provided', () => {
      getTripsListStub.returns({
        trips: null,
        noTripsMessage: <div className="text-center">No trips</div>,
      });

      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      expect(wrapper.find('.text-center')).to.have.lengthOf(1);
    });

    it('should render timetable print button when route PDF exists', () => {
      mockConfig.URL.ROUTE_TIMETABLES = { HSL: 'https://example.com' };
      mockConfig.timetables = {
        HSL: {
          routeTimetableUrlResolver: sinon
            .stub()
            .returns({ href: 'https://example.com/timetable.pdf' }),
        },
      };

      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      const printButton = wrapper
        .find(SecondaryButton)
        .filterWhere(button => button.prop('buttonName') === 'print-timetable');
      expect(printButton).to.have.lengthOf(1);
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
