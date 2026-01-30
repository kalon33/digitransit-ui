import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { shallow } from 'enzyme';

import ScheduleConstantOperation from '../../../../app/component/routepage/schedule/ScheduleConstantOperation';
import RouteControlPanel from '../../../../app/component/routepage/RouteControlPanel';
import { mockMatch } from '../../helpers/mock-router';

describe('<ScheduleConstantOperation />', () => {
  const defaultProps = {
    constantOperationInfo: {
      text: 'This route operates continuously 24/7.',
      link: 'https://example.com/route-info',
    },
    match: mockMatch,
    route: {
      gtfsId: 'HSL:1001',
      shortName: '1',
      longName: 'Route 1',
      mode: 'BUS',
      type: 3,
    },
    breakpoint: 'large',
  };

  it('should render without crashing', () => {
    const wrapper = shallow(<ScheduleConstantOperation {...defaultProps} />);
    expect(wrapper.exists()).to.equal(true);
  });

  it('should render RouteControlPanel', () => {
    const wrapper = shallow(<ScheduleConstantOperation {...defaultProps} />);
    const controlPanel = wrapper.find(RouteControlPanel);

    expect(controlPanel).to.have.lengthOf(1);
  });

  it('should pass correct props to RouteControlPanel', () => {
    const wrapper = shallow(<ScheduleConstantOperation {...defaultProps} />);
    const controlPanel = wrapper.find(RouteControlPanel);

    expect(controlPanel.prop('match')).to.equal(defaultProps.match);
    expect(controlPanel.prop('route')).to.equal(defaultProps.route);
    expect(controlPanel.prop('breakpoint')).to.equal(defaultProps.breakpoint);
    expect(controlPanel.prop('noInitialServiceDay')).to.equal(true);
  });

  it('should display constant operation text', () => {
    const wrapper = shallow(<ScheduleConstantOperation {...defaultProps} />);
    const text = wrapper.find('span').first();

    expect(text.text()).to.equal('This route operates continuously 24/7.');
  });

  it('should render link with correct href', () => {
    const wrapper = shallow(<ScheduleConstantOperation {...defaultProps} />);
    const link = wrapper.find('a');

    expect(link.prop('href')).to.equal('https://example.com/route-info');
  });

  it('should render link with correct text', () => {
    const wrapper = shallow(<ScheduleConstantOperation {...defaultProps} />);
    const link = wrapper.find('a');

    expect(link.text()).to.equal('https://example.com/route-info');
  });

  it('should open link in new tab', () => {
    const wrapper = shallow(<ScheduleConstantOperation {...defaultProps} />);
    const link = wrapper.find('a');

    expect(link.prop('target')).to.equal('_blank');
    expect(link.prop('rel')).to.equal('noreferrer');
  });

  it('should apply mobile class when breakpoint is not large', () => {
    const props = { ...defaultProps, breakpoint: 'small' };
    const wrapper = shallow(<ScheduleConstantOperation {...props} />);

    const container = wrapper.find('.route-schedule-container');
    expect(container.hasClass('mobile')).to.equal(true);
  });

  it('should not apply mobile class when breakpoint is large', () => {
    const wrapper = shallow(<ScheduleConstantOperation {...defaultProps} />);

    const container = wrapper.find('.route-schedule-container');
    expect(container.hasClass('mobile')).to.equal(false);
  });

  it('should have correct CSS classes', () => {
    const wrapper = shallow(<ScheduleConstantOperation {...defaultProps} />);

    expect(wrapper.find('.route-schedule-container')).to.have.lengthOf(1);
    expect(wrapper.find('.stop-constant-operation-container')).to.have.lengthOf(
      1,
    );
    expect(
      wrapper.find('.stop-constant-operation-container.bottom-padding'),
    ).to.have.lengthOf(1);
  });

  it('should render with different breakpoint values', () => {
    const breakpoints = ['small', 'medium', 'large'];

    breakpoints.forEach(breakpoint => {
      const props = { ...defaultProps, breakpoint };
      const wrapper = shallow(<ScheduleConstantOperation {...props} />);

      expect(wrapper.exists()).to.equal(true);
      const container = wrapper.find('.route-schedule-container');

      if (breakpoint !== 'large') {
        expect(container.hasClass('mobile')).to.equal(true);
      } else {
        expect(container.hasClass('mobile')).to.equal(false);
      }
    });
  });

  it('should handle long text content', () => {
    const props = {
      ...defaultProps,
      constantOperationInfo: {
        text: 'This is a very long description about constant operation that includes many details about the route schedule and operating hours throughout the day and night.',
        link: 'https://example.com/route-info',
      },
    };

    const wrapper = shallow(<ScheduleConstantOperation {...props} />);
    const text = wrapper.find('span').first();

    expect(text.text().length).to.be.greaterThan(100);
  });

  it('should handle long URLs', () => {
    const props = {
      ...defaultProps,
      constantOperationInfo: {
        text: 'Route operates 24/7.',
        link: 'https://example.com/very/long/path/to/route/information/page',
      },
    };

    const wrapper = shallow(<ScheduleConstantOperation {...props} />);
    const link = wrapper.find('a');

    expect(link.prop('href')).to.equal(props.constantOperationInfo.link);
  });

  it('should handle special characters in text', () => {
    const props = {
      ...defaultProps,
      constantOperationInfo: {
        text: 'Route operates 24/7 - täydennyspalvelu & extra service',
        link: 'https://example.com/info',
      },
    };

    const wrapper = shallow(<ScheduleConstantOperation {...props} />);
    const text = wrapper.find('span').first();

    expect(text.text()).to.include('24/7');
    expect(text.text()).to.include('&');
  });

  it('should render link with constant-operation-link class', () => {
    const wrapper = shallow(<ScheduleConstantOperation {...defaultProps} />);
    const linkContainer = wrapper.find('.constant-operation-link');

    expect(linkContainer).to.have.lengthOf(1);
  });

  it('should render content with constant-operation-content class', () => {
    const wrapper = shallow(<ScheduleConstantOperation {...defaultProps} />);
    const contentDiv = wrapper.find('.constant-operation-content');

    expect(contentDiv).to.have.lengthOf(1);
  });

  it('should have constant-operation-panel class on control panel wrapper', () => {
    const wrapper = shallow(<ScheduleConstantOperation {...defaultProps} />);
    const controlPanelWrapper = wrapper.find('.constant-operation-panel');

    expect(controlPanelWrapper).to.have.lengthOf(1);
  });

  it('should render two spans for text and link', () => {
    const wrapper = shallow(<ScheduleConstantOperation {...defaultProps} />);
    const spans = wrapper.find('span');

    expect(spans.length).to.be.greaterThan(1);
  });

  it('should handle different route types', () => {
    const routeTypes = [
      { gtfsId: 'HSL:1001', mode: 'BUS', type: 3 },
      { gtfsId: 'HSL:2001', mode: 'TRAM', type: 0 },
      { gtfsId: 'HSL:3001', mode: 'RAIL', type: 2 },
    ];

    routeTypes.forEach(route => {
      const props = { ...defaultProps, route };
      const wrapper = shallow(<ScheduleConstantOperation {...props} />);

      expect(wrapper.exists()).to.equal(true);
    });
  });

  it('should handle undefined route properties gracefully', () => {
    const props = {
      ...defaultProps,
      route: {
        gtfsId: 'HSL:1001',
      },
    };

    const wrapper = shallow(<ScheduleConstantOperation {...props} />);
    expect(wrapper.exists()).to.equal(true);
  });

  it('should maintain structure with all required elements', () => {
    const wrapper = shallow(<ScheduleConstantOperation {...defaultProps} />);

    expect(wrapper.find(RouteControlPanel)).to.have.lengthOf(1);
    expect(wrapper.find('.stop-constant-operation-container')).to.have.lengthOf(
      1,
    );
    expect(wrapper.find('a')).to.have.lengthOf(1);
  });

  it('should handle HTTP and HTTPS links', () => {
    const links = [
      'http://example.com/info',
      'https://secure.example.com/info',
    ];

    links.forEach(link => {
      const props = {
        ...defaultProps,
        constantOperationInfo: {
          text: 'Test text',
          link,
        },
      };

      const wrapper = shallow(<ScheduleConstantOperation {...props} />);
      const anchorElement = wrapper.find('a');

      expect(anchorElement.prop('href')).to.equal(link);
    });
  });
});
