import PropTypes from 'prop-types';
import React from 'react';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import SearchSettingsDropdown, {
  getFiveStepOptions,
} from './SearchSettingsDropdown';
import SettingsToggle from './SettingsToggle';
import { findNearestOption } from '../../../util/planParamUtil';
import { settingsShape } from '../../../util/shapes';
import { useConfigContext } from '../../../configurations/ConfigContext';

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
        defaultValue={defaultSettings.walkSpeed}
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
        highlightDefaulValue
        formatOptions
        name="walkspeed"
      />
      <div className="separator" />
      <SettingsToggle
        id="settings-toggle-avoid-walking"
        labelId="avoid-walking"
        toggled={currentSettings.walkReluctance === reluctanceOptions.least}
        onToggle={onToggle}
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
