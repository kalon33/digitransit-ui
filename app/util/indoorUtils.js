import {
  IndoorRouteLegType,
  RelativeDirection,
  VerticalDirection,
} from '../constants';
import { addAnalyticsEvent } from './analyticsUtils';

export function subwayTransferUsesSameStation(prevLeg, nextLeg) {
  return (
    prevLeg?.mode === 'SUBWAY' &&
    nextLeg?.mode === 'SUBWAY' &&
    prevLeg.to.stop.parentStation?.gtfsId ===
      nextLeg.from.stop.parentStation?.gtfsId
  );
}

const iconMappings = {
  elevator: 'icon_elevator',
  'elevator-filled': 'icon_elevator_filled',
  escalator: 'icon_escalator_down',
  'escalator-filled': 'icon_escalator_down_filled',
  stairs: 'icon_stairs_down',
  'stairs-filled': 'icon_stairs_down_filled',
  'stairs-down': 'icon_stairs_down',
  'stairs-down-filled': 'icon_stairs_down_filled',
  'stairs-up': 'icon_stairs_up',
  'stairs-up-filled': 'icon_stairs_up_filled',
  'escalator-down': 'icon_escalator_down_arrow',
  'escalator-down-filled': 'icon_escalator_down_arrow_filled',
  'escalator-up': 'icon_escalator_up_arrow',
  'escalator-up-filled': 'icon_escalator_up_arrow_filled',
};

export function getVerticalTransportationUseIconId(
  verticalDirection,
  relativeDirection,
  filled,
) {
  if (
    verticalDirection === undefined ||
    verticalDirection === VerticalDirection.Unknown ||
    relativeDirection === RelativeDirection.Elevator
  ) {
    return iconMappings[
      `${relativeDirection.toLowerCase()}${filled ? '-filled' : ''}`
    ];
  }
  return iconMappings[
    `${relativeDirection.toLowerCase()}-${verticalDirection.toLowerCase()}${
      filled ? '-filled' : ''
    }`
  ];
}

export function getEntranceObject(previousLeg, leg) {
  const entranceObjects = leg?.steps
    ?.map((step, index) => ({ ...step, index }))
    .filter(
      step =>
        // eslint-disable-next-line no-underscore-dangle
        step?.feature?.__typename === 'Entrance' || step?.feature?.code,
    );
  // Select the entrance to the outside if there are multiple entrances
  const entranceObject =
    previousLeg?.mode === 'SUBWAY'
      ? entranceObjects[entranceObjects.length - 1]
      : entranceObjects[0];

  return entranceObject;
}

export function getEntranceStepIndex(previousLeg, leg) {
  return getEntranceObject(previousLeg, leg)?.index;
}

export function getIndoorRouteLegType(previousLeg, leg, nextLeg) {
  const entranceObject = getEntranceObject(previousLeg, leg);
  // Outdoor routing starts from an entrance if the leg started from the subway.
  if (
    entranceObject &&
    ((leg.mode === 'WALK' && previousLeg?.mode === 'SUBWAY') ||
      leg.from.stop?.vehicleMode === 'SUBWAY')
  ) {
    return IndoorRouteLegType.StepsBeforeEntranceInside;
  }
  // Indoor routing starts from an entrance if the leg ends in the subway.
  if (
    entranceObject &&
    ((leg.mode === 'WALK' && nextLeg?.mode === 'SUBWAY') ||
      leg.to.stop?.vehicleMode === 'SUBWAY')
  ) {
    return IndoorRouteLegType.StepsAfterEntranceInside;
  }
  return IndoorRouteLegType.NoStepsInside;
}

export function getIndoorSteps(previousLeg, leg, nextLeg) {
  const entranceIndex = getEntranceStepIndex(previousLeg, leg);
  if (!entranceIndex) {
    return [];
  }
  const indoorRouteLegType = getIndoorRouteLegType(previousLeg, leg, nextLeg);
  if (indoorRouteLegType === IndoorRouteLegType.StepsBeforeEntranceInside) {
    return leg.steps.slice(0, entranceIndex + 1);
  }
  if (indoorRouteLegType === IndoorRouteLegType.StepsAfterEntranceInside) {
    return leg.steps.slice(entranceIndex);
  }
  return [];
}

export function isVerticalTransportationUse(relativeDirection) {
  return (
    relativeDirection === RelativeDirection.Elevator ||
    relativeDirection === RelativeDirection.Escalator ||
    relativeDirection === RelativeDirection.Stairs
  );
}

export function getIndoorStepsWithVerticalTransportationUse(
  previousLeg,
  leg,
  nextLeg,
) {
  return getIndoorSteps(previousLeg, leg, nextLeg).filter(step =>
    isVerticalTransportationUse(step?.relativeDirection),
  );
}

export function getIndoorRouteTranslationId(
  relativeDirection,
  verticalDirection,
  toLevelName,
) {
  if (relativeDirection === RelativeDirection.Elevator && toLevelName) {
    return 'indoor-step-message-elevator-to-floor';
  }
  return `indoor-step-message-${relativeDirection.toLowerCase()}${
    verticalDirection &&
    verticalDirection !== VerticalDirection.Unknown &&
    relativeDirection !== RelativeDirection.Elevator
      ? `-${verticalDirection.toLowerCase()}`
      : ''
  }`;
}

export function getEntranceWheelchairAccessibility(leg) {
  return leg?.steps?.find(
    // eslint-disable-next-line no-underscore-dangle
    step =>
      // eslint-disable-next-line no-underscore-dangle
      step?.feature?.__typename === 'Entrance' ||
      step?.feature?.wheelchairAccessible,
  )?.feature?.wheelchairAccessible;
}

export function getStepFocusAction(lat, lon, focusToPoint) {
  return e => {
    e.stopPropagation();
    focusToPoint(lat, lon);
    addAnalyticsEvent({
      category: 'Itinerary',
      action: 'ZoomMapToStep',
      name: null,
    });
  };
}
