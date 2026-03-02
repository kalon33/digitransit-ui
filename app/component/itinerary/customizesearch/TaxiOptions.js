import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import SettingsToggle from './SettingsToggle';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { settingsShape } from '../../../util/shapes';
import Icon from '../../Icon';
import { useConfigContext } from '../../../configurations/ConfigContext';

const TaxiOptions = ({ currentSettings }, { executeAction }) => {
  const { colors } = useConfigContext();
  const taxiRoutingState = currentSettings.includeTaxiSuggestions
    ? 'Disable'
    : 'Enable';
  const onToggle = () => {
    executeAction(saveRoutingSettings, {
      includeTaxiSuggestions: !currentSettings.includeTaxiSuggestions,
    });
    addAnalyticsEvent({
      category: 'ItinerarySettings',
      action: `Settings${taxiRoutingState}Taxis`,
      name: 'includeTaxiSuggestions',
    });
  };

  return (
    <>
      <div className="section-header">
        <FormattedMessage id="taxis-and-ride-hailing" />
      </div>
      <SettingsToggle
        id="settings-toggle-taxi"
        labelId="taxis-and-ride-hailing"
        labelStyle="mode-label"
        leftElement={
          <Icon
            img="icon_taxi-external"
            color={colors.taxi}
            height={2}
            width={2}
          />
        }
        toggled={!!currentSettings.includeTaxiSuggestions}
        onToggle={onToggle}
      />
    </>
  );
};

TaxiOptions.propTypes = {
  currentSettings: settingsShape.isRequired,
};

TaxiOptions.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};

export default TaxiOptions;
