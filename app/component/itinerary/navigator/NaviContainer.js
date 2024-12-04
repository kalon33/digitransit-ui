import PropTypes from 'prop-types';
import React from 'react';
import { legTime } from '../../../util/legUtils';
import { itineraryShape, relayShape } from '../../../util/shapes';
import NaviBottom from './NaviBottom';
import NaviCardContainer from './NaviCardContainer';
import { useRealtimeLegs } from './hooks/useRealtimeLegs';

function NaviContainer(
  {
    itinerary,
    focusToLeg,
    relayEnvironment,
    setNavigation,
    mapRef,
    mapLayerRef,
  },
  { getStore },
) {
  const position = getStore('PositionStore').getLocationState();

  const { realTimeLegs, time, isPositioningAllowed, origin } = useRealtimeLegs(
    mapRef,
    relayEnvironment,
    itinerary.legs,
  );

  if (!realTimeLegs?.length) {
    return null;
  }

  return (
    <>
      <NaviCardContainer
        itinerary={itinerary}
        legs={realTimeLegs}
        focusToLeg={
          mapRef?.state.mapTracking || isPositioningAllowed ? null : focusToLeg
        }
        time={time}
        position={position}
        mapLayerRef={mapLayerRef}
        origin={origin}
      />
      <NaviBottom
        setNavigation={setNavigation}
        arrival={legTime(realTimeLegs[realTimeLegs.length - 1].end)}
        time={time}
      />
    </>
  );
}

NaviContainer.propTypes = {
  itinerary: itineraryShape.isRequired,
  focusToLeg: PropTypes.func.isRequired,
  relayEnvironment: relayShape.isRequired,
  setNavigation: PropTypes.func.isRequired,
  // eslint-disable-next-line
  mapRef: PropTypes.object,
  mapLayerRef: PropTypes.func.isRequired,
};

NaviContainer.contextTypes = {
  getStore: PropTypes.func.isRequired,
};

NaviContainer.defaultProps = { mapRef: undefined };

export default NaviContainer;
