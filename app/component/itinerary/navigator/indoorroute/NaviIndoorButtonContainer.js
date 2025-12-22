import PropTypes from 'prop-types';
import React from 'react';
import Icon from '../../../Icon';
import { legShape } from '../../../../util/shapes';
import {
  getIndoorStepsWithVerticalTransportationUse,
  getStepFocusAction,
} from '../../../../util/indoorUtils';
import NaviIndoorRouteStepInfo from './NaviIndoorRouteStepInfo';
import NaviIndoorRouteButton from './NaviIndoorRouteButton';

export default function NaviIndoorButtonContainer({
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
  if (indoorRouteSteps.length === 1) {
    return (
      <div className="navi-indoor-route-one-step-info-container">
        <Icon img="navi-expand" className="icon-expand-small" />
        <NaviIndoorRouteStepInfo
          // eslint-disable-next-line no-underscore-dangle
          type={indoorRouteSteps[0].feature?.__typename}
          verticalDirection={indoorRouteSteps[0].feature?.verticalDirection}
          toLevelName={indoorRouteSteps[0].feature?.to?.name}
          focusAction={getStepFocusAction(
            indoorRouteSteps[0].lat,
            indoorRouteSteps[0].lon,
            focusToPoint,
          )}
        />
      </div>
    );
  }
  if (indoorRouteSteps.length > 1) {
    return (
      <NaviIndoorRouteButton
        showIndoorRoute={showIndoorRoute}
        toggleShowIndoorRoute={toggleShowIndoorRoute}
      />
    );
  }
  return null;
}

NaviIndoorButtonContainer.propTypes = {
  showIndoorRoute: PropTypes.bool,
  toggleShowIndoorRoute: PropTypes.func.isRequired,
  previousLeg: legShape,
  leg: legShape,
  nextLeg: legShape,
  focusToPoint: PropTypes.func.isRequired,
};

NaviIndoorButtonContainer.defaultProps = {
  showIndoorRoute: false,
  previousLeg: undefined,
  leg: undefined,
  nextLeg: undefined,
};
