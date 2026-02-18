import PropTypes from 'prop-types';
import React from 'react';
import SettingsToggle from '../../Toggle';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import Icon from '../../Icon';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { settingsShape } from '../../../util/shapes';

const AccessibilityOptions = ({ currentSettings }, { executeAction }) => {
  const onToggle = () => {
    addAnalyticsEvent({
      category: 'ItinerarySettings',
      action: `Settings${
        currentSettings.accessibilityOption ? 'Disable' : 'Enable'
      }WheelChair`,
      name: null,
    });
    executeAction(saveRoutingSettings, {
      accessibilityOption: !currentSettings.accessibilityOption,
    });
  };

  return (
    <SettingsToggle
      labelId="accessibility"
      id="settings-toggle-accessibility"
      icon={<Icon img="icon_wheelchair" height={2} width={2} />}
      toggled={!!currentSettings.accessibilityOption}
      onToggle={onToggle}
    />
  );
};

AccessibilityOptions.propTypes = {
  currentSettings: settingsShape.isRequired,
};

AccessibilityOptions.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};

export default AccessibilityOptions;
