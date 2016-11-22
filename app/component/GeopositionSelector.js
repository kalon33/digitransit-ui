import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage } from 'react-intl';

import { startLocationWatch } from '../action/PositionActions';
import PositionStore from '../store/PositionStore';
import Icon from './Icon';

const GeopositionSelector = ({ status }) => {
  /* States:
   * - locationing hasn't been started
   * . locationing in progress
   * . locationing denied
   * . locationing failed
   * - locationing succeeded
   */
  if (status === PositionStore.STATUS_NO_LOCATION) {
    return (
      <div>
        <span id="splash-text-block">
          <FormattedMessage
            id="splash-please-allow-positioning"
            defaultMessage="The service works best if you use positioning."
          /></span>
        <span
          id="splash-locationing-button"
          onClick={() => context.executeAction(startLocationWatch)}
        >
          <Icon className="icon-positioning" img="icon-icon_position" />
          <FormattedMessage
            id="splash-use-positioning"
            defaultMessage="Use positioning"
          />
        </span>
      </div>
    );
  } else if (status === PositionStore.STATUS_SEARCHING_LOCATION) {
    return (
      <div id="geoposition-selector">
        <div className="spinner-loader" />
        <div className="spinner-caption">
          <FormattedMessage id="splash-locating" defaultMessage="Positioning..." />…
        </div>
      </div>);
  } else if (status === PositionStore.STATUS_GEOLOCATION_DENIED) {
    return (<div id="splash-positioning-message"><FormattedMessage
      id="splash-geolocation-denied-message"
      defaultMessage="Positioning is not allowed. Please check the settings of your browser."
    /></div>);
  } else if (status === PositionStore.STATUS_GEOLOCATION_WATCH_TIMEOUT) {
    return (<div id="splash-positioning-message"><FormattedMessage
      id="splash-geolocation-watch-timeout-message"
      defaultMessage="Positioning is taking longer than expected. Choose origin below or try again later."
    /></div>);
  } else if (status === PositionStore.STATUS_GEOLOCATION_NOT_SUPPORTED) {
    return (<div id="splash-positioning-message"><FormattedMessage
      id="splash-geolocation-not-supported-message"
      defaultMessage="Your browser does not support Positioning."
    /></div>);
  } else if (status === PositionStore.STATUS_GEOLOCATION_PROMPT) {
    return (<div id="splash-positioning-message"><FormattedMessage
      id="splash-geolocation-prompt-message"
      defaultMessage="Please accept the positioning request."
    /></div>);
  }
  return null;
};

GeopositionSelector.propTypes = {
  status: React.PropTypes.string.isRequired,
};

GeopositionSelector.contextTypes = {
  executeAction: React.PropTypes.func.isRequired,
};

export default connectToStores(
  GeopositionSelector,
  ['PositionStore'],
  context => (
    { status: context.getStore('PositionStore').getLocationState().status }
  ));
