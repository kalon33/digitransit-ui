import { IndoorLegType, IndoorStepType, VerticalDirection } from '../constants';
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
  type,
  filled,
) {
  if (
    verticalDirection === undefined ||
    verticalDirection === VerticalDirection.Unknown ||
    type === IndoorStepType.ElevatorUse
  ) {
    return iconMappings[
      `${type?.toLowerCase().replace('use', '')}${filled ? '-filled' : ''}`
    ];
  }
  return iconMappings[
    `${type
      ?.toLowerCase()
      .replace('use', '')}-${verticalDirection.toLowerCase()}${
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

export function getIndoorLegType(previousLeg, leg, nextLeg) {
  const entranceObject = getEntranceObject(previousLeg, leg);
  // Outdoor routing starts from an entrance if the leg started from the subway.
  if (
    entranceObject &&
    ((leg.mode === 'WALK' && previousLeg?.mode === 'SUBWAY') ||
      leg.from.stop?.vehicleMode === 'SUBWAY')
  ) {
    return IndoorLegType.StepsBeforeEntranceInside;
  }
  // Indoor routing starts from an entrance if the leg ends in the subway.
  if (
    entranceObject &&
    ((leg.mode === 'WALK' && nextLeg?.mode === 'SUBWAY') ||
      leg.to.stop?.vehicleMode === 'SUBWAY')
  ) {
    return IndoorLegType.StepsAfterEntranceInside;
  }
  return IndoorLegType.NoStepsInside;
}

export function getIndoorSteps(previousLeg, leg, nextLeg) {
  const entranceIndex = getEntranceStepIndex(previousLeg, leg);
  if (!entranceIndex) {
    return [];
  }
  const indoorLegType = getIndoorLegType(previousLeg, leg, nextLeg);
  if (indoorLegType === IndoorLegType.StepsBeforeEntranceInside) {
    return leg.steps.slice(0, entranceIndex + 1);
  }
  if (indoorLegType === IndoorLegType.StepsAfterEntranceInside) {
    return leg.steps.slice(entranceIndex);
  }
  return [];
}

export function isVerticalTransportationUse(type) {
  return (
    type === IndoorStepType.ElevatorUse ||
    type === IndoorStepType.EscalatorUse ||
    type === IndoorStepType.StairsUse
  );
}

export function getIndoorStepsWithVerticalTransportation(
  previousLeg,
  leg,
  nextLeg,
) {
  return getIndoorSteps(previousLeg, leg, nextLeg).filter(step =>
    // eslint-disable-next-line no-underscore-dangle
    isVerticalTransportationUse(step?.feature?.__typename),
  );
}

export function getIndoorTranslationId(type, verticalDirection, toLevelName) {
  if (type === IndoorStepType.ElevatorUse && toLevelName) {
    return 'indoor-step-message-elevator-to-floor';
  }
  return `indoor-step-message-${type?.toLowerCase().replace('use', '')}${
    verticalDirection &&
    verticalDirection !== VerticalDirection.Unknown &&
    type !== IndoorStepType.ElevatorUse
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
