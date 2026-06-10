import PropTypes from 'prop-types';
import React from 'react';
import { settingsShape, minTransferTimeShape } from '../../../util/shapes';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import SearchSettingsDropdown from './SearchSettingsDropdown';

const MinTransferTime = (
  { settings, minTransferTimeOptions, updateSettings },
  options = minTransferTimeOptions,
  currentSelection = options.find(
    option => option.value === settings.minTransferTime,
  ),
) => (
  <SearchSettingsDropdown
    currentSelection={currentSelection}
    onOptionSelected={value => {
      updateSettings({
        minTransferTime: value,
      });
      addAnalyticsEvent({
        category: 'ItinerarySettings',
        action: 'ChangeMinTransferTime',
        name: value,
      });
    }}
    options={options}
    labelId="min-transfer-time"
    name="minTransferTime"
    translateLabels={false}
  />
);

MinTransferTime.propTypes = {
  minTransferTimeOptions: minTransferTimeShape.isRequired,
  settings: settingsShape.isRequired,
  updateSettings: PropTypes.func.isRequired,
};

export default MinTransferTime;
