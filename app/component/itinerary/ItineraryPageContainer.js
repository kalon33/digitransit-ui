/* eslint-disable no-console */
import { connectToStores } from 'fluxible-addons-react';
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { ReactRelayContext } from 'react-relay';
import { getMapLayerOptions } from '../../util/mapLayerUtils';
import withBreakpoint from '../../util/withBreakpoint';
import Loading from '../Loading';
import { ItineraryContextProvider } from './context/ItineraryContext';

const ItineraryPage = lazy(() => import('./ItineraryPage'));

const ItineraryPageWithBreakpoint = withBreakpoint(({ getStore, ...props }) => (
  <ReactRelayContext.Consumer>
    {({ environment }) => {
      return (
        <ItineraryContextProvider
          getStore={getStore}
          relayEnvironment={environment}
        >
          <ItineraryPage {...props} relayEnvironment={environment} />
        </ItineraryContextProvider>
      );
    }}
  </ReactRelayContext.Consumer>
));

const ItineraryPageWithStores = connectToStores(
  ItineraryPageWithBreakpoint,
  ['MapLayerStore'],
  ({ getStore }) => ({
    getStore,
    mapLayers: getStore('MapLayerStore').getMapLayers({
      notThese: ['stop', 'citybike', 'vehicles', 'scooter'],
    }),
    mapLayerOptions: getMapLayerOptions({
      lockedMapLayers: ['vehicles', 'citybike', 'stop'],
      selectedMapLayers: ['vehicles'],
    }),
  }),
);

const ItineraryPageContainer = props => {
  const [isClient, setClient] = useState(false);

  useEffect(() => {
    // To prevent SSR from rendering something https://reactjs.org/docs/react-dom.html#hydrate
    setClient(true);
  });
  if (!isClient) {
    return <Loading />;
  }
  return (
    <Suspense fallback={<Loading />}>
      <ItineraryPageWithStores {...props} />
    </Suspense>
  );
};

export default ItineraryPageContainer;
