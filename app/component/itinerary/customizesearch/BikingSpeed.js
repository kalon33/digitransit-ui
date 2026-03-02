import PropTypes from 'prop-types';
import React from 'react';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import SearchSettingsDropdown, { valueShape } from './SearchSettingsDropdown';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { findNearestOption } from '../../../util/planParamUtil';

const getFiveStepOptionsNumerical = options => {
  const numericalOptions = [];
  options.forEach(item => {
    numericalOptions.push({
      title: `${Math.round(item * 3.6)} km/h`,
      value: item,
    });
  });
  return numericalOptions;
};

export default function BikingSpeed(
  { bikeSpeed, bikeSpeedOptions },
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
      labelId="biking-speed"
      translateLabels={false}
    />
  );
}

BikingSpeed.propTypes = {
  bikeSpeed: valueShape.isRequired,
  bikeSpeedOptions: PropTypes.arrayOf(PropTypes.number).isRequired,
};

BikingSpeed.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};
