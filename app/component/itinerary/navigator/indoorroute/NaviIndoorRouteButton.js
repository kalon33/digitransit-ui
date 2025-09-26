import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import Icon from '../../../Icon';
import { isKeyboardSelectionEvent } from '../../../../util/browser';

export default function NaviIndoorRouteButton({
  showIndoorRoute,
  toggleShowIndoorRoute,
}) {
  return (
    <div
      role="button"
      tabIndex="0"
      className={cx('indoor-route-container-clickable', 'cursor-pointer')}
      onClick={e => {
        e.stopPropagation();
        toggleShowIndoorRoute();
      }}
      onKeyPress={e => {
        if (isKeyboardSelectionEvent(e)) {
          e.stopPropagation();
          toggleShowIndoorRoute();
        }
      }}
    >
      {showIndoorRoute ? (
        <>
          <div className="indoor-route-arrow-icon">
            <Icon img="icon_arrow-collapse--right" className="open" />
          </div>
          <div className="indoor-route-text">
            <FormattedMessage
              id="itinerary-hide-indoor-route"
              defaultMessage="Hide indoor route"
            />
          </div>
        </>
      ) : (
        <>
          <div className="indoor-route-text">
            <FormattedMessage
              id="itinerary-indoor-route"
              defaultMessage="Indoor route"
            />
          </div>
          <div className="indoor-route-arrow-icon">
            <Icon img="icon_arrow-collapse--right" />
          </div>
        </>
      )}
    </div>
  );
}

NaviIndoorRouteButton.propTypes = {
  showIndoorRoute: PropTypes.bool,
  toggleShowIndoorRoute: PropTypes.func.isRequired,
};
NaviIndoorRouteButton.defaultProps = {
  showIndoorRoute: false,
};
