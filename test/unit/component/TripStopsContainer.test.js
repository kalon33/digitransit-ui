import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { Component as TripStopsContainer } from '../../../app/component/routepage/TripStopsContainer';
import { mockMatch } from '../helpers/mock-router';

describe('<TripStopsContainer />', () => {
  it('should render empty if trip information is missing', () => {
    const props = {
      breakpoint: 'large',
      routes: [],
      trip: null,
      match: mockMatch,
    };
    const wrapper = shallowWithIntl(<TripStopsContainer {...props} />);
    expect(wrapper.isEmptyRender()).to.equal(true);
  });
});
