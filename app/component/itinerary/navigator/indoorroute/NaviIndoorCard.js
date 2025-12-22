import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { configShape, legShape } from '../../../../util/shapes';
import { getIndoorStepsWithVerticalTransportationUse } from '../../../../util/indoorUtils';
import NaviIndoorRouteButton from './NaviIndoorRouteButton';
import NaviIndoorRouteContainer from './NaviIndoorRouteContainer';

function NaviIndoorCard({
  showIndoorRoute,
  toggleShowIndoorRoute,
  previousLeg,
  leg,
  nextLeg,
  focusToPoint,
}) {
  const indoorRouteSteps = getIndoorStepsWithVerticalTransportationUse(
    previousLeg,
    leg,
    nextLeg,
  );
  return (
    <div className={cx('extension', 'no-vertical-margin')}>
      <div className="extension-divider" />
      <div className="extension-indoor-route-button">
        <NaviIndoorRouteButton
          showIndoorRoute={showIndoorRoute}
          toggleShowIndoorRoute={toggleShowIndoorRoute}
        />
      </div>
      <div className="extension-divider" />
      <div className="extension-indoor-route-container">
        <NaviIndoorRouteContainer
          focusToPoint={focusToPoint}
          indoorRouteSteps={indoorRouteSteps}
        />
      </div>
    </div>
  );
}

NaviIndoorCard.propTypes = {
  showIndoorRoute: PropTypes.bool,
  toggleShowIndoorRoute: PropTypes.func.isRequired,
  focusToPoint: PropTypes.func.isRequired,
  previousLeg: legShape,
  leg: legShape,
  nextLeg: legShape,
};

NaviIndoorCard.defaultProps = {
  showIndoorRoute: false,
  previousLeg: undefined,
  leg: undefined,
  nextLeg: undefined,
};

NaviIndoorCard.contextTypes = {
  config: configShape.isRequired,
};

export default NaviIndoorCard;
