import PropTypes from 'prop-types';
import React from 'react';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import { settingsShape, minTransferTimeShape } from '../../../util/shapes';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import SearchSettingsDropdown from './SearchSettingsDropdown';

const MinTransferTime = (
  { settings, minTransferTimeOptions },
  { executeAction },
  options = minTransferTimeOptions,
  currentSelection = options.find(
    option => option.value === settings.minTransferTime,
  ),
) => (
  <SearchSettingsDropdown
    currentSelection={currentSelection}
    onOptionSelected={value => {
      executeAction(saveRoutingSettings, {
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
};

MinTransferTime.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};

export default MinTransferTime;
