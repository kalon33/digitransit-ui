import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { settingsShape } from '../../../util/shapes';
import Icon from '../../Icon';
import FareZoneSelector from './FareZoneSelector';
import StreetModeSelectorPanel from './StreetModeSelectorPanel';
import TransportModesSection from './TransportModesSection';
import WalkingOptionsSection from './WalkingOptionsSection';
import MinTransferTimeSection from './MinTransferTimeSection';
import AccessibilityOptionSection from './AccessibilityOptionSection';
import TransferOptionsSection from './TransferOptionsSection';
import RentalNetworkSelector from './RentalNetworkSelector';
import ScooterNetworkSelector from './ScooterNetworkSelector';
import TaxiOptionsSection from './TaxiOptionsSection';
import RestoreDefaultSettingSection from './RestoreDefaultSettingSection';
import {
  getReadMessageIds,
  setReadMessageIds,
} from '../../../store/localStorage';
import { isKeyboardSelectionEvent } from '../../../util/browser';
import {
  showModeSettings,
  useCitybikes,
  useScooters,
} from '../../../util/modeUtils';
import ScrollableWrapper from '../../ScrollableWrapper';
import { getDefaultSettings } from '../../../util/planParamUtil';
import {
  getCitybikeNetworks,
  getScooterNetworks,
  RentalNetworkType,
} from '../../../util/vehicleRentalUtils';
import { useTranslationsContext } from '../../../util/useTranslationsContext';
import { useConfigContext } from '../../../configurations/ConfigContext';

