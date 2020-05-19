import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';
import loadable from '@loadable/component';
import { withCurrentTime } from '../util/DTSearchQueryUtils';
import ComponentUsageExample from './ComponentUsageExample';
import DTAutosuggestContainer from './DTAutosuggestContainer';
import { PREFIX_ITINERARY_SUMMARY, navigateTo } from '../util/path';

import {
  getIntermediatePlaces,
  setIntermediatePlaces,
} from '../util/queryUtils';
import { dtLocationShape } from '../util/shapes';

const DTAutosuggestPanel = loadable(
  () =>
    import('@digitransit-component/digitransit-component-autosuggest-panel'),
  { ssr: true },
);
const locationToOtp = location =>
  `${location.address}::${location.lat},${location.lon}${
    location.locationSlack ? `::${location.locationSlack}` : ''
  }`;

class OriginDestinationBar extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    destination: dtLocationShape,
    origin: dtLocationShape,
    location: PropTypes.object,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    getStore: PropTypes.func.isRequired,
    match: matchShape.isRequired,
  };

  static defaultProps = {
    className: undefined,
    location: undefined,
  };

  get location() {
    return this.props.location || this.context.match.location;
  }

  updateViaPoints = newViaPoints =>
    setIntermediatePlaces(
      this.context.router,
      newViaPoints.map(locationToOtp),
      this.context.match,
    );

  swapEndpoints = () => {
    const { location } = this;
    const locationWithTime = withCurrentTime(this.context.getStore, location);
    const intermediatePlaces = getIntermediatePlaces(location.query);
    if (intermediatePlaces.length > 1) {
      location.query.intermediatePlaces.reverse();
    }
    navigateTo({
      base: locationWithTime,
      origin: this.props.destination,
      destination: this.props.origin,
      context: PREFIX_ITINERARY_SUMMARY,
      router: this.context.router,
      resetIndex: true,
    });
  };

  render() {
    return (
      <div
        className={cx(
          'origin-destination-bar',
          this.props.className,
          'flex-horizontal',
        )}
      >
        <DTAutosuggestContainer
          origin={this.props.origin}
          destination={this.props.destination}
        >
          <DTAutosuggestPanel
            origin={this.props.origin}
            destination={this.props.destination}
            showMultiPointControls
            originPlaceHolder="search-origin-index"
            destinationPlaceHolder="search-destination-index"
            initialViaPoints={getIntermediatePlaces(this.location.query)}
            updateViaPoints={this.updateViaPoints}
            swapOrder={this.swapEndpoints}
            sources={['Favourite', 'History', 'Datasource']}
            targets={['Locations', 'CurrentPosition']}
          />
        </DTAutosuggestContainer>
      </div>
    );
  }
}

OriginDestinationBar.description = (
  <React.Fragment>
    <ComponentUsageExample>
      <OriginDestinationBar
        destination={{ ready: false, set: false }}
        origin={{
          address: 'Messukeskus, Itä-Pasila, Helsinki',
          lat: 60.201415,
          lon: 24.936696,
          ready: true,
          set: true,
        }}
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="with-viapoint">
      <OriginDestinationBar
        destination={{ ready: false, set: false }}
        location={{
          query: {
            intermediatePlaces: 'Opastinsilta 6, Helsinki::60.199093,24.940536',
          },
        }}
        origin={{
          address: 'Messukeskus, Itä-Pasila, Helsinki',
          lat: 60.201415,
          lon: 24.936696,
          ready: true,
          set: true,
        }}
      />
    </ComponentUsageExample>
  </React.Fragment>
);

export default OriginDestinationBar;
