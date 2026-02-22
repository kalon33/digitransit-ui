import PropTypes from 'prop-types';
import React from 'react';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import SearchSettingsDropdown, {
  getFiveStepOptionsNumerical,
  valueShape,
} from './SearchSettingsDropdown';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { findNearestOption } from '../../../util/planParamUtil';
import { settingsShape } from '../../../util/shapes';

export default function BikingSpeed(
  { bikeSpeed, bikeSpeedOptions, defaultSettings },
  { executeAction },
) {
  const options = getFiveStepOptionsNumerical(bikeSpeedOptions);
  const currentSelection =
    options.find(option => option.value === bikeSpeed) ||
    options.find(
      option => option.value === findNearestOption(bikeSpeed, bikeSpeedOptions),
    );
  return (
    <SearchSettingsDropdown
      name="bike-speed-selector"
      currentSelection={currentSelection}
      defaultValue={defaultSettings.bikeSpeed}
      onOptionSelected={value => {
        executeAction(saveRoutingSettings, {
          bikeSpeed: value,
        });
        addAnalyticsEvent({
          category: 'ItinerarySettings',
          action: 'ChangeBikingSpeed',
          name: value,
        });
      }}
      options={options}
      formatOptions
      labelId="biking-speed"
      translateLabels={false}
    />
  );
}

BikingSpeed.propTypes = {
  bikeSpeed: valueShape.isRequired,
  bikeSpeedOptions: PropTypes.arrayOf(PropTypes.number).isRequired,
  defaultSettings: settingsShape.isRequired,
};

BikingSpeed.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};
