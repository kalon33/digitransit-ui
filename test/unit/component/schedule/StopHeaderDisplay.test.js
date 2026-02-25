import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { shallow } from 'enzyme';

import StopHeaderDisplay from '../../../../app/component/routepage/schedule/StopHeaderDisplay';
import Icon from '../../../../app/component/Icon';

describe('<StopHeaderDisplay />', () => {
  const defaultProps = {
    fromDisplayName: 'Kamppi',
    toDisplayName: 'Rautatientori',
  };

  it('should render without crashing', () => {
    const wrapper = shallow(<StopHeaderDisplay {...defaultProps} />);
    expect(wrapper.exists()).to.equal(true);
  });

  it('should render with printable-stop-header class', () => {
    const wrapper = shallow(<StopHeaderDisplay {...defaultProps} />);
    expect(wrapper.find('.printable-stop-header')).to.have.lengthOf(1);
  });

  it('should display from stop name', () => {
    const wrapper = shallow(<StopHeaderDisplay {...defaultProps} />);
    const fromDiv = wrapper.find('.printable-stop-header_from');

    expect(fromDiv).to.have.lengthOf(1);
    expect(fromDiv.find('span').text()).to.equal('Kamppi');
  });

  it('should display to stop name', () => {
    const wrapper = shallow(<StopHeaderDisplay {...defaultProps} />);
    const toDiv = wrapper.find('.printable-stop-header_to');

    expect(toDiv).to.have.lengthOf(1);
    expect(toDiv.find('span').text()).to.equal('Rautatientori');
  });

  it('should render two map marker icons', () => {
    const wrapper = shallow(<StopHeaderDisplay {...defaultProps} />);
    const icons = wrapper.find(Icon);

    expect(icons).to.have.lengthOf(2);
    expect(icons.at(0).prop('img')).to.equal('icon_mapMarker');
    expect(icons.at(1).prop('img')).to.equal('icon_mapMarker');
  });

  it('should render icon for from stop', () => {
    const wrapper = shallow(<StopHeaderDisplay {...defaultProps} />);
    const iconDiv = wrapper.find('.printable-stop-header_icon-from');

    expect(iconDiv).to.have.lengthOf(1);
    expect(iconDiv.find(Icon)).to.have.lengthOf(1);
  });

  it('should render icon for to stop', () => {
    const wrapper = shallow(<StopHeaderDisplay {...defaultProps} />);
    const iconDiv = wrapper.find('.printable-stop-header_icon-to');

    expect(iconDiv).to.have.lengthOf(1);
    expect(iconDiv.find(Icon)).to.have.lengthOf(1);
  });

  it('should handle long stop names', () => {
    const props = {
      fromDisplayName: 'Very Long Stop Name That Might Need Wrapping',
      toDisplayName: 'Another Extremely Long Stop Name',
    };
    const wrapper = shallow(<StopHeaderDisplay {...props} />);

    const fromSpan = wrapper.find('.printable-stop-header_from span');
    const toSpan = wrapper.find('.printable-stop-header_to span');

    expect(fromSpan.text()).to.equal(props.fromDisplayName);
    expect(toSpan.text()).to.equal(props.toDisplayName);
  });

  it('should handle stop names with special characters', () => {
    const props = {
      fromDisplayName: 'Käpylä (Helsinki)',
      toDisplayName: 'Töölö / Tölö',
    };
    const wrapper = shallow(<StopHeaderDisplay {...props} />);

    const fromSpan = wrapper.find('.printable-stop-header_from span');
    const toSpan = wrapper.find('.printable-stop-header_to span');

    expect(fromSpan.text()).to.include('Käpylä');
    expect(toSpan.text()).to.include('Töölö');
  });

  it('should have correct structure with four child divs', () => {
    const wrapper = shallow(<StopHeaderDisplay {...defaultProps} />);
    const children = wrapper.find('.printable-stop-header').children();

    expect(children).to.have.lengthOf(4);
    expect(children.at(0).hasClass('printable-stop-header_icon-from')).to.equal(
      true,
    );
    expect(children.at(1).hasClass('printable-stop-header_from')).to.equal(
      true,
    );
    expect(children.at(2).hasClass('printable-stop-header_icon-to')).to.equal(
      true,
    );
    expect(children.at(3).hasClass('printable-stop-header_to')).to.equal(true);
  });

  it('should handle same from and to stops', () => {
    const props = {
      fromDisplayName: 'Central Station',
      toDisplayName: 'Central Station',
    };
    const wrapper = shallow(<StopHeaderDisplay {...props} />);

    const fromSpan = wrapper.find('.printable-stop-header_from span');
    const toSpan = wrapper.find('.printable-stop-header_to span');

    expect(fromSpan.text()).to.equal(toSpan.text());
  });

  it('should have correct displayName', () => {
    expect(StopHeaderDisplay.displayName).to.equal('StopHeaderDisplay');
  });

  it('should handle numeric stop names', () => {
    const props = {
      fromDisplayName: '123',
      toDisplayName: '456',
    };
    const wrapper = shallow(<StopHeaderDisplay {...props} />);

    const fromSpan = wrapper.find('.printable-stop-header_from span');
    const toSpan = wrapper.find('.printable-stop-header_to span');

    expect(fromSpan.text()).to.equal('123');
    expect(toSpan.text()).to.equal('456');
  });
});
