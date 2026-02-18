import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Toggle from '../../Toggle';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import Icon from '../../Icon';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { settingsShape } from '../../../util/shapes';

export default function Personalisation(
  { currentSettings },
  { executeAction },
) {
  const onToggle = () => {
    addAnalyticsEvent({
      category: 'ItinerarySettings',
      action: `Settings${
        currentSettings.personalisation ? 'Disable' : 'Enable'
      }Personalisation`,
      name: null,
    });
    executeAction(saveRoutingSettings, {
      personalisation: !currentSettings.personalisation,
    });
  };

  return (
    <fieldset>
      <legend className="settings-header">
        <FormattedMessage id="personalisation" />
      </legend>
      <div className="mode-option-container toggle-container">
        <label
          htmlFor="settings-toggle-personalisation"
          className="toggle-label"
        >
          <Icon img="icon_star-with-circle" height={2} width={2} />
          <span className="personalisation-label">
            <FormattedMessage id="personalisation" />
          </span>
          <Toggle
            id="settings-toggle-personalisation"
            toggled={!!currentSettings.personalisation}
            onToggle={() => onToggle()}
          />
        </label>
      </div>
    </fieldset>
  );
}

Personalisation.propTypes = {
  currentSettings: settingsShape.isRequired,
};

Personalisation.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};
