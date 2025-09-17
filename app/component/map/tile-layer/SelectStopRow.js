import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import { FormattedMessage } from 'react-intl';
import Icon from '../../Icon';
import { PREFIX_TERMINALS, PREFIX_STOPS } from '../../../util/path';
import { ExtendedRouteTypes } from '../../../constants';
import { popupColorShape } from '../../../util/shapes';

function isNull(val) {
  return val === 'null' || val === undefined || val === null;
}

function SelectStopRow(
  { code, type, desc, gtfsId, name, terminal, colors, routes, platform },
  { config },
) {
  let mode = type.toLowerCase();
  if (routes && mode === 'bus' && config.useExtendedRouteTypes) {
    const routesArray = JSON.parse(routes);
    if (routesArray.some(p => p.gtfsType === ExtendedRouteTypes.BusExpress)) {
      mode = 'bus-express';
    }
  } else if (routes && mode === 'tram' && config.useExtendedRouteTypes) {
    const routesArray = JSON.parse(routes);
    if (routesArray.some(p => p.gtfsType === ExtendedRouteTypes.SpeedTram)) {
      mode = 'speedtram';
    }
  }
  const iconOptions = {};
  switch (mode) {
    case 'tram':
    case 'rail':
    case 'bus':
      iconOptions.iconId = terminal
        ? `icon-icon_${mode}`
        : `icon-icon_${mode}-lollipop`;
      break;
    case 'bus-express':
      iconOptions.iconId = terminal
        ? 'icon-icon_bus'
        : 'icon-icon_bus-express-lollipop';
      break;
    case 'subway':
    case 'airplane':
      iconOptions.iconId = `icon-icon_${mode}`;
      break;
    case 'ferry':
      iconOptions.iconId = !isNull(code)
        ? 'icon-icon_ferry'
        : 'icon-icon_ferry-lollipop';
      if (iconOptions.iconId === 'icon-icon_ferry-lollipop' && colors) {
        iconOptions.color = colors.iconColors['mode-ferry-pier'];
      }
      break;
    default:
      iconOptions.iconId = `icon-icon_${mode}-lollipop`;
      break;
  }
  iconOptions.className = `${mode.toLowerCase()}`;

  const showDesc = desc && desc !== 'null';
  const showCode = code && code !== 'null';

  const prefix = terminal ? PREFIX_TERMINALS : PREFIX_STOPS;
  return (
    <Link
      className="stop-popup-choose-row"
      to={`/${prefix}/${encodeURIComponent(gtfsId)}`}
    >
      <span className="choose-row-left-column" aria-hidden="true">
        <Icon
          className={iconOptions.className}
          img={iconOptions.iconId}
          color={iconOptions.color || null}
        />
      </span>
      <span className="choose-row-center-column">
        <h5 className="choose-row-header">{name}</h5>
        <div
          className={`choose-row-info-row ${platform ? 'small-margin' : ''}`}
        >
          {(showDesc || showCode) && (
            <span className="choose-row-text">
              {showDesc && <span className="choose-row-address">{desc}</span>}
              {showCode && <span className="choose-row-number">{code}</span>}
            </span>
          )}
        </div>
        <div className="choose-row-info-row small-margin">
          {platform && (
            <span className="choose-row-text">
              <span className="choose-row-platform">
                <FormattedMessage id="platform" defaultMessage="platform" />
              </span>
              <span className="platform-number-wrapper">{platform}</span>
            </span>
          )}
        </div>
      </span>
      <span className="choose-row-right-column">
        <Icon img="icon-icon_arrow-collapse--right" />
      </span>
    </Link>
  );
}

SelectStopRow.displayName = 'SelectStopRow';

SelectStopRow.propTypes = {
  gtfsId: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  routes: PropTypes.string,
  code: PropTypes.string,
  desc: PropTypes.string,
  terminal: PropTypes.bool,
  colors: popupColorShape,
  platform: PropTypes.string,
};

SelectStopRow.defaultProps = {
  routes: undefined,
  code: undefined,
  desc: undefined,
  terminal: undefined,
  colors: undefined,
  platform: undefined,
};

SelectStopRow.contextTypes = {
  config: PropTypes.shape({
    useExtendedRouteTypes: PropTypes.bool.isRequired,
  }).isRequired,
};

export default SelectStopRow;
