import React from 'react';
import { ReactRelayContext } from 'react-relay';
import { connectToStores } from 'fluxible-addons-react';
import withBreakpoint from '../../util/withBreakpoint';
import { getMapLayerOptions } from '../../util/mapLayerUtils';
import ItineraryPage from './ItineraryPage';

const ItineraryPageWithBreakpoint = withBreakpoint(props => (
  <ReactRelayContext.Consumer>
    {({ environment }) => (
      <ItineraryPage {...props} relayEnvironment={environment} />
    )}
  </ReactRelayContext.Consumer>
));

const ItineraryPageWithStores = connectToStores(
  ItineraryPageWithBreakpoint,
  ['MapLayerStore'],
  ({ getStore }) => ({
    mapLayers: getStore('MapLayerStore').getMapLayers({
      notThese: ['stop', 'citybike', 'vehicles', 'scooter'],
    }),
    mapLayerOptions: getMapLayerOptions({
      lockedMapLayers: ['vehicles', 'citybike', 'stop'],
      selectedMapLayers: ['vehicles'],
    }),
  }),
);

export default function ItineraryPageContainer(props) {
  return <ItineraryPageWithStores {...props} />;
}
