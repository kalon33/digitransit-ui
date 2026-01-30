import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { shallow } from 'enzyme';
import sinon from 'sinon';

import ScheduleHeader from '../../../../app/component/routepage/schedule/ScheduleHeader';
import ScheduleDropdown from '../../../../app/component/routepage/schedule/ScheduleDropdown';
import StopHeaderDisplay from '../../../../app/component/routepage/schedule/StopHeaderDisplay';

describe('<ScheduleHeader />', () => {
  const defaultStops = [
    { id: 'stop1', name: 'First Stop' },
    { id: 'stop2', name: 'Second Stop' },
    { id: 'stop3', name: 'Third Stop' },
    { id: 'stop4', name: 'Fourth Stop' },
  ];

  const defaultProps = {
    stops: defaultStops,
    from: 0,
    to: 3,
    onFromSelectChange: sinon.spy(),
    onToSelectChange: sinon.spy(),
  };

  it('should render without crashing', () => {
    const wrapper = shallow(<ScheduleHeader {...defaultProps} />);
    expect(wrapper.exists()).to.equal(true);
  });

  it('should render two ScheduleDropdown components', () => {
    const wrapper = shallow(<ScheduleHeader {...defaultProps} />);
    const dropdowns = wrapper.find(ScheduleDropdown);
    expect(dropdowns).to.have.lengthOf(2);
  });

  it('should render from dropdown with correct props', () => {
    const wrapper = shallow(<ScheduleHeader {...defaultProps} />);
    const fromDropdown = wrapper.find(ScheduleDropdown).at(0);

    expect(fromDropdown.prop('id')).to.equal('origin');
    expect(fromDropdown.prop('labelId')).to.equal('origin');
    expect(fromDropdown.prop('title')).to.equal('First Stop');
    expect(fromDropdown.prop('onSelectChange')).to.equal(
      defaultProps.onFromSelectChange,
    );
  });

  it('should render to dropdown with correct props', () => {
    const wrapper = shallow(<ScheduleHeader {...defaultProps} />);
    const toDropdown = wrapper.find(ScheduleDropdown).at(1);

    expect(toDropdown.prop('id')).to.equal('destination');
    expect(toDropdown.prop('labelId')).to.equal('destination');
    expect(toDropdown.prop('title')).to.equal('Fourth Stop');
    expect(toDropdown.prop('onSelectChange')).to.equal(
      defaultProps.onToSelectChange,
    );
    expect(toDropdown.prop('alignRight')).to.equal(true);
  });

  it('should create correct from options based on to value', () => {
    const wrapper = shallow(<ScheduleHeader {...defaultProps} />);
    const fromDropdown = wrapper.find(ScheduleDropdown).at(0);
    const fromOptions = fromDropdown.prop('list');

    expect(fromOptions).to.have.lengthOf(3); // 0 to 2 (before to=3)
    expect(fromOptions[0]).to.deep.equal({ label: 'First Stop', value: 0 });
    expect(fromOptions[1]).to.deep.equal({ label: 'Second Stop', value: 1 });
    expect(fromOptions[2]).to.deep.equal({ label: 'Third Stop', value: 2 });
  });

  it('should create correct to options based on from value', () => {
    const wrapper = shallow(<ScheduleHeader {...defaultProps} />);
    const toDropdown = wrapper.find(ScheduleDropdown).at(1);
    const toOptions = toDropdown.prop('list');

    expect(toOptions).to.have.lengthOf(3); // from=0, so 1-3 available
    expect(toOptions[0]).to.deep.equal({ label: 'Second Stop', value: 1 });
    expect(toOptions[1]).to.deep.equal({ label: 'Third Stop', value: 2 });
    expect(toOptions[2]).to.deep.equal({ label: 'Fourth Stop', value: 3 });
  });

  it('should handle from and to at adjacent stops', () => {
    const props = { ...defaultProps, from: 1, to: 2 };
    const wrapper = shallow(<ScheduleHeader {...props} />);

    const fromDropdown = wrapper.find(ScheduleDropdown).at(0);
    const toDropdown = wrapper.find(ScheduleDropdown).at(1);

    const fromOptions = fromDropdown.prop('list');
    const toOptions = toDropdown.prop('list');

    expect(fromOptions).to.have.lengthOf(2); // stops 0-1
    expect(toOptions).to.have.lengthOf(2); // stops 2-3
  });

  it('should render StopHeaderDisplay component', () => {
    const wrapper = shallow(<ScheduleHeader {...defaultProps} />);
    const stopHeaderDisplay = wrapper.find(StopHeaderDisplay);

    expect(stopHeaderDisplay.exists()).to.equal(true);
    expect(stopHeaderDisplay.prop('fromDisplayName')).to.equal('First Stop');
    expect(stopHeaderDisplay.prop('toDisplayName')).to.equal('Fourth Stop');
  });

  it('should display correct stop names in printable headers', () => {
    const wrapper = shallow(<ScheduleHeader {...defaultProps} />);
    const stopHeaderDisplay = wrapper.find(StopHeaderDisplay);

    expect(stopHeaderDisplay.prop('fromDisplayName')).to.equal('First Stop');
    expect(stopHeaderDisplay.prop('toDisplayName')).to.equal('Fourth Stop');
  });

  it('should update stop names when from changes', () => {
    const props = { ...defaultProps, from: 2 };
    const wrapper = shallow(<ScheduleHeader {...props} />);

    const fromDropdown = wrapper.find(ScheduleDropdown).at(0);
    expect(fromDropdown.prop('title')).to.equal('Third Stop');
  });

  it('should update stop names when to changes', () => {
    const props = { ...defaultProps, to: 1 };
    const wrapper = shallow(<ScheduleHeader {...props} />);

    const toDropdown = wrapper.find(ScheduleDropdown).at(1);
    expect(toDropdown.prop('title')).to.equal('Second Stop');
  });

  it('should handle stops with long names', () => {
    const stopsWithLongNames = [
      { id: 'stop1', name: 'Very Long Stop Name That Exceeds Normal Length' },
      { id: 'stop2', name: 'Another Very Long Stop Name' },
    ];
    const props = {
      ...defaultProps,
      stops: stopsWithLongNames,
      from: 0,
      to: 1,
    };
    const wrapper = shallow(<ScheduleHeader {...props} />);

    const fromDropdown = wrapper.find(ScheduleDropdown).at(0);
    expect(fromDropdown.prop('title')).to.equal(
      'Very Long Stop Name That Exceeds Normal Length',
    );
  });

  it('should handle minimum two stops', () => {
    const twoStops = [
      { id: 'stop1', name: 'Start' },
      { id: 'stop2', name: 'End' },
    ];
    const props = { ...defaultProps, stops: twoStops, from: 0, to: 1 };
    const wrapper = shallow(<ScheduleHeader {...props} />);

    const dropdowns = wrapper.find(ScheduleDropdown);
    expect(dropdowns).to.have.lengthOf(2);

    const fromOptions = dropdowns.at(0).prop('list');
    const toOptions = dropdowns.at(1).prop('list');

    expect(fromOptions).to.have.lengthOf(1);
    expect(toOptions).to.have.lengthOf(1);
  });

  it('should handle many stops', () => {
    const manyStops = Array.from({ length: 20 }, (_, i) => ({
      id: `stop${i}`,
      name: `Stop ${i + 1}`,
    }));
    const props = { ...defaultProps, stops: manyStops, from: 0, to: 19 };
    const wrapper = shallow(<ScheduleHeader {...props} />);

    const fromDropdown = wrapper.find(ScheduleDropdown).at(0);
    const fromOptions = fromDropdown.prop('list');

    expect(fromOptions).to.have.lengthOf(19); // 0 to 18
  });

  it('should handle from at last possible position', () => {
    const props = { ...defaultProps, from: 2, to: 3 };
    const wrapper = shallow(<ScheduleHeader {...props} />);

    const fromDropdown = wrapper.find(ScheduleDropdown).at(0);
    const fromOptions = fromDropdown.prop('list');

    expect(fromOptions).to.have.lengthOf(3); // 0 to 2
  });

  it('should handle to at first possible position after from', () => {
    const props = { ...defaultProps, from: 0, to: 1 };
    const wrapper = shallow(<ScheduleHeader {...props} />);

    const toDropdown = wrapper.find(ScheduleDropdown).at(1);
    const toOptions = toDropdown.prop('list');

    expect(toOptions[0].value).to.equal(1);
  });

  it('should have correct CSS classes', () => {
    const wrapper = shallow(<ScheduleHeader {...defaultProps} />);

    expect(wrapper.find('.route-schedule-header').exists()).to.equal(true);
    expect(wrapper.find('.route-schedule-dropdowns').exists()).to.equal(true);
    expect(wrapper.find(StopHeaderDisplay).exists()).to.equal(true);
  });

  it('should maintain stop order in options', () => {
    const wrapper = shallow(<ScheduleHeader {...defaultProps} />);
    const fromDropdown = wrapper.find(ScheduleDropdown).at(0);
    const fromOptions = fromDropdown.prop('list');

    for (let i = 0; i < fromOptions.length; i++) {
      expect(fromOptions[i].value).to.equal(i);
    }
  });

  it('should handle when to equals last stop', () => {
    const props = { ...defaultProps, from: 0, to: 3 }; // to at max
    const wrapper = shallow(<ScheduleHeader {...props} />);

    // Should handle normally
    expect(wrapper.exists()).to.equal(true);
  });

  it('should display correct values in all option objects', () => {
    const wrapper = shallow(<ScheduleHeader {...defaultProps} />);
    const fromDropdown = wrapper.find(ScheduleDropdown).at(0);
    const fromOptions = fromDropdown.prop('list');

    fromOptions.forEach((option, index) => {
      expect(option).to.have.property('label');
      expect(option).to.have.property('value');
      expect(option.value).to.equal(index);
      expect(option.label).to.equal(defaultStops[index].name);
    });
  });
});
