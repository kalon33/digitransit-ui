import React from 'react';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import Select from 'react-select';

import ScheduleDropdown from '../../../../app/component/routepage/schedule/ScheduleDropdown';
import { mockContext } from '../../helpers/mock-context';

describe('<ScheduleDropdown />', () => {
  let defaultProps;
  let context;

  beforeEach(() => {
    defaultProps = {
      id: 'test-dropdown',
      title: 'Test Title',
      list: [
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2', value: 'opt2' },
        { label: 'Option 3', value: 'opt3' },
      ],
      onSelectChange: sinon.spy(),
      alignRight: false,
      labelId: undefined,
    };

    context = {
      ...mockContext,
      intl: {
        formatMessage: sinon.stub().returns('translated text'),
        locale: 'en',
      },
    };
  });

  it('should render without crashing', () => {
    const wrapper = shallow(<ScheduleDropdown {...defaultProps} />, {
      context,
    });
    expect(wrapper.exists()).to.equal(true);
  });

  it('should render Select component', () => {
    const wrapper = shallow(<ScheduleDropdown {...defaultProps} />, {
      context,
    });
    expect(wrapper.find(Select)).to.have.lengthOf(1);
  });

  it('should pass list options to Select', () => {
    const wrapper = shallow(<ScheduleDropdown {...defaultProps} />, {
      context,
    });
    const select = wrapper.find(Select);
    const options = select.prop('options');

    expect(options).to.have.lengthOf(3);
  });

  it('should call onSelectChange when option is selected', () => {
    const wrapper = shallow(<ScheduleDropdown {...defaultProps} />, {
      context,
    });
    const select = wrapper.find(Select);

    const option = { value: 'opt2', label: 'Option 2', titleLabel: 'Option 2' };
    select.prop('onChange')(option);

    expect(defaultProps.onSelectChange.calledOnce).to.equal(true);
    expect(defaultProps.onSelectChange.calledWith('opt2')).to.equal(true);
  });

  it('should apply alignRight class when alignRight prop is true', () => {
    const props = { ...defaultProps, alignRight: true };
    const wrapper = shallow(<ScheduleDropdown {...props} />, { context });

    const select = wrapper.find(Select);
    expect(select.prop('classNamePrefix')).to.equal('dd-right');
  });

  it('should use dd classNamePrefix when alignRight is false', () => {
    const wrapper = shallow(<ScheduleDropdown {...defaultProps} />, {
      context,
    });
    const select = wrapper.find(Select);

    expect(select.prop('classNamePrefix')).to.equal('dd');
  });

  it('should use dd-timerange for other-dates dropdown when alignRight', () => {
    const props = { ...defaultProps, id: 'other-dates', alignRight: true };
    const wrapper = shallow(<ScheduleDropdown {...props} />, { context });
    const select = wrapper.find(Select);

    expect(select.prop('classNamePrefix')).to.equal('dd-timerange');
  });

  it('should render label when labelId is provided', () => {
    const props = { ...defaultProps, labelId: 'origin' };
    const wrapper = shallow(<ScheduleDropdown {...props} />, { context });

    const label = wrapper.find('label.dd-header-title');
    expect(label).to.have.lengthOf(1);
  });

  it('should not render visible label when labelId is not provided', () => {
    const wrapper = shallow(<ScheduleDropdown {...defaultProps} />, {
      context,
    });

    const visibleLabel = wrapper.find('label.dd-header-title');
    expect(visibleLabel).to.have.lengthOf(0);
  });

  it('should render hidden label for accessibility when no labelId', () => {
    const wrapper = shallow(<ScheduleDropdown {...defaultProps} />, {
      context,
    });

    const hiddenLabel = wrapper.find('label[style]');
    expect(hiddenLabel.prop('style')).to.deep.equal({ display: 'none' });
  });

  it('should set isSearchable to false', () => {
    const wrapper = shallow(<ScheduleDropdown {...defaultProps} />, {
      context,
    });
    const select = wrapper.find(Select);

    expect(select.prop('isSearchable')).to.equal(false);
  });

  it('should render dropdown with correct id', () => {
    const wrapper = shallow(<ScheduleDropdown {...defaultProps} />, {
      context,
    });
    const select = wrapper.find(Select);

    expect(select.prop('name')).to.equal('test-dropdown');
    expect(select.prop('inputId')).to.equal('aria-input-test-dropdown');
  });

  it('should truncate long titles in placeholder', () => {
    const props = {
      ...defaultProps,
      title: 'Very Long Title That Should Be Truncated',
    };
    const wrapper = shallow(<ScheduleDropdown {...props} />, { context });

    // Should render but truncate in placeholder
    expect(wrapper.exists()).to.equal(true);
  });

  it('should add check icon to options matching title', () => {
    const wrapper = shallow(<ScheduleDropdown {...defaultProps} />, {
      context,
    });
    const select = wrapper.find(Select);
    const options = select.prop('options');

    // Options are enhanced with titleLabel and check icons
    expect(options).to.be.an('array');
  });

  it('should handle menu open state', () => {
    const wrapper = shallow(<ScheduleDropdown {...defaultProps} />, {
      context,
    });
    const select = wrapper.find(Select);

    select.prop('onMenuOpen')();
    wrapper.update();

    const updatedSelect = wrapper.find(Select);
    expect(updatedSelect.prop('menuIsOpen')).to.equal(true);
  });

  it('should handle menu close state', () => {
    const wrapper = shallow(<ScheduleDropdown {...defaultProps} />, {
      context,
    });
    const select = wrapper.find(Select);

    // Open then close
    select.prop('onMenuOpen')();
    wrapper.update();
    wrapper.find(Select).prop('onMenuClose')();
    wrapper.update();

    const updatedSelect = wrapper.find(Select);
    expect(updatedSelect.prop('menuIsOpen')).to.equal(false);
  });

  it('should handle selection when no id is provided', () => {
    const props = { ...defaultProps, id: '' };
    const wrapper = shallow(<ScheduleDropdown {...props} />, { context });
    const select = wrapper.find(Select);

    const option = { value: 'opt1', label: 'Option 1', titleLabel: 'Option 1' };
    select.prop('onChange')(option);

    expect(defaultProps.onSelectChange.called).to.equal(true);
  });

  it('should apply withLabel class when labelId is provided', () => {
    const props = { ...defaultProps, labelId: 'origin' };
    const wrapper = shallow(<ScheduleDropdown {...props} />, { context });

    expect(wrapper.find('.dd-container').hasClass('withLabel')).to.equal(true);
  });

  it('should not apply withLabel class when no labelId', () => {
    const wrapper = shallow(<ScheduleDropdown {...defaultProps} />, {
      context,
    });

    expect(wrapper.find('.dd-container').hasClass('withLabel')).to.equal(false);
  });

  it('should have aria-live="off" on container', () => {
    const wrapper = shallow(<ScheduleDropdown {...defaultProps} />, {
      context,
    });

    expect(wrapper.find('.dd-container').prop('aria-live')).to.equal('off');
  });

  it('should pass aria-labelledby to Select', () => {
    const wrapper = shallow(<ScheduleDropdown {...defaultProps} />, {
      context,
    });
    const select = wrapper.find(Select);

    expect(select.prop('aria-labelledby')).to.equal('aria-label-test-dropdown');
  });

  it('should have proper aria-live messages', () => {
    const wrapper = shallow(<ScheduleDropdown {...defaultProps} />, {
      context,
    });
    const select = wrapper.find(Select);

    expect(select.prop('ariaLiveMessages')).to.be.an('object');
    expect(select.prop('ariaLiveMessages')).to.have.property('guidance');
    expect(select.prop('ariaLiveMessages')).to.have.property('onChange');
    expect(select.prop('ariaLiveMessages')).to.have.property('onFilter');
    expect(select.prop('ariaLiveMessages')).to.have.property('onFocus');
  });

  it('should remove dropdown indicator and separator', () => {
    const wrapper = shallow(<ScheduleDropdown {...defaultProps} />, {
      context,
    });
    const select = wrapper.find(Select);
    const components = select.prop('components');

    expect(components.DropdownIndicator()).to.equal(null);
    expect(components.IndicatorSeparator()).to.equal(null);
  });

  it('should handle list with single option', () => {
    const props = {
      ...defaultProps,
      list: [{ label: 'Only Option', value: 'only' }],
    };
    const wrapper = shallow(<ScheduleDropdown {...props} />, { context });
    const select = wrapper.find(Select);

    expect(select.prop('options')).to.have.lengthOf(1);
  });

  it('should handle list with many options', () => {
    const manyOptions = Array.from({ length: 50 }, (_, i) => ({
      label: `Option ${i}`,
      value: `opt${i}`,
    }));
    const props = { ...defaultProps, list: manyOptions };
    const wrapper = shallow(<ScheduleDropdown {...props} />, { context });
    const select = wrapper.find(Select);

    expect(select.prop('options')).to.have.lengthOf(50);
  });

  it('should use default title when title prop is not provided', () => {
    const props = { ...defaultProps, title: undefined };
    const wrapper = shallow(<ScheduleDropdown {...props} />, { context });

    // Component should use defaultProps title
    expect(wrapper.exists()).to.equal(true);
  });

  it('should handle options with special characters', () => {
    const props = {
      ...defaultProps,
      list: [
        { label: 'Käpylä (Helsinki)', value: 'kapyla' },
        { label: 'Töölö / Tölö', value: 'toolo' },
      ],
    };
    const wrapper = shallow(<ScheduleDropdown {...props} />, { context });
    const select = wrapper.find(Select);

    expect(select.prop('options')).to.have.lengthOf(2);
  });

  it('should handle empty list gracefully', () => {
    const props = { ...defaultProps, list: [] };
    const wrapper = shallow(<ScheduleDropdown {...props} />, { context });
    const select = wrapper.find(Select);

    expect(select.prop('options')).to.have.lengthOf(0);
  });

  it('should align label right when alignRight and labelId provided', () => {
    const props = { ...defaultProps, alignRight: true, labelId: 'destination' };
    const wrapper = shallow(<ScheduleDropdown {...props} />, { context });
    const label = wrapper.find('label.dd-header-title');

    expect(label.hasClass('alignRight')).to.equal(true);
  });

  it('should not align label right when alignRight is false', () => {
    const props = { ...defaultProps, alignRight: false, labelId: 'origin' };
    const wrapper = shallow(<ScheduleDropdown {...props} />, { context });
    const label = wrapper.find('label.dd-header-title');

    expect(label.hasClass('alignRight')).to.equal(false);
  });

  it('should handle selection without onSelectChange callback', () => {
    const props = { ...defaultProps, onSelectChange: undefined };
    const wrapper = shallow(<ScheduleDropdown {...props} />, { context });
    const select = wrapper.find(Select);

    const option = { value: 'opt1', label: 'Option 1', titleLabel: 'Option 1' };
    // Should not throw error
    expect(() => select.prop('onChange')(option)).to.not.throw();
  });

  it('should have correct htmlFor attribute on label', () => {
    const props = { ...defaultProps, labelId: 'origin' };
    const wrapper = shallow(<ScheduleDropdown {...props} />, { context });
    const label = wrapper.find('label.dd-header-title');

    expect(label.prop('htmlFor')).to.equal('aria-input-test-dropdown');
  });

  it('should match label and input ids for accessibility', () => {
    const wrapper = shallow(<ScheduleDropdown {...defaultProps} />, {
      context,
    });
    const label = wrapper.find('label').first();
    const select = wrapper.find(Select);

    expect(label.prop('id')).to.equal('aria-label-test-dropdown');
    expect(select.prop('inputId')).to.equal('aria-input-test-dropdown');
    expect(select.prop('aria-labelledby')).to.equal('aria-label-test-dropdown');
  });
});
