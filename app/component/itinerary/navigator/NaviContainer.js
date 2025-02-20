import connectToStores from 'fluxible-addons-react/connectToStores';
import { routerShape } from 'found';
import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { legTime } from '../../../util/legUtils';
import { legShape, relayShape } from '../../../util/shapes';
import {
  startLocationWatch,
  stopLocationWatch,
} from '../../../action/PositionActions';
import NaviBottom from './NaviBottom';
import NaviCardContainer from './NaviCardContainer';
import { useRealtimeLegs } from './hooks/useRealtimeLegs';
import NavigatorOutroModal from './navigatoroutro/NavigatorOutroModal';
import { DESTINATION_RADIUS, summaryString } from './NaviUtils';

const ADDITIONAL_ARRIVAL_TIME = 60000; // 60 seconds in ms
const LEGLOG = true;

function NaviContainer(
  {
    legs,
    focusToLeg,
    relayEnvironment,
    setNavigation,
    isNavigatorIntroDismissed,
    mapRef,
    mapLayerRef,
    updateLegs,
  },
  { executeAction, getStore, router },
) {
  const hasPosition = useRef(false);
  const prevPos = useRef(undefined);
  const posFrozen = useRef(0);

  let position = getStore('PositionStore').getLocationState();
  if (!position.hasLocation) {
    position = null;
  } else {
    hasPosition.current = true;
  }
  const { vehicles } = getStore('RealTimeInformationStore');
  const {
    realTimeLegs,
    time,
    tailLength,
    firstLeg,
    lastLeg,
    previousLeg,
    currentLeg,
    nextLeg,
    startItinerary,
  } = useRealtimeLegs(relayEnvironment, legs, position, vehicles, updateLegs);

  useEffect(() => {
    setTimeout(() => mapRef?.enableMapTracking(), 10); // try always, shows annoying notifier
  }, [mapRef, hasPosition.current]);

  useEffect(() => {
    if (position && prevPos.current) {
      if (
        prevPos.current.lat === position.lat &&
        prevPos.current.lon === position.lon
      ) {
        posFrozen.current += 1;
        if (posFrozen.current === 3) {
          executeAction(stopLocationWatch);
          setTimeout(() => executeAction(startLocationWatch), 10);
        }
      } else {
        posFrozen.current = 0;
      }
    }
    prevPos.current = position;
  }, [time]);

  if (!realTimeLegs?.length) {
    return null;
  }

  const arrivalTime = legTime(lastLeg.end);
  const isDestinationReached =
    (currentLeg === lastLeg || time > arrivalTime) &&
    position &&
    tailLength <= DESTINATION_RADIUS;
  const isPastExpectedArrival = time > arrivalTime + ADDITIONAL_ARRIVAL_TIME;
  const isJourneyCompleted = isDestinationReached || isPastExpectedArrival;

  if (LEGLOG) {
    // eslint-disable-next-line
    console.log(...summaryString(realTimeLegs, time, previousLeg, currentLeg, nextLeg));
  }

  return (
    <>
      <NaviCardContainer
        legs={realTimeLegs}
        focusToLeg={position ? null : focusToLeg}
        time={time}
        position={position}
        mapLayerRef={mapLayerRef}
        tailLength={tailLength}
        currentLeg={time > arrivalTime ? previousLeg : currentLeg}
        nextLeg={nextLeg}
        firstLeg={firstLeg}
        lastLeg={lastLeg}
        isJourneyCompleted={isJourneyCompleted}
        previousLeg={previousLeg}
        startItinerary={startItinerary}
      />
      {isJourneyCompleted && isNavigatorIntroDismissed && (
        <NavigatorOutroModal
          destination={lastLeg.to.name}
          onClose={() => router.push('/')}
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
  legs: PropTypes.arrayOf(legShape).isRequired,
  focusToLeg: PropTypes.func.isRequired,
  relayEnvironment: relayShape.isRequired,
  setNavigation: PropTypes.func.isRequired,
  isNavigatorIntroDismissed: PropTypes.bool,
  // eslint-disable-next-line
  mapRef: PropTypes.object,
  mapLayerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object])
    .isRequired,
  updateLegs: PropTypes.func.isRequired,
};

NaviContainer.contextTypes = {
  executeAction: PropTypes.func,
  getStore: PropTypes.func.isRequired,
  router: routerShape.isRequired,
};

NaviContainer.defaultProps = {
  mapRef: undefined,
  isNavigatorIntroDismissed: false,
};

const connectedComponent = connectToStores(
  NaviContainer,
  ['MessageStore'],
  context => ({
    messages: context.getStore('MessageStore').getMessages(),
  }),
);

export default connectedComponent;
