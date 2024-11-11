import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from '../Icon';
import StopCode from '../StopCode';
import PlatformNumber from '../PlatformNumber';
import { getZoneLabel } from '../../util/legUtils';
import ZoneIcon from '../ZoneIcon';
import { legShape, configShape } from '../../util/shapes';
import { getDestinationProperties } from './NaviUtils';
import RouteNumberContainer from '../RouteNumberContainer';

const NaviCardExtension = ({ legType, leg }, { config }) => {
  const { stop, name } = leg.to;
  const { code, platformCode, zoneId, vehicleMode } = stop || {};
  const [place, address] = name?.split(/, (.+)/) || [];

  let destination = {};
  if (stop) {
    destination = getDestinationProperties(leg, stop, config);
    destination.name = stop.name;
  } else {
    destination.iconId = 'icon-icon_mapMarker-to';
    destination.className = 'place';
    destination.name = place;
  }
  // todo translationID ei toimi
  if (legType === 'in-transit') {
    const arrivalTimes =
      leg.intermediatePlaces?.map(
        p =>
          new Date(p.arrival.estimated?.time) ||
          new Date(p.arrival.scheduledTime),
      ) || [];

    const now = new Date();
    const idx = arrivalTimes.findIndex(d => d.getTime() > now.getTime());
    const count = arrivalTimes.length - idx;
    const nrStopsRemaining = <span className="realtime"> {count}</span>;
    const translationId =
      count === 1 ? 'navileg-one-stop-remaining' : 'navileg-stops-remaining';
    return (
      <div className="secondary-info">
        <div className="secondary-divider" />
        <div className="secondary-vehicle">
          <RouteNumberContainer
            className={cx('line', vehicleMode.toLowerCase())}
            route={leg.route}
            mode={leg.mode.toLowerCase()}
            isTransitLeg
            vertical
            withBar
          />
          <div className="info">{leg.to.name}</div>
        </div>
        <div className="remaining">
          <FormattedMessage
            id={translationId}
            values={{ nrStopsRemaining }}
            defaultMessage="{nrStopsRemaining} stops remaining"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="secondary-info">
      <div className="secondary-divider" />
      <div className="secondary-content">
        <Icon img="navi-expand" className="icon-expand" />
        <Icon
          img={destination.iconId}
          height={2}
          width={2}
          className={`destination-icon ${destination.className}`}
        />
        <div className="destination">
          {destination.name}
          <div className="details">
            {!stop && address && <div className="address">{address}</div>}
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
    </div>
  );
};

NaviCardExtension.propTypes = {
  leg: legShape.isRequired,
  legType: PropTypes.string,
};

NaviCardExtension.defaultProps = {
  legType: '',
};

NaviCardExtension.contextTypes = {
  config: configShape.isRequired,
};

export default NaviCardExtension;
