import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import SettingsToggle from './SettingsToggle';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import Icon from '../../Icon';
import {
  mapDefaultNetworkProperties,
  getRentalNetworkName,
  getRentalNetworkConfig,
  updateVehicleNetworks,
  getCitybikeNetworks,
} from '../../../util/vehicleRentalUtils';
import { TransportMode } from '../../../constants';
import { useConfigContext } from '../../../configurations/ConfigContext';

// eslint-disable-next-line
export default function CityBikes({}, { executeAction }) {
  const config = useConfigContext();
  const currentOptions = getCitybikeNetworks(config);
  const networks = mapDefaultNetworkProperties(config).filter(
    network => network.type === TransportMode.Citybike.toLowerCase(),
  );
  const last = networks.length ? networks[networks.length - 1] : undefined;
  return (
    <>
      <div className="section-header">
        <FormattedMessage id="citybike-network-headers" />
      </div>
      {networks.map(network => (
        <SettingsToggle
          label={getRentalNetworkName(
            getRentalNetworkConfig(network.networkName, config),
            config.language,
          )}
          key={`settings-toggle-bike-${network.networkName}`}
          id={`settings-toggle-bike-${network.networkName}`}
          leftElement={
            <Icon
              className={`${network.icon}-icon`}
              img={`icon_${network.icon}`}
              height={2}
              width={2}
            />
          }
          toggled={
            !!currentOptions &&
            currentOptions.filter(
              option =>
                option.toLowerCase() === network.networkName.toLowerCase(),
            ).length > 0
          }
          onToggle={() => {
            const newNetworks = updateVehicleNetworks(
              getCitybikeNetworks(config),
              network.networkName,
              network.type,
            );
            const newSettings = {
              allowedBikeRentalNetworks: newNetworks,
            };
            executeAction(saveRoutingSettings, newSettings);
          }}
          borderStyle={network === last ? '' : 'bottom-border'}
        />
      ))}
    </>
  );
}

CityBikes.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};
