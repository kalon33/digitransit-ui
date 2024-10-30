import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import StopCode from '../StopCode';
import PlatformNumber from '../PlatformNumber';
import { getZoneLabel } from '../../util/legUtils';
import ZoneIcon from '../ZoneIcon';
import { legShape, configShape } from '../../util/shapes';

const NaviSecondaryInfo = ({ leg, show }, { config }) => {
  const { stop, rentalVehicle, vehicleParking, vehicleRentalStation, name } =
    leg.to;
  const { code, platformCode, vehicleMode, zoneId } = stop || {};

  const stopName = stop?.name || name;
  let destination;

  if (rentalVehicle) {
    destination = rentalVehicle.rentalNetwork.networkId;
  } else if (vehicleParking) {
    destination = vehicleParking.name;
  } else if (vehicleRentalStation) {
    destination = vehicleRentalStation.name;
  } else if (stopName) {
    destination = stopName;
  }

  if (!show) {
    return null;
  }
  return (
    <>
      <div className="secondary-divider" />
      <div className={`secondary ${show ? 'expanded' : ''}`}>
        <Icon img="navi-expand" className="icon-expand" />
        <Icon
          img={`icon-icon_${vehicleMode?.toLowerCase()}-stop-lollipop`}
          height={2}
          width={2}
          className="lollipop"
        />
        <div className="destination">
          {destination}
          <div className="details">
            {code && <StopCode code={code} />}
            {platformCode && (
              <PlatformNumber
                number={platformCode}
                short
                isRailOrSubway={
                  vehicleMode === 'RAIL' || vehicleMode === 'SUBWAY'
                }
              />
            )}
            <ZoneIcon
              zoneId={getZoneLabel(zoneId, config)}
              showUnknown={false}
            />
          </div>
        </div>
      </div>
    </>
  );
};

NaviSecondaryInfo.propTypes = {
  show: PropTypes.bool.isRequired,
  leg: legShape.isRequired,
};

NaviSecondaryInfo.contextTypes = {
  config: configShape.isRequired,
};

export default NaviSecondaryInfo;