function CustomizeSearch({ onToggleClick, settings, mobile }) {
  const config = useConfigContext();
  const intl = useTranslationsContext();
  const defaultSettings = getDefaultSettings(config);

  const [showEScooterDisclaimer, setShowEScooterDisclaimer] = useState(
    !getReadMessageIds().includes('e_scooter_settings_disclaimer'),
  );

  const handleEScooterDisclaimerClose = () => {
    const readMessageIds = getReadMessageIds() || [];
    readMessageIds.push('e_scooter_settings_disclaimer');
    setReadMessageIds(readMessageIds);
    setShowEScooterDisclaimer(false);
  };

  // Merge default and customized settings
  const currentSettings = { ...defaultSettings, ...settings };
  let ticketOptions = [];
  if (config.showTicketSelector && config.availableTickets) {
    Object.keys(config.availableTickets).forEach(key => {
      if (config.feedIds.indexOf(key) > -1) {
        ticketOptions = ticketOptions.concat(
          Object.keys(config.availableTickets[key]),
        );
      }
    });
    ticketOptions.sort((a, b) => {
      return a.split('').reverse() > b.split('').reverse() ? 1 : -1;
    });
  }
  const backIcon = mobile ? (
    <Icon className="close-icon" img="icon_arrow-collapse--left" />
  ) : (
    <Icon className="close-icon" img="icon_close" />
  );
  return (
    <form className="customize-search">
      <button
        aria-label={intl.formatMessage({
          id: 'close-settings',
        })}
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
      <div className="settings-option-container">
        <h2>
          {intl.formatMessage({
            id: 'settings',
            defaultMessage: 'Settings',
          })}
        </h2>
      </div>
      <ScrollableWrapper>
        <div className="settings-section compact-settings-section">
          <WalkingOptionsSection
            walkSpeedOptions={config.defaultOptions.walkSpeed}
            walkReluctanceOptions={config.defaultOptions.walkReluctance}
            currentSettings={currentSettings}
            defaultSettings={defaultSettings}
          />
        </div>
        <div className="settings-section">
          {showModeSettings(config) && (
            <div className="settings-option-container">
              <TransportModesSection config={config} />
            </div>
          )}
          {config.minTransferTimeSelection && (
            <MinTransferTimeSection
              minTransferTimeOptions={config.minTransferTimeSelection}
              currentSettings={currentSettings}
              defaultSettings={defaultSettings}
            />
          )}
          <div className="settings-option-container">
            <TransferOptionsSection
              defaultSettings={defaultSettings}
              currentSettings={currentSettings}
              transferPenaltyHigh={config.transferPenaltyHigh}
            />
          </div>
        </div>
        {useCitybikes(config.vehicleRental?.networks, config) && (
          <div className="settings-section">
            <div className="settings-option-container">
              <fieldset>
                <legend className="settings-header transport-mode-subheader">
                  <FormattedMessage
                    id="citybike-network-headers"
                    defaultMessage={intl.formatMessage({
                      id: 'citybike-network-headers',
                      defaultMessage: 'Citybikes and scooters',
                    })}
                  />
                </legend>
                <div className="transport-modes-container">
                  <RentalNetworkSelector
                    currentOptions={getCitybikeNetworks(config) || []}
                    type={RentalNetworkType.CityBike}
                  />
                </div>
              </fieldset>
            </div>
          </div>
        )}
        <div className="settings-section">
          <div className="settings-option-container">
            <StreetModeSelectorPanel
              currentSettings={currentSettings}
              defaultSettings={defaultSettings}
            />
          </div>
        </div>
        <div className="settings-section">
          <div className="settings-option-container">
            <AccessibilityOptionSection currentSettings={currentSettings} />
          </div>
        </div>
        {config.showTicketSelector && (
          <div className="settings-section">
            <FareZoneSelector
              options={ticketOptions}
              currentOption={currentSettings.ticketTypes}
            />
          </div>
        )}
        {useScooters(config) && (
          <div className="settings-section">
            <div className="settings-option-container">
              <fieldset>
                <legend className="settings-header transport-mode-subheader">
                  <FormattedMessage
                    id="e-scooters"
                    defaultMessage={intl.formatMessage({
                      id: 'e-scooters',
                      defaultMessage: 'Scooters',
                    })}
                  />
                </legend>
                <div className="transport-modes-container">
                  {showEScooterDisclaimer && (
                    <div className="e-scooter-disclaimer">
                      <div className="disclaimer-header">
                        <FormattedMessage id="settings-e-scooter-routes" />
                        <div
                          className="disclaimer-close"
                          aria-label={intl.formatMessage({
                            id: 'e-scooter-disclaimer-close',
                            defaultMessage: 'close',
                          })}
                          tabIndex="0"
                          onKeyDown={e => {
                            if (
                              isKeyboardSelectionEvent(e) &&
                              (e.keyCode === 13 || e.keyCode === 32)
                            ) {
                              handleEScooterDisclaimerClose();
                            }
                          }}
                          onClick={handleEScooterDisclaimerClose}
                          role="button"
                        >
                          <Icon color="#333" img="icon_close" />
                        </div>
                      </div>
                      <div className="disclaimer-content">
                        <FormattedMessage
                          id="settings-e-scooter"
                          values={{
                            paymentInfo: (
                              <FormattedMessage id="payment-info-e-scooter" />
                            ),
                          }}
                        />
                      </div>
                      {config.vehicleRental.scooterInfoLink && (
                        <a
                          onClick={e => {
                            e.stopPropagation();
                          }}
                          className="external-link"
                          href={
                            config.vehicleRental.scooterInfoLink[intl.locale]
                              .url
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FormattedMessage id="read-more" />
                          <Icon img="icon_external-link-box" />
                        </a>
                      )}
                    </div>
                  )}
                  <ScooterNetworkSelector
                    currentOptions={getScooterNetworks(config) || []}
                    type={RentalNetworkType.Scooter}
                  />
                </div>
              </fieldset>
            </div>
          </div>
        )}
        {config.experimental?.allowFlexJourneys &&
          config.transportModes.taxi.availableForSelection && (
            <div className="settings-section">
              <div className="settings-option-container">
                <TaxiOptionsSection
                  defaultSettings={defaultSettings}
                  currentSettings={currentSettings}
                />
              </div>
            </div>
          )}
        <div className="settings-section background">
          <div className="settings-option-container restore-settings-container">
            <RestoreDefaultSettingSection config={config} />
          </div>
        </div>
      </ScrollableWrapper>
    </form>
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
