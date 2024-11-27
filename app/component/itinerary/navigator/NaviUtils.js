import React from 'react';
import { FormattedMessage } from 'react-intl';
import { legTime } from '../../../util/legUtils';
import { timeStr } from '../../../util/timeUtils';
import { getFaresFromLegs } from '../../../util/fareUtils';
import { ExtendedRouteTypes } from '../../../constants';
import { getItineraryPagePath } from '../../../util/path';

const TRANSFER_SLACK = 60000;
const DISPLAY_MESSAGE_THRESHOLD = 120 * 1000; // 2 minutes
function findTransferProblem(legs) {
  for (let i = 1; i < legs.length - 1; i++) {
    const prev = legs[i - 1];
    const leg = legs[i];
    const next = legs[i + 1];

    if (prev.transitLeg && leg.transitLeg && !leg.interlineWithPreviousLeg) {
      // transfer at a stop
      if (legTime(leg.start) - legTime(prev.end) < TRANSFER_SLACK) {
        return [prev, leg];
      }
    }

    if (prev.transitLeg && next.transitLeg && !leg.transitLeg) {
      // transfer with some walking
      const t1 = legTime(prev.end);
      const t2 = legTime(next.start);
      const transferDuration = legTime(leg.end) - legTime(leg.start);
      const slack = t2 - t1 - transferDuration;
      if (slack < TRANSFER_SLACK) {
        return [prev, next];
      }
    }
  }
  return null;
}
const getLocalizedMode = (mode, intl) => {
  return intl.formatMessage({
    id: `${mode.toLowerCase()}`,
    defaultMessage: `${mode}`,
  });
};
export function getFirstLastLegs(legs) {
  const first = legs[0];
  const last = legs[legs.length - 1];
  return { first, last };
}
export const getAdditionalMessages = (leg, time, intl, config, messages) => {
  const msgs = [];
  const ticketMsg = messages.get('ticket');
  if (!ticketMsg && legTime(leg.start) - time < DISPLAY_MESSAGE_THRESHOLD) {
    // Todo: multiple fares?
    const fare = getFaresFromLegs([leg], config)[0];
    msgs.push({
      severity: 'INFO',
      content: (
        <div className="navi-info-content">
          <FormattedMessage id="navigation-remember-ticket" />
          <span>
            {fare.ticketName} {fare.price} €
          </span>
        </div>
      ),
      id: 'ticket',
    });
  }
  return msgs;
};

export const getTransitLegState = (leg, intl, messages, time) => {
  const { start, realtimeState, from, mode, legId } = leg;
  const { scheduledTime, estimated } = start;
  if (mode === 'WALK') {
    return null;
  }
  const previousMessage = messages.get(legId);
  const prevSeverity = previousMessage ? previousMessage.severity : null;

  const late = estimated?.delay > DISPLAY_MESSAGE_THRESHOLD;
  const localizedMode = getLocalizedMode(mode, intl);
  let content;
  let severity;
  const isRealTime = realtimeState === 'UPDATED';

  if (late && prevSeverity !== 'ALERT') {
    // todo: Do this when design is ready.
    severity = 'ALERT';
    content = <div className="navi-info-content"> Kulkuneuvo on myöhässä </div>;
  } else if (
    !isRealTime &&
    prevSeverity !== 'WARNING' &&
    legTime(start) - time < DISPLAY_MESSAGE_THRESHOLD
  ) {
    severity = 'WARNING';
    content = (
      <div className="navi-info-content">
        <FormattedMessage id="navileg-mode-schedule" />
        <FormattedMessage
          id="navileg-start-schedule"
          values={{
            time: timeStr(scheduledTime),
            mode: localizedMode,
          }}
        />
      </div>
    );
  } else if (isRealTime && prevSeverity !== 'INFO') {
    const { parentStation, name } = from.stop;
    const stopOrStation = parentStation
      ? intl.formatMessage({ id: 'from-station' })
      : intl.formatMessage({ id: 'from-stop' });
    content = (
      <div className="navi-info-content">
        <FormattedMessage
          id="navileg-mode-realtime"
          values={{ mode: localizedMode }}
        />
        <FormattedMessage
          id="navileg-start-realtime"
          values={{
            time: timeStr(estimated.time),
            stopOrStation,
            stopName: name,
          }}
        />
      </div>
    );
    severity = 'INFO';
  }
  const state = severity
    ? { severity, content, id: legId, expiresOn: 'legChange' }
    : null;
  return state;
};

