import PropTypes from 'prop-types';
import React from 'react';
import SettingsToggle from './SettingsToggle';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { settingsShape } from '../../../util/shapes';
import { useConfigContext } from '../../../configurations/ConfigContext';

export default function TransferOptionsSection(
  { defaultSettings, currentSettings },
  { executeAction },
) {
  const { transferPenaltyHigh } = useConfigContext();
  const avoidTransfers =
    currentSettings.transferPenalty !== defaultSettings.transferPenalty;

  const onToggle = () => {
    executeAction(saveRoutingSettings, {
      transferPenalty: avoidTransfers
        ? defaultSettings.transferPenalty
        : transferPenaltyHigh,
    });
    addAnalyticsEvent({
      category: 'ItinerarySettings',
      action: 'changeNumberOfTransfers',
      name: avoidTransfers,
    });
  };

  return (
    <SettingsToggle
      labelId="avoid-transfers"
      id="settings-toggle-transfers"
      toggled={avoidTransfers}
      onToggle={onToggle}
    />
  );
}

TransferOptionsSection.propTypes = {
  defaultSettings: settingsShape.isRequired,
  currentSettings: settingsShape.isRequired,
};

TransferOptionsSection.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};
