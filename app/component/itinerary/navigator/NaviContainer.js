import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import polyUtil from 'polyline-encoded';
import { legTime } from '../../../util/legUtils';
import { checkPositioningPermission } from '../../../action/PositionActions';
import { GeodeticToEcef, GeodeticToEnu } from '../../../util/geo-utils';
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
  const [planarLegs, setPlanarLegs] = useState([]);
  const [origin, setOrigin] = useState();
  const [isPositioningAllowed, setPositioningAllowed] = useState(false);

  const position = getStore('PositionStore').getLocationState();

  useEffect(() => {
    const { lat, lon } = itinerary.legs[0].from;
    const orig = GeodeticToEcef(lat, lon);
    const legs = itinerary.legs.map(leg => {
      const geometry = polyUtil.decode(leg.legGeometry.points);
      return {
        ...leg,
        geometry: geometry.map(p => GeodeticToEnu(p[0], p[1], orig)),
      };
    });
    setPlanarLegs(legs);
    setOrigin(orig);
  }, [itinerary]);

  useEffect(() => {
    if (position.hasLocation) {
      mapRef?.enableMapTracking();
      setPositioningAllowed(true);
    } else {
      checkPositioningPermission().then(permission => {
        if (permission.state === 'granted') {
          mapRef?.enableMapTracking();
          setPositioningAllowed(true);
        }
      });
    }
  }, [mapRef]);

  const { realTimeLegs, time } = useRealtimeLegs(
    planarLegs,
    mapRef,
    relayEnvironment,
  );

  if (!realTimeLegs.length) {
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
