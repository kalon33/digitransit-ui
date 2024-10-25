import React from 'react';
import PropTypes from 'prop-types';
import { legShape } from '../../util/shapes';
import Icon from '../Icon';
import { isRental } from '../../util/legUtils';
import NaviLegContent from './NaviLegContent';

const iconMap = {
  BICYCLE: 'icon-icon_cyclist',
  CAR: 'icon-icon_car-withoutBox',
  SCOOTER: 'icon-icon_scooter_rider',
  WALK: 'icon-icon_walk',
  WAIT: 'icon-icon_navigation_wait',
};

export default function NaviLeg({ leg, nextLeg, legType }) {
  const iconName = legType === 'wait' ? iconMap.WAIT : iconMap[leg.mode];
  let instructions = `navileg-${leg.mode.toLowerCase()}`;

  if (isRental(leg, nextLeg)) {
    if (leg.mode === 'WALK' && nextLeg?.mode === 'SCOOTER') {
      instructions = `navileg-rent-scooter`;
    } else {
      instructions = `navileg-rent-cycle`;
    }
  }
  return (
    <div className="navileg-goto">
      <Icon img={iconName} color="black" className="navileg-mode" />
      <div className="navileg-divider" />
      <div className="navileg-destination">
        <NaviLegContent
          leg={leg}
          nextLeg={nextLeg}
          instructions={instructions}
          legType={legType}
        />
      </div>
    </div>
  );
}

NaviLeg.propTypes = {
  leg: legShape.isRequired,
  nextLeg: legShape.isRequired,
  legType: PropTypes.string.isRequired,
};
