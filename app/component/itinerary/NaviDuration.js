import React, { useEffect, useState } from 'react';
import { intlShape } from 'react-intl';
import cx from 'classnames';
import { legShape, configShape } from '../../util/shapes';
import { displayDistance } from '../../util/geo-utils';
import { durationToString } from '../../util/timeUtils';

function NaviDuration({ leg }, { config, intl }) {
  const { distance, duration } = leg;
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 10000);
    return () => {
      setFadeOut(false);
      clearTimeout(timer);
    };
  }, [leg]);

  return (
    <div className="navileg-destination-details">
      {distance && duration && (
        <div className={cx('duration', fadeOut && 'fade-out')}>
          {durationToString(duration * 1000)} &nbsp; (
          {displayDistance(distance, config, intl.formatNumber)})
        </div>
      )}
    </div>
  );
}

NaviDuration.propTypes = {
  leg: legShape.isRequired,
};

NaviDuration.contextTypes = {
  intl: intlShape.isRequired,
  config: configShape.isRequired,
};

export default NaviDuration;