const onClick = (e, location, router) => {
  const f = getItineraryPagePath('POS', location.to);
  router.push(f);
};
// We'll need the intl later.
// eslint-disable-next-line no-unused-vars
export const getItineraryAlerts = (
  realTimeLegs,
  intl,
  messages,
  location,
  router,
) => {
  const alerts = [];
  const canceled = realTimeLegs.filter(leg => leg.realtimeState === 'CANCELED');
  const legAlerts =
    realTimeLegs.flatMap(leg => {
      return leg.alerts?.filter(alert => {
        const { first } = getFirstLastLegs(realTimeLegs);
        const startTime = legTime(first.start) / 1000;
        // show only alerts that are active when
        // the itinerary starts
        if (startTime < alert.effectiveStartDate) {
          return false;
        }
        return (
          alert.alertSeverityLevel === 'WARNING' ||
          alert.alertSeverityLevel === 'SEVERE'
        );
      });
    }) || [];

  const transferProblem = findTransferProblem(realTimeLegs);
  const late = realTimeLegs.filter(
    leg =>
      leg.start.estimated?.delay > DISPLAY_MESSAGE_THRESHOLD ||
      leg.start.estimated?.delay < -DISPLAY_MESSAGE_THRESHOLD,
  );
  const abortTrip = <FormattedMessage id="navigation-abort-trip" />;
  let content;
  const withShowRoutesBtn = children => (
    <div className="alt-btn">
      {children}
      <button
        className="show-options"
        type="button"
        onClick={e => onClick(e, location, router)}
      >
        <FormattedMessage id="settings-dropdown-open-label" />
      </button>
    </div>
  );
  if (legAlerts.length > 0) {
    legAlerts.forEach(alert => {
      content = (
        <div className="notifiler">
          <span className="header"> {alert.alertHeaderText}</span>
        </div>
      );
      if (!messages.get(alert.id)) {
        alerts.push({
          severity: 'ALERT',
          content,
          id: alert.id,
        });
      }
    });
  }
  // todo no current design
  if (canceled.length > 0) {
    // show routes button only for first canceled leg.
    canceled.forEach((leg, i) => {
      const { legId, mode, route } = leg;

      const lMode = getLocalizedMode(mode, intl);
      const routeName = `${lMode} ${route.shortName}`;
      const m = (
        <FormattedMessage
          id="navigation-mode-canceled"
          values={{ routeName }}
        />
      );
      if (i === 0) {
        content = withShowRoutesBtn(
          <div className="notifiler">
            {m}
            {abortTrip}
          </div>,
        );
      } else {
        content = <div className="notifiler">{m}</div>;
      }
      if (!messages.get(`canceled-${legId}`)) {
        alerts.push({
          severity: 'ALERT',
          content,
          id: `canceled-${legId}`,
        });
      }
    });
  }

  if (transferProblem !== null) {
    const transferId = `transfer-${transferProblem[0].legId}-${transferProblem[1].legId}}`;
    if (!messages.get(transferId)) {
      content = withShowRoutesBtn(
        <div className="notifiler">
          <span>{`Vaihto ${transferProblem[0].route.shortName} - ${transferProblem[1].route.shortName} ei onnistu`}</span>
          {abortTrip}
        </div>,
      );
      alerts.push({
        severity: 'ALERT',
        content,
        id: transferId,
      });
    }
  }
  if (late.length && !messages.get(late.legId)) {
    // Todo: No current design
    // Todo add mode and delay time to this message
    late.forEach(leg => {
      const { legId, mode, route } = leg;
      const lMode = getLocalizedMode(mode, intl);
      const routeName = `${lMode} ${route.shortName}`;

      content = (
        <div className="notifiler">
          <FormattedMessage id="navigation-mode-late" values={{ routeName }} />
        </div>
      );
      alerts.push({
        severity: 'WARNING',
        content,
        id: `late-${legId}`,
      });
    });
  }

  return alerts;
};

/*
 * Get the properties of the destination based on the leg.
 *
 */
export const getDestinationProperties = (
  rentalVehicle,
  vehicleParking,
  vehicleRentalStation,
  stop,
  config,
) => {
  const { routes, vehicleMode } = stop;
  let destination = {};
  let mode = vehicleMode;
  if (routes && vehicleMode === 'BUS' && config.useExtendedRouteTypes) {
    if (routes.some(p => p.type === ExtendedRouteTypes.BusExpress)) {
      mode = 'bus-express';
    }
  } else if (routes && vehicleMode === 'TRAM' && config.useExtendedRouteTypes) {
    if (routes.some(p => p.type === ExtendedRouteTypes.SpeedTram)) {
      mode = 'speedtram';
    }
  }
  // todo: scooter and citybike icons etc.
  if (rentalVehicle) {
    destination.name = rentalVehicle.rentalNetwork.networkId;
  } else if (vehicleParking) {
    destination.name = vehicleParking.name;
  } else if (vehicleRentalStation) {
    destination.name = vehicleRentalStation.name;
  } else {
    let iconProps = {};
    switch (mode) {
      case 'TRAM,BUS':
        iconProps = {
          iconId: 'icon-icon_bustram-stop-lollipop',
          className: 'tram-stop',
        };
        break;
      case 'SUBWAY':
        iconProps = {
          iconId: 'icon-icon_subway',
          className: 'subway-stop',
        };
        break;
      case 'RAIL':
        iconProps = {
          iconId: 'icon-icon_rail-stop-lollipop',
          className: 'rail-stop',
        };

        break;
      case 'FERRY':
        iconProps = {
          iconId: 'icon-icon_ferry',
          className: 'ferry-stop',
        };
        break;
      case 'bus-express':
        iconProps = {
          iconId: 'icon-icon_bus-stop-express-lollipop',
          className: 'bus-stop',
        };
        break;
      case 'speedtram':
        iconProps = {
          iconId: 'icon-icon_speedtram-stop-lollipop',
          className: 'speedtram-stop',
        };
        break;
      default:
        iconProps = {
          iconId: `icon-icon_${mode.toLowerCase()}-stop-lollipop`,
        };
    }
    destination = {
      ...iconProps,
      name: stop.name,
    };
  }

  return destination;
};

export const LEGTYPE = {
  WAIT: 'WAIT',
  MOVE: 'MOVE',
  TRANSIT: 'TRANSIT',
  PENDING: 'PENDING',
  END: 'END',
};
