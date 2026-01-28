import React from 'react';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import { DateTime } from 'luxon';

import ScheduleDayTabs from '../../../../app/component/routepage/schedule/ScheduleDayTabs';

describe('<ScheduleDayTabs />', () => {
  let defaultData;
  let defaultProps;

  beforeEach(() => {
    const wantedDay = DateTime.fromISO('2024-01-15'); // Monday
    const weekStart = wantedDay.startOf('week');

    defaultData = [
      [weekStart], // weekStarts
      [['1234567']], // days
      [
        '15.1.2024 - 21.1.2024', // timeRange
        wantedDay, // wantedDay
        1, // weekday (Monday)
        ['1234567'], // dayArray
        weekStart, // weekStart
      ], // range
      [], // options
      false, // weeksAreSame
      '20240115', // pastDate
    ];

    defaultProps = {
      data: defaultData,
      focusedTab: null,
      tabRefs: { current: {} },
      onTabClick: sinon.spy(),
      onTabFocus: sinon.spy(),
      locale: 'en',
    };
  });

  it('should render null when data has less than 3 elements', () => {
    const props = { ...defaultProps, data: [[], []] };
    const wrapper = shallow(<ScheduleDayTabs {...props} />);
    expect(wrapper.type()).to.equal(null);
  });

  it('should render null when dayArray is full week (1234567)', () => {
    const wrapper = shallow(<ScheduleDayTabs {...defaultProps} />);
    expect(wrapper.type()).to.equal(null);
  });

  it('should render tabs for partial week', () => {
    const wantedDay = DateTime.fromISO('2024-01-15');
    const weekStart = wantedDay.startOf('week');

    const data = [
      [weekStart],
      [['12345', '67']], // Weekdays and weekend
      ['15.1.2024 - 21.1.2024', wantedDay, 1, ['12345', '67'], weekStart],
      [],
      false,
      '20240115',
    ];

    const props = { ...defaultProps, data };
    const wrapper = shallow(<ScheduleDayTabs {...props} />);

    expect(wrapper.type()).to.not.equal(null);
    expect(wrapper.find('button')).to.have.lengthOf(2); // 12345 and 67
  });

  it('should render tabs for individual days', () => {
    const wantedDay = DateTime.fromISO('2024-01-15');
    const weekStart = wantedDay.startOf('week');

    const data = [
      [weekStart],
      [['1', '3', '5']], // Mon, Wed, Fri
      ['15.1.2024 - 21.1.2024', wantedDay, 1, ['1', '3', '5'], weekStart],
      [],
      false,
      '20240115',
    ];

    const props = { ...defaultProps, data };
    const wrapper = shallow(<ScheduleDayTabs {...props} />);

    expect(wrapper.find('button')).to.have.lengthOf(3);
  });

  it('should mark current day as active', () => {
    const wantedDay = DateTime.fromISO('2024-01-17'); // Wednesday
    const weekStart = wantedDay.startOf('week');

    const data = [
      [weekStart],
      [['1', '3', '5']],
      ['15.1.2024 - 21.1.2024', wantedDay, 3, ['1', '3', '5'], weekStart],
      [],
      false,
      '20240115',
    ];

    const props = { ...defaultProps, data };
    const wrapper = shallow(<ScheduleDayTabs {...props} />);

    const buttons = wrapper.find('button');
    const activeButton = buttons.findWhere(
      btn =>
        btn.prop('className') && btn.prop('className').includes('is-active'),
    );

    expect(activeButton).to.have.lengthOf.at.least(1);
  });

  it('should call onTabClick when tab is clicked', () => {
    const wantedDay = DateTime.fromISO('2024-01-15');
    const weekStart = wantedDay.startOf('week');

    const data = [
      [weekStart],
      [['1', '3', '5']],
      ['15.1.2024 - 21.1.2024', wantedDay, 1, ['1', '3', '5'], weekStart],
      [],
      false,
      '20240115',
    ];

    const props = { ...defaultProps, data };
    const wrapper = shallow(<ScheduleDayTabs {...props} />);

    const button = wrapper.find('button').first();
    button.simulate('click');

    expect(props.onTabClick.called).to.equal(true);
  });

  it('should set aria-selected on active tab', () => {
    const wantedDay = DateTime.fromISO('2024-01-15');
    const weekStart = wantedDay.startOf('week');

    const data = [
      [weekStart],
      [['1', '3', '5']],
      ['15.1.2024 - 21.1.2024', wantedDay, 1, ['1', '3', '5'], weekStart],
      [],
      false,
      '20240115',
    ];

    const props = { ...defaultProps, data };
    const wrapper = shallow(<ScheduleDayTabs {...props} />);

    const activeTab = wrapper
      .find('button')
      .findWhere(btn => btn.prop('aria-selected') === true);

    expect(activeTab.length).to.be.greaterThan(0);
  });

  it('should have correct role attributes', () => {
    const wantedDay = DateTime.fromISO('2024-01-15');
    const weekStart = wantedDay.startOf('week');

    const data = [
      [weekStart],
      [['1', '3']],
      ['15.1.2024 - 21.1.2024', wantedDay, 1, ['1', '3'], weekStart],
      [],
      false,
      '20240115',
    ];

    const props = { ...defaultProps, data };
    const wrapper = shallow(<ScheduleDayTabs {...props} />);

    expect(wrapper.find('[role="tablist"]')).to.have.lengthOf(1);
    expect(wrapper.find('[role="tab"]').length).to.be.greaterThan(0);
  });

  it('should set tabIndex to 0 for active tab and -1 for others', () => {
    const wantedDay = DateTime.fromISO('2024-01-15');
    const weekStart = wantedDay.startOf('week');

    const data = [
      [weekStart],
      [['1', '3', '5']],
      ['15.1.2024 - 21.1.2024', wantedDay, 1, ['1', '3', '5'], weekStart],
      [],
      false,
      '20240115',
    ];

    const props = { ...defaultProps, data };
    const wrapper = shallow(<ScheduleDayTabs {...props} />);

    const tabWithZero = wrapper
      .find('button')
      .findWhere(btn => btn.prop('tabIndex') === 0);
    const tabsWithMinusOne = wrapper
      .find('button')
      .findWhere(btn => btn.prop('tabIndex') === -1);

    expect(tabWithZero.length).to.be.greaterThan(0);
    expect(tabsWithMinusOne.length).to.be.greaterThan(0);
  });

  it('should handle merged data', () => {
    const wantedDay = DateTime.fromISO('2024-01-15');
    const weekStart = wantedDay.startOf('week');

    const data = [
      [weekStart],
      [['1', '3', '5']],
      ['15.1.2024 - 21.1.2024', wantedDay, 1, ['1', '3', '5'], weekStart],
      [],
      true, // weeksAreSame = true (merged)
      '20240115',
    ];

    const props = { ...defaultProps, data };
    const wrapper = shallow(<ScheduleDayTabs {...props} />);

    expect(wrapper.find('button').length).to.be.greaterThan(0);
  });

  it('should handle single day with count < 2 (disabled state)', () => {
    const wantedDay = DateTime.fromISO('2024-01-15');
    const weekStart = wantedDay.startOf('week');

    const data = [
      [weekStart],
      [['1']], // Only one day
      ['15.1.2024', wantedDay, 1, ['1'], weekStart],
      [],
      false,
      '20240115',
    ];

    const props = { ...defaultProps, data };
    const wrapper = shallow(<ScheduleDayTabs {...props} />);

    const button = wrapper.find('button').first();
    expect(button.prop('disabled')).to.equal(true);
  });

  it('should not disable tabs when multiple days available', () => {
    const wantedDay = DateTime.fromISO('2024-01-15');
    const weekStart = wantedDay.startOf('week');

    const data = [
      [weekStart],
      [['1', '3']],
      ['15.1.2024 - 21.1.2024', wantedDay, 1, ['1', '3'], weekStart],
      [],
      false,
      '20240115',
    ];

    const props = { ...defaultProps, data };
    const wrapper = shallow(<ScheduleDayTabs {...props} />);

    const buttons = wrapper.find('button');
    buttons.forEach(button => {
      expect(button.prop('disabled')).to.equal(false);
    });
  });

  it('should create refs for each tab', () => {
    const wantedDay = DateTime.fromISO('2024-01-15');
    const weekStart = wantedDay.startOf('week');

    const data = [
      [weekStart],
      [['1', '3', '5']],
      ['15.1.2024 - 21.1.2024', wantedDay, 1, ['1', '3', '5'], weekStart],
      [],
      false,
      '20240115',
    ];

    const tabRefs = { current: {} };
    const props = { ...defaultProps, data, tabRefs };
    shallow(<ScheduleDayTabs {...props} />);

    // Refs should be created during render
    expect(Object.keys(tabRefs.current).length).to.be.greaterThan(0);
  });

  it('should handle weekend-only schedule', () => {
    const wantedDay = DateTime.fromISO('2024-01-20'); // Saturday
    const weekStart = wantedDay.startOf('week');

    const data = [
      [weekStart],
      [['67']], // Weekend only
      ['20.1.2024 - 21.1.2024', wantedDay, 6, ['67'], weekStart],
      [],
      false,
      '20240120',
    ];

    const props = { ...defaultProps, data };
    const wrapper = shallow(<ScheduleDayTabs {...props} />);

    expect(wrapper.find('button')).to.have.lengthOf(1);
  });

  it('should handle weekday-only schedule', () => {
    const wantedDay = DateTime.fromISO('2024-01-15');
    const weekStart = wantedDay.startOf('week');

    const data = [
      [weekStart],
      [['12345']], // Weekdays only
      ['15.1.2024 - 19.1.2024', wantedDay, 1, ['12345'], weekStart],
      [],
      false,
      '20240115',
    ];

    const props = { ...defaultProps, data };
    const wrapper = shallow(<ScheduleDayTabs {...props} />);

    expect(wrapper.find('button')).to.have.lengthOf(1);
  });

  it('should handle mixed consecutive and non-consecutive days', () => {
    const wantedDay = DateTime.fromISO('2024-01-15');
    const weekStart = wantedDay.startOf('week');

    const data = [
      [weekStart],
      [['12', '4', '67']], // Mon-Tue, Thu, Sat-Sun
      ['15.1.2024 - 21.1.2024', wantedDay, 1, ['12', '4', '67'], weekStart],
      [],
      false,
      '20240115',
    ];

    const props = { ...defaultProps, data };
    const wrapper = shallow(<ScheduleDayTabs {...props} />);

    expect(wrapper.find('button')).to.have.lengthOf(3);
  });

  it('should pass correct locale to day string formatter', () => {
    const wantedDay = DateTime.fromISO('2024-01-15');
    const weekStart = wantedDay.startOf('week');

    const data = [
      [weekStart],
      [['1', '3']],
      ['15.1.2024 - 21.1.2024', wantedDay, 1, ['1', '3'], weekStart],
      [],
      false,
      '20240115',
    ];

    const props = { ...defaultProps, data, locale: 'fi' };
    const wrapper = shallow(<ScheduleDayTabs {...props} />);

    expect(wrapper.find('button').length).to.be.greaterThan(0);
  });

  it('should handle first day fallback selection', () => {
    const futureWeek = DateTime.now().plus({ weeks: 2 });
    const weekStart = futureWeek.startOf('week');

    const data = [
      [weekStart],
      [['1', '3', '5']],
      ['Future date', futureWeek, 1, ['1', '3', '5'], weekStart],
      [],
      false,
      futureWeek.toFormat('yyyyMMdd'),
    ];

    const props = { ...defaultProps, data };
    const wrapper = shallow(<ScheduleDayTabs {...props} />);

    expect(wrapper.find('button').length).to.be.greaterThan(0);
  });

  it('should use focusedTab prop when provided', () => {
    const wantedDay = DateTime.fromISO('2024-01-15');
    const weekStart = wantedDay.startOf('week');

    const data = [
      [weekStart],
      [['1', '3', '5']],
      ['15.1.2024 - 21.1.2024', wantedDay, 1, ['1', '3', '5'], weekStart],
      [],
      false,
      '20240115',
    ];

    const props = { ...defaultProps, data, focusedTab: '3' };
    const wrapper = shallow(<ScheduleDayTabs {...props} />);

    expect(wrapper.exists()).to.equal(true);
  });

  it('should apply CSS variables for tab count', () => {
    const wantedDay = DateTime.fromISO('2024-01-15');
    const weekStart = wantedDay.startOf('week');

    const data = [
      [weekStart],
      [['1', '3', '5']],
      ['15.1.2024 - 21.1.2024', wantedDay, 1, ['1', '3', '5'], weekStart],
      [],
      false,
      '20240115',
    ];

    const props = { ...defaultProps, data };
    const wrapper = shallow(<ScheduleDayTabs {...props} />);

    const button = wrapper.find('button').first();
    expect(button.prop('style')).to.have.property('--totalCount');
  });
});
