import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { GeodeticToEnu, displayDistance } from '../../../util/geo-utils';
import { legShape, configShape } from '../../../util/shapes';
import { legDestination, legTimeStr, legTime } from '../../../util/legUtils';
import RouteNumber from '../../RouteNumber';
import { LEGTYPE, getLocalizedMode, pathProgress } from './NaviUtils';
import { durationToString } from '../../../util/timeUtils';

export default function NaviInstructions(
  { leg, nextLeg, instructions, legType, time, position, origin },
  { intl, config },
) {
  const withRealTime = (rt, children) => (
    <span className={cx('bold', { realtime: rt })}>{children}</span>
  );

  if (legType === LEGTYPE.MOVE) {
    let remainingTraversal;
    let rtDuration;
    if (position) {
      // TODO: maybe apply only when distance is close enough to the path
      const posXY = GeodeticToEnu(position.lat, position.lon, origin);
      const { traversed } = pathProgress(posXY, leg.geometry);
      remainingTraversal = 1.0 - traversed;
      rtDuration = true;
    } else {
      // estimate from elapsed time
      remainingTraversal = Math.max(
        (legTime(leg.end) - time) / (leg.duration * 1000),
        0,
      );
    }
    const duration = leg.duration * remainingTraversal;
    const distance = leg.distance * remainingTraversal;

    return (
      <>
        <div className="destination-header">
          <FormattedMessage id={instructions} defaultMessage="Go to" />
          &nbsp;
          {legDestination(intl, leg, null, nextLeg)}
        </div>

        <div className={cx('duration', { realtime: rtDuration })}>
          {displayDistance(distance, config, intl.formatNumber)} (
          {durationToString(duration * 1000)})
        </div>
      </>
    );
  }
  if (legType === LEGTYPE.WAIT && nextLeg.mode !== 'WALK') {
    const { mode, headsign, route, start } = nextLeg;
    const hs = headsign || nextLeg.trip?.tripHeadsign;
    const color = route.color || 'currentColor';
    const localizedMode = getLocalizedMode(mode, intl);

    const remainingDuration = Math.ceil((legTime(start) - time) / 60000); // ms to minutes
    const rt = nextLeg.realtimeState === 'UPDATED';
    const values = {
      duration: withRealTime(rt, remainingDuration),
      legTime: withRealTime(rt, legTimeStr(start)),
    };
    return (
      <>
        <div className="destination-header">
          <FormattedMessage
            id="navigation-wait-mode"
            values={{ mode: localizedMode }}
            defaultMessage="Wait for {mode}"
          />
        </div>
        <div className="wait-leg">
          <div className="route-info">
            <RouteNumber
              mode={mode.toLowerCase()}
              text={route?.shortName}
              withBar
              isTransitLeg
              color={color}
            />
            <div className="headsign">{hs}</div>
          </div>
          <div className="wait-duration">
            <FormattedMessage
              id="navileg-arrive-at"
              defaultMessage="{duration} min päästä klo {legTime}"
              values={values}
            />
          </div>
        </div>
      </>
    );
  }

  if (legType === LEGTYPE.TRANSIT) {
    const rt = leg.realtimeState === 'UPDATED';

    const t = legTime(leg.end);
    const stopOrStation = leg.to.stop.parentStation
      ? intl.formatMessage({ id: 'navileg-from-station' })
      : intl.formatMessage({ id: 'navileg-from-stop' });
    const localizedMode = getLocalizedMode(leg.mode, intl);

    const remainingDuration = Math.ceil((t - time) / 60000); // ms to minutes
    const values = {
      stopOrStation,
      stop: leg.to.stop.name,
      duration: withRealTime(rt, remainingDuration),
      legTime: withRealTime(rt, legTimeStr(leg.end)),
    };

    return (
      <>
        <div className="destination-header">
          <FormattedMessage
            id={instructions}
            defaultMessage="{mode}trip"
            values={{ mode: localizedMode }}
          />
        </div>
        <div className="vehicle-leg">
          <FormattedMessage
            id="navileg-leave-at"
            defaultMessage="leave from the vehicle at stop {stop} in {duration} minutes at {legTime}"
            values={values}
          />
        </div>
      </>
    );
  }
  return null;
}

NaviInstructions.propTypes = {
  leg: legShape,
  nextLeg: legShape,
  instructions: PropTypes.string.isRequired,
  legType: PropTypes.string,
  time: PropTypes.number.isRequired,
  position: PropTypes.shape({
    lat: PropTypes.number,
    lon: PropTypes.number,
  }),
  origin: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
};

NaviInstructions.defaultProps = {
  legType: '',
  leg: undefined,
  nextLeg: undefined,
  position: undefined,
};
NaviInstructions.contextTypes = {
  intl: intlShape.isRequired,
  config: configShape.isRequired,
};
