import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'react-intl';
import { itineraryShape, legShape, configShape } from '../../util/shapes';
import { legTime, legTimeStr } from '../../util/legUtils';
import NaviLeg from './NaviLeg';
import Icon from '../Icon';
import NaviStack from './NaviStack';
import { timeStr } from '../../util/timeUtils';

const TRANSFER_SLACK = 60000;

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

const generateStackMessage = (severity, content, id) => {
  switch (severity) {
    case 'INFO':
      return {
        content,
        backgroundColor: '#E5F2FA',
        iconColor: '#0074BF',
        iconId: 'icon-icon_info',
        id,
      };
    case 'WARNING':
      return {
        content,
        backgroundColor: '#FFF8E8',
        iconColor: '#FED100',
        iconId: 'icon-icon_attention',
        id,
      };
    case 'ALERT':
      return {
        content,
        backgroundColor: '#FDF3F6',
        iconColor: '#DC0451',
        iconId: 'icon-icon_caution_white_exclamation',
        id,
      };
    default:
      return null;
  }
};

const getScheduleInfo = (nextLeg, intl) => {
  const { start, realtimeState, to, from, mode, id } = nextLeg;
  const { scheduledTime, estimated } = start;
  if (mode === 'WALK') {
    return null;
  }

  const time = estimated?.time || scheduledTime;
  let msgId = id || `${mode.toLowerCase()}-${time}`;

  const late = estimated?.delay > 0;
  const localizedMode = intl.formatMessage({
    id: `${mode.toLowerCase()}`,
    defaultMessage: `${mode}`,
  });
  let content;
  let severity;
  if (mode === 'BICYCLE' && from.vehicleRentalStation) {
    const bikes = from.vehicleRentalStation.availableVehicles?.total;
    msgId += `-${bikes}`;
    content = (
      <div className="navi-info-content">
        <FormattedMessage
          id="navileg-mode-citybike"
          values={{ available: bikes }}
        />
      </div>
    );
    severity = 'INFO';
  } else if (late) {
    // todo: Do this when design is ready.
    severity = 'ALERT';
    content = <div className="navi-info-content"> Kulkuneuvo on myöhässä </div>;
  } else if (!realtimeState || realtimeState !== 'UPDATED') {
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
  } else if (nextLeg.transitLeg) {
    const { parentStation, name } = to.stop;

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
  const info = generateStackMessage(severity, content, msgId);
  // Only one main info, first in stack.
  info.type = 'main';
  return info;
};

// We'll need the intl later.
// eslint-disable-next-line no-unused-vars
const getAlerts = (realTimeLegs, intl) => {
  const alerts = [];
  const canceled = realTimeLegs.filter(leg => leg.realtimeState === 'CANCELED');
  const transferProblem = findTransferProblem(realTimeLegs);
  const late = realTimeLegs.filter(leg => leg.start.estimate?.delay > 0);
  let content;
  const id = 'alert-todo-proper-id';
  if (canceled.length > 0) {
    content = <div className="notifiler">Osa matkan lähdöistä on peruttu</div>;
    // Todo: No current design
    // todo find modes that are canceled
    alerts.push({
      ...generateStackMessage('ALERT', content, id),
    });
  }

  if (transferProblem !== null) {
    // todo no current design
    content = (
      <div className="notifiler">{`Vaihto ${transferProblem[0].route.shortName} - ${transferProblem[1].route.shortName} ei onnistu reittisuunnitelman mukaisesti`}</div>
    );

    alerts.push({
      ...generateStackMessage('ALERT', content, id),
    });
  }
  if (late.length) {
    // Todo: No current design
    // Todo add mode and delay time to this message
    content = <div className="notifiler">Kulkuneuvo on myöhässä</div>;
    alerts.push({
      ...generateStackMessage('WARNING', content, id),
    });
  }

  return alerts;
};

function NaviTop(
  { itinerary, focusToLeg, time, realTimeLegs },
  { intl, config },
) {
  const [currentLeg, setCurrentLeg] = useState(null);
  const [show, setShow] = useState(true);
  // All notifications including those user has dismissed.
  const [notifications, setNotifications] = useState([]);
  // notifications that are shown to the user.
  const [displayNotifs, setdisplayNotifs] = useState([]);

  const handleClick = () => {
    setShow(!show);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);
  let nextLeg;
  useEffect(() => {
    const newLeg = realTimeLegs.find(leg => {
      return legTime(leg.start) <= time && time <= legTime(leg.end);
    });

    const notifs = [];
    const isSame = newLeg?.id
      ? newLeg.id === currentLeg?.id
      : currentLeg?.mode === newLeg?.mode;
    const l = currentLeg || newLeg;
    if (l) {
      nextLeg = itinerary.legs.find(
        leg => legTime(leg.start) > legTime(l.start),
      );
      if (nextLeg) {
        const i = getScheduleInfo(nextLeg, intl);
        if (i) {
          const found = notifications.find(n => n.id === i.id);
          if (!found) {
            notifs.push(i);
          }
        }
      }
      let currentNots = displayNotifs;
      if (!isSame) {
        // remove Old main notification when new leg is started.
        currentNots = currentNots.filter(n => n.type !== 'main');
        if (newLeg) {
          focusToLeg(newLeg, false);
          setCurrentLeg(newLeg);
        }
        const problems = getAlerts(realTimeLegs, intl);
        if (problems.length > 0) {
          const newAlerts = problems.filter(
            p => !notifications.find(n => n.id === p.id),
          );
          notifs.push(newAlerts);
        }
      }
      if (notifs.length > 0 || currentNots.length < displayNotifs.length) {
        const combined = currentNots.concat(...notifs);
        setdisplayNotifs(combined);
        setNotifications(notifications.concat(...notifs));
        setShow(true);
      }
    }
  }, [time]);

  const first = realTimeLegs[0];
  const last = realTimeLegs[realTimeLegs.length - 1];

  let info;
  if (time < legTime(first.start)) {
    info = (
      <FormattedMessage
        id="navigation-journey-start"
        values={{ time: legTimeStr(first.start) }}
      />
    );
  } else if (currentLeg) {
    if (!currentLeg.transitLeg) {
      nextLeg = itinerary.legs.find(
        leg => legTime(leg.start) > legTime(currentLeg.start),
      );
      info = <NaviLeg leg={currentLeg} nextLeg={nextLeg} />;
    } else {
      info = `Tracking ${currentLeg?.mode} leg`;
    }
  } else if (time > legTime(last.end)) {
    info = <FormattedMessage id="navigation-journey-end" />;
  } else {
    info = <FormattedMessage id="navigation-wait" />;
  }
  const handleRemove = index => {
    setdisplayNotifs(displayNotifs.filter((_, i) => i !== index));
  };

  return (
    <>
      <button type="button" className="navitop" onClick={handleClick}>
        <div className="info">{info}</div>
        <div type="button" className="navitop-arrow">
          {nextLeg && displayNotifs.length > 0 && (
            <Icon
              img="icon-icon_arrow-collapse"
              className={`cursor-pointer ${show ? 'inverted' : ''}`}
              color={config.colors.primary}
            />
          )}
        </div>
      </button>
      {nextLeg && (
        <NaviStack
          notifications={displayNotifs}
          setShow={setShow}
          show={show}
          handleRemove={handleRemove}
        />
      )}
    </>
  );
}

NaviTop.propTypes = {
  itinerary: itineraryShape.isRequired,
  focusToLeg: PropTypes.func.isRequired,
  time: PropTypes.number.isRequired,
  realTimeLegs: PropTypes.arrayOf(legShape).isRequired,
  /*
  focusToPoint: PropTypes.func.isRequired,
  */
};

NaviTop.contextTypes = {
  intl: intlShape.isRequired,
  config: configShape.isRequired,
};

export default NaviTop;
