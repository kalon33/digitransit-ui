import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import polyUtil from 'polyline-encoded';
import { legTime } from '../../../util/legUtils';
import { GeodeticToEcef, GeodeticToEnu } from '../../../util/geo-utils';
import { itineraryShape, relayShape } from '../../../util/shapes';
import NaviBottom from './NaviBottom';
import NaviCardContainer from './NaviCardContainer';
import { useRealtimeLegs } from './hooks/useRealtimeLegs';

function NaviContainer(
  { itinerary, focusToLeg, relayEnvironment, setNavigation, mapRef },
  { getStore },
) {
  const [planarLegs, setPlanarLegs] = useState([]);

  const position = getStore('PositionStore').getLocationState();

  useEffect(() => {
    const { lat, lon } = itinerary.legs[0].from;
    const origin = GeodeticToEcef(lat, lon);
    const legs = itinerary.legs.map(leg => {
      const geometry = polyUtil.decode(leg.legGeometry.points);
      return {
        ...leg,
        geometry: geometry.map(p => GeodeticToEnu(p[0], p[1], origin)),
      };
    });
    setPlanarLegs(legs);
  }, [itinerary.legs]);

  const { realTimeLegs, time, isPositioningAllowed } = useRealtimeLegs(
    planarLegs,
    mapRef,
    relayEnvironment,
  );

  if (!realTimeLegs.length) {
    return null;
  }

  // recompute estimated arrival
  let lastTransitLeg;
  let arrivalChange = 0;

  realTimeLegs.forEach(leg => {
    if (leg.transitLeg) {
      lastTransitLeg = leg;
    }
  });

  if (lastTransitLeg) {
    const rtLeg = realTimeLegs.find(leg => {
      return leg.legId === lastTransitLeg.legId;
    });
    arrivalChange = legTime(rtLeg.end) - legTime(lastTransitLeg.end);
  }

  const arrivalTime =
    legTime(realTimeLegs[realTimeLegs.length - 1].end) + arrivalChange;

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
      />
      <NaviBottom
        setNavigation={setNavigation}
        arrival={arrivalTime}
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
};

NaviContainer.contextTypes = {
  getStore: PropTypes.func.isRequired,
};

NaviContainer.defaultProps = { mapRef: undefined };

export default NaviContainer;
