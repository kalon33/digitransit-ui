import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { shallow } from 'enzyme';

import Icon from '@digitransit-component/digitransit-component-icon';
import ScheduleTripRow from '../../../../app/component/routepage/schedule/ScheduleTripRow';

describe('<ScheduleTripRow />', () => {
  const defaultProps = {
    departureTime: '08:00',
    arrivalTime: '08:30',
    isCanceled: false,
  };

  it('should render without crashing', () => {
    const wrapper = shallow(<ScheduleTripRow {...defaultProps} />);
    expect(wrapper.exists()).to.equal(true);
  });

  it('should display departure time', () => {
    const wrapper = shallow(<ScheduleTripRow {...defaultProps} />);
    const departureDiv = wrapper.find('.trip-from');
    expect(departureDiv.text()).to.equal('08:00');
  });

  it('should display arrival time', () => {
    const wrapper = shallow(<ScheduleTripRow {...defaultProps} />);
    const arrivalDiv = wrapper.find('.trip-to');
    expect(arrivalDiv.text()).to.equal('08:30');
  });

  it('should render arrow icon between times', () => {
    const wrapper = shallow(<ScheduleTripRow {...defaultProps} />);
    const icon = wrapper.find(Icon);
    expect(icon).to.have.lengthOf(1);
    expect(icon.prop('img')).to.equal('arrow');
    expect(icon.prop('color')).to.equal('#888888');
  });

  it('should apply canceled class when isCanceled is true', () => {
    const props = { ...defaultProps, isCanceled: true };
    const wrapper = shallow(<ScheduleTripRow {...props} />);

    const departureDiv = wrapper.find('.trip-from');
    const arrivalDiv = wrapper.find('.trip-to');

    expect(departureDiv.hasClass('canceled')).to.equal(true);
    expect(arrivalDiv.hasClass('canceled')).to.equal(true);
  });

  it('should not apply canceled class when isCanceled is false', () => {
    const wrapper = shallow(<ScheduleTripRow {...defaultProps} />);

    const departureDiv = wrapper.find('.trip-from');
    const arrivalDiv = wrapper.find('.trip-to');

    expect(departureDiv.hasClass('canceled')).to.equal(false);
    expect(arrivalDiv.hasClass('canceled')).to.equal(false);
  });

  it('should use false as default for isCanceled', () => {
    const props = {
      departureTime: '08:00',
      arrivalTime: '08:30',
    };
    const wrapper = shallow(<ScheduleTripRow {...props} />);

    const departureDiv = wrapper.find('.trip-from');
    expect(departureDiv.hasClass('canceled')).to.equal(false);
  });

  it('should have role="listitem" for accessibility', () => {
    const wrapper = shallow(<ScheduleTripRow {...defaultProps} />);
    const row = wrapper.find('[role="listitem"]');
    expect(row).to.have.lengthOf(1);
  });

  it('should be keyboard accessible with tabIndex', () => {
    const wrapper = shallow(<ScheduleTripRow {...defaultProps} />);
    const row = wrapper.find('[role="listitem"]');
    expect(row.prop('tabIndex')).to.equal(0);
  });

  it('should have proper structure with trip-column class', () => {
    const wrapper = shallow(<ScheduleTripRow {...defaultProps} />);
    expect(wrapper.find('.trip-column')).to.have.lengthOf(1);
  });

  it('should have trip-separator between times', () => {
    const wrapper = shallow(<ScheduleTripRow {...defaultProps} />);
    expect(wrapper.find('.trip-separator')).to.have.lengthOf(1);
  });

  it('should apply trip-label class to both times', () => {
    const wrapper = shallow(<ScheduleTripRow {...defaultProps} />);
    const labels = wrapper.find('.trip-label');
    expect(labels).to.have.lengthOf(2);
  });

  it('should handle midnight times', () => {
    const props = {
      ...defaultProps,
      departureTime: '00:00',
      arrivalTime: '00:15',
    };
    const wrapper = shallow(<ScheduleTripRow {...props} />);

    const departureDiv = wrapper.find('.trip-from');
    const arrivalDiv = wrapper.find('.trip-to');

    expect(departureDiv.text()).to.equal('00:00');
    expect(arrivalDiv.text()).to.equal('00:15');
  });

  it('should handle times after midnight (next day)', () => {
    const props = {
      ...defaultProps,
      departureTime: '24:30',
      arrivalTime: '25:00',
    };
    const wrapper = shallow(<ScheduleTripRow {...props} />);

    const departureDiv = wrapper.find('.trip-from');
    expect(departureDiv.text()).to.equal('24:30');
  });

  it('should handle same departure and arrival time', () => {
    const props = {
      ...defaultProps,
      departureTime: '10:00',
      arrivalTime: '10:00',
    };
    const wrapper = shallow(<ScheduleTripRow {...props} />);

    const departureDiv = wrapper.find('.trip-from');
    const arrivalDiv = wrapper.find('.trip-to');

    expect(departureDiv.text()).to.equal('10:00');
    expect(arrivalDiv.text()).to.equal('10:00');
  });

  it('should handle late night times', () => {
    const props = {
      ...defaultProps,
      departureTime: '23:45',
      arrivalTime: '24:15',
    };
    const wrapper = shallow(<ScheduleTripRow {...props} />);

    expect(wrapper.exists()).to.equal(true);
  });

  it('should have correct displayName', () => {
    expect(ScheduleTripRow.displayName).to.equal('ScheduleTripRow');
  });

  it('should render with different time formats', () => {
    const props = {
      ...defaultProps,
      departureTime: '9:05',
      arrivalTime: '9:35',
    };
    const wrapper = shallow(<ScheduleTripRow {...props} />);

    const departureDiv = wrapper.find('.trip-from');
    expect(departureDiv.text()).to.equal('9:05');
  });

  it('should maintain structure when canceled', () => {
    const props = { ...defaultProps, isCanceled: true };
    const wrapper = shallow(<ScheduleTripRow {...props} />);

    expect(wrapper.find('.trip-column')).to.have.lengthOf(1);
    expect(wrapper.find('.trip-separator')).to.have.lengthOf(1);
    expect(wrapper.find(Icon)).to.have.lengthOf(1);
  });

  it('should render row wrapper with correct class', () => {
    const wrapper = shallow(<ScheduleTripRow {...defaultProps} />);
    const row = wrapper.find('.row');
    expect(row).to.have.lengthOf(1);
  });

  it('should handle very long duration trips', () => {
    const props = {
      ...defaultProps,
      departureTime: '06:00',
      arrivalTime: '22:30',
    };
    const wrapper = shallow(<ScheduleTripRow {...props} />);

    expect(wrapper.find('.trip-from').text()).to.equal('06:00');
    expect(wrapper.find('.trip-to').text()).to.equal('22:30');
  });

  it('should handle very short duration trips', () => {
    const props = {
      ...defaultProps,
      departureTime: '12:00',
      arrivalTime: '12:03',
    };
    const wrapper = shallow(<ScheduleTripRow {...props} />);

    expect(wrapper.find('.trip-from').text()).to.equal('12:00');
    expect(wrapper.find('.trip-to').text()).to.equal('12:03');
  });

  it('should always render departure before arrival in DOM order', () => {
    const wrapper = shallow(<ScheduleTripRow {...defaultProps} />);
    const labels = wrapper.find('.trip-label');

    expect(labels.at(0).hasClass('trip-from')).to.equal(true);
    expect(labels.at(1).hasClass('trip-to')).to.equal(true);
  });

  it('should render icon between departure and arrival', () => {
    const wrapper = shallow(<ScheduleTripRow {...defaultProps} />);
    const tripColumn = wrapper.find('.trip-column');
    const children = tripColumn.children();

    expect(children.at(0).hasClass('trip-from')).to.equal(true);
    expect(children.at(1).hasClass('trip-separator')).to.equal(true);
    expect(children.at(2).hasClass('trip-to')).to.equal(true);
  });
});
