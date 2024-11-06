import PropTypes from 'prop-types';
import React, { useRef, useCallback } from 'react';
import { checkPositioningPermission } from '../../action/PositionActions';
import { legTime } from '../../util/legUtils';
import { legShape, relayShape } from '../../util/shapes';
import NaviBottom from './NaviBottom';
import NaviTop from './NaviTop';
import { useRealtimeLegs } from './hooks/useRealtimeLegs';

function NaviContainer(
  { legs, focusToLeg, relayEnvironment, setNavigation, mapRef },
  { getStore },
) {
  const locationOK = useRef(true);
  const position = getStore('PositionStore').getLocationState();

  const isPositioningAllowed = useCallback(async () => {
    const permission = await checkPositioningPermission();
    return permission.state === 'granted';
  }, [checkPositioningPermission]);

  const enableMapTracking = useCallback(() => {
    locationOK.current = isPositioningAllowed().catch(err =>
      // eslint-disable-next-line no-console
      console.log('Failed to determine if positioning is allowed', err),
    );
    if (locationOK.current) {
      mapRef?.enableMapTracking();
    }
  }, [locationOK, mapRef, isPositioningAllowed]);

  const { realTimeLegs, time } = useRealtimeLegs(
    legs,
    relayEnvironment,
    enableMapTracking,
  );

  // recompute estimated arrival
  let lastTransitLeg;
  let arrivalChange = 0;

  legs.forEach(leg => {
    if (leg.transitLeg) {
      lastTransitLeg = leg;
    }
  });

  if (lastTransitLeg) {
    const rtLeg = realTimeLegs.find(leg => {
      return leg.id === lastTransitLeg.id;
    });
    arrivalChange = legTime(rtLeg.end) - legTime(lastTransitLeg.end);
  }

  const arrivalTime = legTime(legs[legs.length - 1].end) + arrivalChange;

  return (
    <>
      <NaviTop
        realTimeLegs={realTimeLegs}
        focusToLeg={
          mapRef?.state.mapTracking || locationOK.current ? null : focusToLeg
        }
        time={time}
        position={position}
      />{' '}
      <NaviBottom setNavigation={setNavigation} arrival={arrivalTime} />
    </>
  );
}

NaviContainer.propTypes = {
  legs: PropTypes.arrayOf(legShape).isRequired,
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
