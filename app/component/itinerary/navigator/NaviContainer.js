import distance from '@digitransit-search-util/digitransit-search-util-distance';
import PropTypes from 'prop-types';
import React from 'react';
import { legTime } from '../../../util/legUtils';
import { itineraryShape, relayShape } from '../../../util/shapes';
import NaviBottom from './NaviBottom';
import NaviCardContainer from './NaviCardContainer';
import { useRealtimeLegs } from './hooks/useRealtimeLegs';
import NavigatorOutroModal from './navigatoroutro/NavigatorOutroModal';

const DESTINATION_RADIUS = 20; // meters
const ADDITIONAL_ARRIVAL_TIME = 60000; // 60 seconds in ms

function NaviContainer(
  {
    itinerary,
    focusToLeg,
    relayEnvironment,
    setNavigation,
    isNavigatorIntroDismissed,
    mapRef,
    mapLayerRef,
  },
  { getStore },
) {
  const position = getStore('PositionStore').getLocationState();

  const {
    realTimeLegs,
    time,
    isPositioningAllowed,
    origin,
    firstLeg,
    lastLeg,
    currentLeg,
    nextLeg,
  } = useRealtimeLegs(mapRef, relayEnvironment, itinerary.legs);

  if (!realTimeLegs?.length) {
    return null;
  }

  const arrivalTime = legTime(realTimeLegs[realTimeLegs.length - 1].end);

  const isDestinationReached =
    position && lastLeg && distance(position, lastLeg.to) <= DESTINATION_RADIUS;

  const isPastExpectedArrival = time > arrivalTime + ADDITIONAL_ARRIVAL_TIME;

  const isJourneyCompleted = isDestinationReached || isPastExpectedArrival;

  return (
    <>
      <NaviCardContainer
        legs={realTimeLegs}
        focusToLeg={
          mapRef?.state.mapTracking || isPositioningAllowed ? null : focusToLeg
        }
        time={time}
        position={position}
        mapLayerRef={mapLayerRef}
        origin={origin}
        currentLeg={currentLeg}
        nextLeg={nextLeg}
        firstLeg={firstLeg}
        lastLeg={lastLeg}
        isJourneyCompleted={isJourneyCompleted}
      />
      {isJourneyCompleted && isNavigatorIntroDismissed && (
        <NavigatorOutroModal
          destination={realTimeLegs[realTimeLegs.length - 1].to.name}
          onClose={() => setNavigation(false)}
        />
      )}
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
  isNavigatorIntroDismissed: PropTypes.bool,
  // eslint-disable-next-line
  mapRef: PropTypes.object,
  mapLayerRef: PropTypes.func.isRequired,
};

NaviContainer.contextTypes = {
  getStore: PropTypes.func.isRequired,
};

NaviContainer.defaultProps = {
  mapRef: undefined,
  isNavigatorIntroDismissed: false,
};

export default NaviContainer;
