import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import IntermediateLeg from '../../../app/component/itinerary/IntermediateLeg';
import ZoneIcon from '../../../app/component/ZoneIcon';

const emptyProps = {
  arrival: { scheduledTime: '2024-04-05T14:48:00.000Z' },
  name: '',
  mode: '',
  stopCode: '',
  focusFunction: () => {},
};

describe('<IntermediateLeg />', () => {
  it('should apply class zone-dual for dual zones', () => {
    const props = {
      ...emptyProps,
      currentZoneId: 'foo',
      nextZoneId: 'bar',
      showZoneLimits: true,
      gtfsId: 'foo:1',
    };
    const wrapper = shallowWithIntl(<IntermediateLeg {...props} />, {
      context: { config: { feedIds: ['foo'], colors: { primary: '#007ac9' } } },
    });
    expect(wrapper.find('.zone-dual')).to.have.lengthOf(1);
    expect(wrapper.find(ZoneIcon)).to.have.lengthOf(2);
  });

  it('should apply class zone-triple for triple zones', () => {
    const props = {
      ...emptyProps,
      currentZoneId: 'foo',
      nextZoneId: 'bar',
      previousZoneId: 'baz',
      showZoneLimits: true,
      gtfsId: 'foo:1',
    };
    const wrapper = shallowWithIntl(<IntermediateLeg {...props} />, {
      context: { config: { feedIds: ['foo'], colors: { primary: '#007ac9' } } },
    });
    expect(wrapper.find('.zone-triple')).to.have.lengthOf(1);
    expect(wrapper.find(ZoneIcon)).to.have.lengthOf(3);
  });

  it('should not apply class zone-dual for triple zones', () => {
    const props = {
      ...emptyProps,
      currentZoneId: 'foo',
      nextZoneId: 'bar',
      previousZoneId: 'baz',
      showZoneLimits: true,
      gtfsId: 'foo:1',
    };
    const wrapper = shallowWithIntl(<IntermediateLeg {...props} />, {
      context: { config: { feedIds: ['foo'], colors: { primary: '#007ac9' } } },
    });
    expect(wrapper.find('.zone-dual')).to.have.lengthOf(0);
  });

  it('should apply class zone-previous when there is a current zone and a previous zone', () => {
    const props = {
      ...emptyProps,
      currentZoneId: 'foo',
      previousZoneId: 'baz',
      showZoneLimits: true,
      gtfsId: 'foo:1',
    };
    const wrapper = shallowWithIntl(<IntermediateLeg {...props} />, {
      context: { config: { feedIds: ['foo'], colors: { primary: '#007ac9' } } },
    });
    expect(wrapper.find('.zone-previous')).to.have.lengthOf(1);
    expect(wrapper.find(ZoneIcon)).to.have.lengthOf(2);
  });

  it('should not show any zone limit information if disabled', () => {
    const props = {
      ...emptyProps,
      currentZoneId: 'foo',
      nextZoneId: 'bar',
      previousZoneId: 'baz',
      showZoneLimits: false,
    };
    const wrapper = shallowWithIntl(<IntermediateLeg {...props} />, {
      context: { config: { colors: { primary: '#007ac9' } } },
    });
    expect(wrapper.find('.zone-dual')).to.have.lengthOf(0);
    expect(wrapper.find('.zone-triple')).to.have.lengthOf(0);
    expect(wrapper.find('.zone-previous')).to.have.lengthOf(0);
    expect(wrapper.find(ZoneIcon)).to.have.lengthOf(0);
  });

  it('should position circle with bottom:11 for zone-previous rows', () => {
    const props = {
      ...emptyProps,
      currentZoneId: 'foo',
      previousZoneId: 'baz',
      showZoneLimits: true,
      gtfsId: 'foo:1',
    };
    const wrapper = shallowWithIntl(<IntermediateLeg {...props} />, {
      context: { config: { feedIds: ['foo'], colors: { primary: '#007ac9' } } },
    });
    const circle = wrapper.find('.leg-before-circle.circle-fill');
    expect(circle.prop('style')).to.have.property('bottom', 11);
  });

  it('should position circle with top:-1px for non-zone rows', () => {
    const props = {
      ...emptyProps,
      placesCount: 3,
    };
    const wrapper = shallowWithIntl(<IntermediateLeg {...props} />, {
      context: { config: { feedIds: [], colors: { primary: '#007ac9' } } },
    });
    const circle = wrapper.find('.leg-before-circle.circle-fill');
    expect(circle.prop('style')).to.have.property('top', '-1px');
    expect(circle.prop('style')).to.have.property('bottom', 'unset');
  });

  it('should apply paddingTop:15px and paddingBottom:15px for 2-place no-zone rows', () => {
    const props = {
      ...emptyProps,
      placesCount: 2,
    };
    const wrapper = shallowWithIntl(<IntermediateLeg {...props} />, {
      context: { config: { feedIds: [], colors: { primary: '#007ac9' } } },
    });
    const row = wrapper.find('.itinerary-leg-row-intermediate');
    expect(row.prop('style')).to.have.property('paddingTop', '15px');
    expect(row.prop('style')).to.have.property('paddingBottom', '15px');
  });

  it('should apply paddingTop:0 and paddingBottom:22px for default rows', () => {
    const props = {
      ...emptyProps,
      placesCount: 3,
    };
    const wrapper = shallowWithIntl(<IntermediateLeg {...props} />, {
      context: { config: { feedIds: [], colors: { primary: '#007ac9' } } },
    });
    const row = wrapper.find('.itinerary-leg-row-intermediate');
    expect(row.prop('style')).to.have.property('paddingTop', '0');
    expect(row.prop('style')).to.have.property('paddingBottom', '22px');
  });
});
