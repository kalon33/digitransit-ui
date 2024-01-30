import omitBy from 'lodash/omitBy';
import moment from 'moment';

import {
  getDefaultModes,
  modesAsOTPModes,
  getBicycleCompatibleModes,
  isTransportModeAvailable,
} from './modeUtils';
import { otpToLocation, getIntermediatePlaces } from './otpStrings';
import { getDefaultNetworks } from './vehicleRentalUtils';
import { getCustomizedSettings } from '../store/localStorage';
import { estimateItineraryDistance } from './geo-utils';

/**
 * Find an option nearest to the value
 *
 * @param value a number
 * @param options array of numbers
 * @returns on option from options that is closest to the provided value
 */
export function findNearestOption(value, options) {
  let currNearest = options[0];
  let diff = Math.abs(value - currNearest);
  for (let i = 0; i < options.length; i++) {
    const newdiff = Math.abs(value - options[i]);
    if (newdiff < diff) {
      diff = newdiff;
      currNearest = options[i];
    }
  }
  return currNearest;
}

function nullOrUndefined(val) {
  return val === null || val === undefined;
}

/**
 * Retrieves the default settings from the configuration.
 *
 * @param {*} config UI configuration
 */
export function getDefaultSettings(config) {
  if (!config) {
    return {};
  }
  return {
    ...config.defaultSettings,
    modes: getDefaultModes(config).sort(),
    allowedBikeRentalNetworks: config.transportModes.citybike.defaultValue
      ? getDefaultNetworks(config)
      : [],
  };
}

/**
 * Retrieves the current (customized) settings kept in local store
 * Missing setting gets a default value
 * @param {*} config the configuration for the software installation
 */
export function getSettings(config) {
  const defaultSettings = getDefaultSettings(config);
  const userSettings = getCustomizedSettings();
  const settings = {
    ...defaultSettings,
    ...userSettings,
    modes: userSettings?.modes // filter modes to configured allowed values
      ? [
          ...userSettings.modes.filter(mode =>
            isTransportModeAvailable(config, mode),
          ),
          'WALK',
        ].sort()
      : defaultSettings.modes,
    // filter networks to configured allowed values
    allowedBikeRentalNetworks:
      userSettings.allowedBikeRentalNetworks.length > 0
        ? userSettings.allowedBikeRentalNetworks.filter(network =>
            defaultSettings.allowedCitybikeNetworks.includes(network),
          )
        : defaultSettings.allowedBikeRentalNetworks,
  };
  const { defaultOptions } = config;
  return {
    ...settings,
    walkSpeed: findNearestOption(settings.walkSpeed, defaultOptions.walkSpeed),
    bikeSpeed: findNearestOption(settings.bikeSpeed, defaultOptions.bikeSpeed),
    walkReluctance: Number(settings.walkReluctance),
    walkBoardCost: Number(settings.walkBoardCost),
  };
}

function shouldMakeParkRideQuery(distance, config, settings) {
  return (
    distance > config.suggestCarMinDistance &&
    settings.includeParkAndRideSuggestions
  );
}

function shouldMakeCarQuery(distance, config, settings) {
  return (
    config.showCO2InItinerarySummary ||
    (distance > config.suggestCarMinDistance && settings.includeCarSuggestions)
  );
}

export function hasStartAndDestination({ from, to }) {
  return from && to && from !== '-' && to !== '-';
}

export const getPlanParams = (
  config,
  {
    params: { from, to },
    location: {
      query: { arriveBy, intermediatePlaces, time },
    },
  },
  relaxSettings,
) => {
  const defaultSettings = getDefaultSettings(config);
  const settings = getSettings(config);
  const fromLocation = otpToLocation(from);
  const toLocation = otpToLocation(to);
  const intermediateLocations = getIntermediatePlaces({
    intermediatePlaces,
  });

  let modesOrDefault = relaxSettings ? defaultSettings.modes : settings.modes;
  if (!settings.allowedBikeRentalNetworks?.length) {
    // do not ask citybike routes without networks
    modesOrDefault = modesOrDefault.filter(mode => mode !== 'BICYCLE_RENT');
  }
  const formattedModes = modesAsOTPModes(modesOrDefault);
  const wheelchair = !!settings.accessibilityOption;
  const linearDistance = estimateItineraryDistance(
    fromLocation,
    toLocation,
    intermediateLocations,
  );
  const ticketTypes =
    relaxSettings || settings.ticketTypes === 'none'
      ? null
      : settings.ticketTypes;
  const walkReluctance = relaxSettings
    ? defaultSettings.walkReluctance
    : settings.walkReluctance;
  const walkBoardCost = relaxSettings
    ? defaultSettings.walkBoardCost
    : settings.walkBoardCost;

  return {
    ...settings,
    ...omitBy(
      {
        fromPlace: from,
        toPlace: to,
        from: fromLocation,
        to: toLocation,
        minTransferTime: config.minTransferTime,
        ticketTypes,
        transferPenalty: config.transferPenalty,
        optimize: config.optimize,
      },
      nullOrUndefined,
    ),
    date: (time ? moment(time * 1000) : moment()).format('YYYY-MM-DD'),
    time: (time ? moment(time * 1000) : moment()).format('HH:mm:ss'),
    numItineraries: 5,
    arriveBy: arriveBy === 'true',
    wheelchair,
    walkReluctance,
    walkBoardCost,
    modes: formattedModes,
    modeWeight: config.customWeights,
    shouldMakeWalkQuery:
      !wheelchair &&
      linearDistance < config.suggestWalkMaxDistance &&
      !config.hideWalkOption,
    shouldMakeBikeQuery:
      !wheelchair &&
      linearDistance < config.suggestBikeMaxDistance &&
      settings.includeBikeSuggestions,
    shouldMakeCarQuery: shouldMakeCarQuery(linearDistance, config, settings),
    shouldMakeParkRideQuery:
      modesOrDefault.length > 1 &&
      shouldMakeParkRideQuery(linearDistance, config, settings),
    showBikeAndPublicItineraries:
      modesOrDefault.length > 1 &&
      !wheelchair &&
      config.showBikeAndPublicItineraries &&
      settings.includeBikeSuggestions,
    showBikeAndParkItineraries:
      modesOrDefault.length > 1 &&
      !wheelchair &&
      config.showBikeAndParkItineraries &&
      !config.includePublicWithBikePlan
        ? settings.showBikeAndParkItineraries
        : settings.includeBikeSuggestions,
    bikeAndPublicModes: [
      { mode: 'BICYCLE' },
      ...modesAsOTPModes(getBicycleCompatibleModes(config, modesOrDefault)),
    ],
    bikeParkModes: [
      { mode: 'BICYCLE', qualifier: 'PARK' },
      ...formattedModes,
    ].filter(mode => mode.qualifier !== 'RENT'), // BICYCLE_RENT can't be used together with BICYCLE_PARK
    parkRideModes: [{ mode: 'CAR', qualifier: 'PARK' }, ...formattedModes],
  };
};
