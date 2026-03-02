import PropTypes from 'prop-types';
import React from 'react';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import SearchSettingsDropdown from './SearchSettingsDropdown';
import SettingsToggle from './SettingsToggle';
import { findNearestOption } from '../../../util/planParamUtil';
import { settingsShape } from '../../../util/shapes';
import { useConfigContext } from '../../../configurations/ConfigContext';

const roundToOneDecimal = number => {
  const rounded = Math.round(number * 10) / 10;
  return rounded.toFixed(1).replace('.', ',');
};

/**
 * Builds an array of options: least, less, default, more, most with preset
 * multipliers or given values for each option. Note: a higher value (relative to
 * the given value) means less/worse.
 *
 * @param {*} options The options to select from.
 */
const getFiveStepOptions = options => [
  {
    title: 'option-least',
    value: options.least || options[0],
    kmhValue: `${roundToOneDecimal(options[0] * 3.6)} km/h`,
  },
  {
    title: 'option-less',
    value: options.less || options[1],
    kmhValue: `${roundToOneDecimal(options[1] * 3.6)} km/h`,
  },
  {
    title: 'option-default',
    value: options[2],
    kmhValue: `${roundToOneDecimal(options[2] * 3.6)} km/h`,
  },
  {
    title: 'option-more',
    value: options.more || options[3],
    kmhValue: `${roundToOneDecimal(options[3] * 3.6)} km/h`,
  },
  {
    title: 'option-most',
    value: options.most || options[4],
    kmhValue: `${roundToOneDecimal(options[4] * 3.6)} km/h`,
  },
];

export default function WalkingOptions(
  { currentSettings, defaultSettings },
  { executeAction },
) {
  const { defaultOptions } = useConfigContext();
  const reluctanceOptions = defaultOptions.walkReluctance;
  const options = getFiveStepOptions(defaultOptions.walkSpeed);
  const currentWalkSelection =
    options.find(option => option.value === currentSettings.walkSpeed) ||
    options.find(
      option =>
        option.value ===
        findNearestOption(currentSettings.walkSpeed, defaultOptions.walkSpeed),
    );
  const onToggle = () => {
    const avoid = currentSettings.walkReluctance !== reluctanceOptions.least;
    executeAction(saveRoutingSettings, {
      walkReluctance: avoid
        ? reluctanceOptions.least
        : defaultSettings.walkReluctance,
    });
    addAnalyticsEvent({
      category: 'ItinerarySettings',
      action: 'ChangeAmountOfWalking',
      name: avoid ? 'avoid' : 'default',
    });
  };

  return (
    <>
      <SearchSettingsDropdown
        currentSelection={currentWalkSelection}
        onOptionSelected={value => {
          executeAction(saveRoutingSettings, {
            walkSpeed: value,
          });
          addAnalyticsEvent({
            category: 'ItinerarySettings',
            action: 'ChangeWalkingSpeed',
            name: value,
          });
        }}
        options={options}
        labelId="walking-speed"
        name="walkspeed"
      />
      <SettingsToggle
        id="settings-toggle-avoid-walking"
        labelId="avoid-walking"
        toggled={currentSettings.walkReluctance === reluctanceOptions.least}
        onToggle={onToggle}
        borderStyle="top-border"
      />
    </>
  );
}

WalkingOptions.propTypes = {
  defaultSettings: settingsShape.isRequired,
  currentSettings: settingsShape.isRequired,
};

WalkingOptions.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};
