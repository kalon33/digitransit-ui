import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { displayDistance } from '../../../util/geo-utils';
import { legShape, configShape } from '../../../util/shapes';
import { legDestination, legTimeStr, legTime } from '../../../util/legUtils';
import {
  LEGTYPE,
  getLocalizedMode,
  getToLocalizedMode,
  withRealTime,
} from './NaviUtils';
import { getRouteMode } from '../../../util/modeUtils';
import NaviBoardingInfo from './NaviBoardingInfo';
import Duration from '../Duration';

function getBoardingParams(leg, time, config) {
  if (!leg?.transitLeg) {
    return {};
  }
  const { headsign, route, start } = leg;
  const hs = headsign || leg.trip?.tripHeadsign;

  const remainingDuration = <Duration duration={legTime(start) - time} />;
  const rt = leg.realtimeState === 'UPDATED';
  const values = {
    duration: withRealTime(rt, remainingDuration),
    legTime: withRealTime(rt, legTimeStr(start)),
  };
  const routeMode = getRouteMode(route, config);
  return { routeMode, route, hs, values };
}

export default function NaviInstructions(
  { leg, nextLeg, instructions, legType, time, position, tailLength },
  { intl, config },
) {
  const { routeMode, route, hs, values } = getBoardingParams(
    nextLeg,
    time,
    config,
  );
  if (legType === LEGTYPE.MOVE) {
    return (
      <>
        <div className="notification-header navi-header-chain">
          <FormattedMessage id={instructions} defaultMessage="Go to" />
          &nbsp;
          {legDestination(intl, leg, null, nextLeg)}
          &nbsp;
          <span className={cx({ realtime: !!position })}>
            {displayDistance(tailLength, config, intl.formatNumber)}&nbsp;
          </span>
          {nextLeg?.transitLeg && (
            <FormattedMessage id="navileg-hop-on" defaultMessage="by" />
          )}
        </div>
        {nextLeg?.transitLeg && (
          <NaviBoardingInfo
            route={route}
            mode={routeMode}
            headsign={hs}
            translationValues={values}
            compact
          />
        )}
      </>
    );
  }

  if (legType === LEGTYPE.WAIT && nextLeg?.transitLeg) {
    const { mode } = nextLeg;
    return (
      <>
        <div className="notification-header">
          <FormattedMessage
            id="navigation-get-mode"
            values={{ mode: getToLocalizedMode(mode, intl) }}
            defaultMessage="Get on the {mode}"
          />
        </div>
        <NaviBoardingInfo
          route={route}
          mode={routeMode}
          headsign={hs}
          translationValues={values}
        />
      </>
    );
  }

  if (legType === LEGTYPE.WAIT_IN_VEHICLE) {
    const totalWait = <Duration duration={legTime(nextLeg.start) - time} />;
    return (
      <>
        <div className="notification-header">
          <FormattedMessage
            id="wait-in-vehicle"
            defaultMessage="Wait in the vehicle"
          />
        </div>
        <div className="wait-leg">
          <FormattedMessage
            id="navigation-interline-resume"
            values={{
              duration: withRealTime(
                nextLeg.realtimeState === 'UPDATED',
                totalWait,
              ),
            }}
          />
        </div>
      </>
    );
  }

  if (legType === LEGTYPE.TRANSIT) {
    const rt = leg.realtimeState === 'UPDATED';
    const t = legTime(leg.end);

    const destId = // eslint-disable-next-line no-nested-ternary
      leg.mode === 'FERRY'
        ? 'navileg-at-ferrypier'
        : leg.to.stop.parentStation
          ? 'navileg-at-station'
          : 'navileg-at-stop';
    const stopOrStation = intl.formatMessage({ id: destId });

    const remainingDuration = <Duration duration={t - time} />;
    const values2 = {
      stopOrStation,
      stop: leg.to.stop.name,
      duration: withRealTime(rt, remainingDuration),
      legTime: withRealTime(rt, legTimeStr(leg.end)),
    };

    const translationId = nextLeg?.interlineWithPreviousLeg
      ? 'navileg-in-transit-interline'
      : 'navileg-leave-at';

    return (
      <>
        <div className="notification-header">
          <FormattedMessage
            id={instructions}
            defaultMessage="{mode}trip"
            values={{ mode: getLocalizedMode(leg.mode, intl) }}
          />
        </div>
        <div className="vehicle-leg">
          <FormattedMessage
            id={translationId}
            defaultMessage="leave from the vehicle at stop {stop} in {duration} minutes at {legTime}"
            values={values2}
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
  tailLength: PropTypes.number.isRequired,
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
