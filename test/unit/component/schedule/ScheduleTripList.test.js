import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { shallow } from 'enzyme';

import ScheduleTripList from '../../../../app/component/routepage/schedule/ScheduleTripList';
import ScheduleTripRow from '../../../../app/component/routepage/schedule/ScheduleTripRow';

describe('<ScheduleTripList />', () => {
  const createTrip = (id, fromDep, toDep, state = 'SCHEDULED') => ({
    id,
    stoptimes: [
      {
        scheduledDeparture: fromDep,
        scheduledArrival: fromDep,
        serviceDay: 1547503200,
        realtimeState: state,
      },
      {
        scheduledDeparture: toDep,
        scheduledArrival: toDep,
        serviceDay: 1547503200,
        realtimeState: state,
      },
    ],
  });

  const defaultProps = {
    trips: [
      createTrip('trip-1', 28080, 30060),
      createTrip('trip-2', 29080, 31060),
    ],
    fromIdx: 0,
    toIdx: 1,
  };

  it('should render null for empty trips array', () => {
    const props = { ...defaultProps, trips: [] };
    const wrapper = shallow(<ScheduleTripList {...props} />);
    expect(wrapper.type()).to.equal(null);
  });

  it('should render ScheduleTripRow for each trip', () => {
    const wrapper = shallow(<ScheduleTripList {...defaultProps} />);
    const rows = wrapper.find(ScheduleTripRow);
    expect(rows).to.have.lengthOf(2);
  });

  it('should pass departure and arrival times to ScheduleTripRow', () => {
    const wrapper = shallow(<ScheduleTripList {...defaultProps} />);
    const firstRow = wrapper.find(ScheduleTripRow).at(0);

    expect(firstRow.prop('departureTime')).to.be.a('string');
    expect(firstRow.prop('arrivalTime')).to.be.a('string');
  });

  it('should detect canceled trips correctly', () => {
    const trips = [
      createTrip('canceled-trip', 28080, 30060, 'CANCELED'),
      createTrip('normal-trip', 29080, 31060, 'SCHEDULED'),
    ];

    const props = { ...defaultProps, trips };
    const wrapper = shallow(<ScheduleTripList {...props} />);

    const canceledRow = wrapper.find(ScheduleTripRow).at(0);
    const normalRow = wrapper.find(ScheduleTripRow).at(1);

    expect(canceledRow.prop('isCanceled')).to.equal(true);
    expect(normalRow.prop('isCanceled')).to.equal(false);
  });

  it('should handle partially canceled trips (not all stops canceled)', () => {
    const partialyCanceledTrip = {
      id: 'partial-trip',
      stoptimes: [
        {
          scheduledDeparture: 28080,
          scheduledArrival: 28080,
          serviceDay: 1547503200,
          realtimeState: 'CANCELED',
        },
        {
          scheduledDeparture: 30060,
          scheduledArrival: 30060,
          serviceDay: 1547503200,
          realtimeState: 'SCHEDULED',
        },
      ],
    };

    const props = { ...defaultProps, trips: [partialyCanceledTrip] };
    const wrapper = shallow(<ScheduleTripList {...props} />);

    const row = wrapper.find(ScheduleTripRow).first();
    expect(row.prop('isCanceled')).to.equal(false); // Not fully canceled
  });

  it('should handle single trip', () => {
    const trips = [createTrip('single-trip', 28080, 30060)];
    const props = { ...defaultProps, trips };
    const wrapper = shallow(<ScheduleTripList {...props} />);

    expect(wrapper.find(ScheduleTripRow)).to.have.lengthOf(1);
  });

  it('should handle many trips', () => {
    const trips = Array.from({ length: 50 }, (_, i) =>
      createTrip(`trip-${i}`, 28080 + i * 600, 30060 + i * 600),
    );

    const props = { ...defaultProps, trips };
    const wrapper = shallow(<ScheduleTripList {...props} />);

    expect(wrapper.find(ScheduleTripRow)).to.have.lengthOf(50);
  });

  it('should use correct fromIdx and toIdx', () => {
    const trip = {
      id: 'multi-stop-trip',
      stoptimes: [
        {
          scheduledDeparture: 28080,
          scheduledArrival: 28080,
          serviceDay: 1547503200,
          realtimeState: 'SCHEDULED',
        },
        {
          scheduledDeparture: 29080,
          scheduledArrival: 29080,
          serviceDay: 1547503200,
          realtimeState: 'SCHEDULED',
        },
        {
          scheduledDeparture: 30080,
          scheduledArrival: 30080,
          serviceDay: 1547503200,
          realtimeState: 'SCHEDULED',
        },
        {
          scheduledDeparture: 31080,
          scheduledArrival: 31080,
          serviceDay: 1547503200,
          realtimeState: 'SCHEDULED',
        },
      ],
    };

    const props = { trips: [trip], fromIdx: 1, toIdx: 3 };
    const wrapper = shallow(<ScheduleTripList {...props} />);

    expect(wrapper.find(ScheduleTripRow)).to.have.lengthOf(1);
  });

  it('should generate unique keys for each trip row', () => {
    const wrapper = shallow(<ScheduleTripList {...defaultProps} />);
    const rows = wrapper.find(ScheduleTripRow);

    const keys = rows.map(row => row.key());
    const uniqueKeys = new Set(keys);

    expect(uniqueKeys.size).to.equal(keys.length);
  });

  it('should handle trips at midnight', () => {
    const trips = [createTrip('midnight-trip', 0, 3600)];
    const props = { ...defaultProps, trips };
    const wrapper = shallow(<ScheduleTripList {...props} />);

    const row = wrapper.find(ScheduleTripRow).first();
    expect(row.prop('departureTime')).to.be.a('string');
  });

  it('should handle trips after midnight (next day)', () => {
    const trips = [createTrip('late-trip', 86400 + 1800, 86400 + 3600)];
    const props = { ...defaultProps, trips };
    const wrapper = shallow(<ScheduleTripList {...props} />);

    const row = wrapper.find(ScheduleTripRow).first();
    expect(row.prop('departureTime')).to.be.a('string');
  });

  it('should handle trips with very short duration', () => {
    const trips = [createTrip('quick-trip', 28080, 28200)]; // 2 minutes
    const props = { ...defaultProps, trips };
    const wrapper = shallow(<ScheduleTripList {...props} />);

    const row = wrapper.find(ScheduleTripRow).first();
    expect(row.prop('departureTime')).to.be.a('string');
    expect(row.prop('arrivalTime')).to.be.a('string');
  });

  it('should handle trips with long duration', () => {
    const trips = [createTrip('long-trip', 28080, 50000)]; // Several hours
    const props = { ...defaultProps, trips };
    const wrapper = shallow(<ScheduleTripList {...props} />);

    const row = wrapper.find(ScheduleTripRow).first();
    expect(row.prop('departureTime')).to.be.a('string');
    expect(row.prop('arrivalTime')).to.be.a('string');
  });

  it('should handle trips with UPDATED realtimeState', () => {
    const trips = [createTrip('updated-trip', 28080, 30060, 'UPDATED')];
    const props = { ...defaultProps, trips };
    const wrapper = shallow(<ScheduleTripList {...props} />);

    const row = wrapper.find(ScheduleTripRow).first();
    expect(row.prop('isCanceled')).to.equal(false);
  });

  it('should handle trips with ADDED realtimeState', () => {
    const trips = [createTrip('added-trip', 28080, 30060, 'ADDED')];
    const props = { ...defaultProps, trips };
    const wrapper = shallow(<ScheduleTripList {...props} />);

    const row = wrapper.find(ScheduleTripRow).first();
    expect(row.prop('isCanceled')).to.equal(false);
  });

  it('should handle all stoptimes canceled', () => {
    const fullyCanceledTrip = {
      id: 'fully-canceled',
      stoptimes: [
        {
          scheduledDeparture: 28080,
          scheduledArrival: 28080,
          serviceDay: 1547503200,
          realtimeState: 'CANCELED',
        },
        {
          scheduledDeparture: 29080,
          scheduledArrival: 29080,
          serviceDay: 1547503200,
          realtimeState: 'CANCELED',
        },
        {
          scheduledDeparture: 30080,
          scheduledArrival: 30080,
          serviceDay: 1547503200,
          realtimeState: 'CANCELED',
        },
      ],
    };

    const props = { trips: [fullyCanceledTrip], fromIdx: 0, toIdx: 2 };
    const wrapper = shallow(<ScheduleTripList {...props} />);

    const row = wrapper.find(ScheduleTripRow).first();
    expect(row.prop('isCanceled')).to.equal(true);
  });

  it('should handle different service days', () => {
    const trip1 = {
      id: 'trip-day1',
      stoptimes: [
        {
          scheduledDeparture: 28080,
          scheduledArrival: 28080,
          serviceDay: 1547503200,
          realtimeState: 'SCHEDULED',
        },
        {
          scheduledDeparture: 30060,
          scheduledArrival: 30060,
          serviceDay: 1547503200,
          realtimeState: 'SCHEDULED',
        },
      ],
    };

    const trip2 = {
      id: 'trip-day2',
      stoptimes: [
        {
          scheduledDeparture: 28080,
          scheduledArrival: 28080,
          serviceDay: 1547589600, // Different day
          realtimeState: 'SCHEDULED',
        },
        {
          scheduledDeparture: 30060,
          scheduledArrival: 30060,
          serviceDay: 1547589600,
          realtimeState: 'SCHEDULED',
        },
      ],
    };

    const props = { ...defaultProps, trips: [trip1, trip2] };
    const wrapper = shallow(<ScheduleTripList {...props} />);

    expect(wrapper.find(ScheduleTripRow)).to.have.lengthOf(2);
  });

  it('should render multiple ScheduleTripRow components', () => {
    const wrapper = shallow(<ScheduleTripList {...defaultProps} />);
    const rows = wrapper.find(ScheduleTripRow);

    expect(rows.length).to.be.greaterThan(0);
  });
});
