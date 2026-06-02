import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { settingsShape } from '../../../util/shapes';
import Icon from '../../Icon';
import StreetModeSelector from './StreetModeSelector';
import TransportModes from './TransportModes';
import WalkingOptions from './WalkingOptions';
import Personalization from './Personalization';
import MinTransferTime from './MinTransferTime';
import AccessibilityOptions from './AccessibilityOptions';
import TransferOptions from './TransferOptions';
import CityBikes from './CityBikes';
import Scooters from './Scooters';
import TaxiOptions from './TaxiOptions';
import RestoreDefaultSettings from './RestoreDefaultSettings';
import {
  showModeSettings,
  useCitybikes,
  useScooters,
} from '../../../util/modeUtils';
import ScrollableWrapper from '../../ScrollableWrapper';
import { useConfigContext } from '../../../configurations/ConfigContext';

function CustomizeSearch({ onToggleClick, settings, mobile }) {
  const config = useConfigContext();
  const intl = useIntl();

  const backIcon = mobile ? (
    <Icon img="icon_arrow-collapse--left" />
  ) : (
    <Icon className="close-icon" img="icon_close" />
  );
  return (
    <div className="customize-search">
      <div className="settings-section">
        <div className="settings-header">
          <button
            aria-label={intl.formatMessage({ id: 'close-settings' })}
            type="button"
            className="close-offcanvas"
            onClick={() => {
              // Move focus back to the button that opened settings window
              const openSettingsButton = document.querySelector(
                '.open-advanced-settings-window-button',
              );
              if (openSettingsButton) {
                openSettingsButton.focus();
              }
              onToggleClick();
            }}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          >
            {backIcon}
          </button>
          <h1>{intl.formatMessage({ id: 'settings' })}</h1>
        </div>
        <div
          className="separator"
          style={{ marginLeft: '-16px', width: 'calc(100% + 32px' }}
        />
      </div>
      <ScrollableWrapper>
        <div className="settings-section">
          <WalkingOptions currentSettings={settings} />
        </div>
        {config.personalization && (
          <div className="settings-section">
            <Personalization currentSettings={settings} />
          </div>
        )}
        <div className="settings-section">
          {showModeSettings(config) && <TransportModes />}
          {config.minTransferTimeSelection && (
            <MinTransferTime
              minTransferTimeOptions={config.minTransferTimeSelection}
              currentSettings={settings}
            />
          )}
          <TransferOptions currentSettings={settings} />
        </div>
        {useCitybikes(config.vehicleRental?.networks, config) && (
          <div className="settings-section">
            <CityBikes />
          </div>
        )}
        <div className="settings-section">
          <StreetModeSelector currentSettings={settings} />
        </div>
        <div className="settings-section">
          <AccessibilityOptions currentSettings={settings} />
        </div>
        {useScooters(config) && (
          <div className="settings-section">
            <Scooters />
          </div>
        )}
        {config.flex?.allowTaxiJourneys &&
          config.transportModes.taxi.availableForSelection && (
            <div className="settings-section">
              <TaxiOptions currentSettings={settings} />
            </div>
          )}
        <RestoreDefaultSettings />
      </ScrollableWrapper>
    </div>
  );
}

CustomizeSearch.propTypes = {
  onToggleClick: PropTypes.func.isRequired,
  settings: settingsShape.isRequired,
  mobile: PropTypes.bool,
};

CustomizeSearch.defaultProps = { mobile: false };

const withStore = connectToStores(
  CustomizeSearch,
  ['RoutingSettingsStore'],
  context => ({
    settings: context.getStore('RoutingSettingsStore').getRoutingSettings(),
  }),
);

export { withStore as default, CustomizeSearch as component };
