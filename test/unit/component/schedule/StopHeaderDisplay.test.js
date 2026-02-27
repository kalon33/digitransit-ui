import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { shallow } from 'enzyme';

import StopHeaderDisplay from '../../../../app/component/routepage/schedule/StopHeaderDisplay';

describe('<StopHeaderDisplay />', () => {
  const defaultProps = {
    fromDisplayName: 'Kamppi',
    toDisplayName: 'Rautatientori',
  };

  it('should render without crashing', () => {
    const wrapper = shallow(<StopHeaderDisplay {...defaultProps} />);
    expect(wrapper.exists()).to.equal(true);
  });

  it('should display origin stop name', () => {
    const wrapper = shallow(<StopHeaderDisplay {...defaultProps} />);
    expect(wrapper.text()).to.include('Kamppi');
  });

  it('should display destination stop name', () => {
    const wrapper = shallow(<StopHeaderDisplay {...defaultProps} />);
    expect(wrapper.text()).to.include('Rautatientori');
  });

  it('should display both stop names with special characters', () => {
    const props = {
      fromDisplayName: 'Käpylä (Helsinki)',
      toDisplayName: 'Töölö / Tölö',
    };
    const wrapper = shallow(<StopHeaderDisplay {...props} />);

    expect(wrapper.text()).to.include('Käpylä (Helsinki)');
    expect(wrapper.text()).to.include('Töölö / Tölö');
  });
});
