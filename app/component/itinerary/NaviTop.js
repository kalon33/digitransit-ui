import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'react-intl';
import distance from '@digitransit-search-util/digitransit-search-util-distance';
import { legShape, configShape } from '../../util/shapes';
import { legTime, legTimeStr } from '../../util/legUtils';
import NaviLeg from './NaviLeg';
import Icon from '../Icon';
import NaviStack from './NaviStack';
import {
  getItineraryAlerts,
  getTransitLegState,
  getAdditionalMessages,
} from './NaviUtils';

const DESTINATION_RADIUS = 20; // meters
const TIME_AT_DESTINATION = 3; // * 10 seconds

function getFirstLastLegs(legs) {
  const first = legs[0];
  const last = legs[legs.length - 1];
  return { first, last };
}

function NaviTop(
  { focusToLeg, time, realTimeLegs, position },
  { intl, config },
) {
  const [currentLeg, setCurrentLeg] = useState(null);
  const [showMessages, setShowMessages] = useState(true);
  // All notifications including those user has dismissed.
  const [messages, setMessages] = useState(new Map());
  // notifications that are shown to the user.
  const [activeMessages, setActiveMessages] = useState([]);
  const focusRef = useRef(false);
  // Destination counter. How long user has been at the destination. * 10 seconds
  const destCountRef = useRef(0);

  const handleClick = () => {
    setShowMessages(!showMessages);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessages(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const newLeg = realTimeLegs.find(leg => {
      return legTime(leg.start) <= time && time <= legTime(leg.end);
    });

    const incomingMessages = new Map();

    // TODO proper alert handling.
    // Alerts for NaviStack
    const alerts = getItineraryAlerts(realTimeLegs, intl);
    alerts.forEach(alert => {
      incomingMessages.set(alert.id, alert);
    });

    const legChanged = newLeg?.id
      ? newLeg.id !== currentLeg?.id
      : currentLeg?.mode !== newLeg?.mode;
    const l = currentLeg || newLeg;

    if (l) {
      const nextTransitLeg = realTimeLegs.find(
        leg => legTime(leg.start) > legTime(l.start) && leg.transitLeg,
      );
      if (nextTransitLeg) {
        // Messages for NaviStack.
        const transitLegState = getTransitLegState(
          nextTransitLeg,
          intl,
          messages,
        );
        if (transitLegState) {
          incomingMessages.set(transitLegState.id, transitLegState);
        }
        const additionalMsgs = getAdditionalMessages(
          nextTransitLeg,
          time,
          intl,
          config,
          messages,
        );
        if (additionalMsgs) {
          additionalMsgs.forEach(m => {
            incomingMessages.set(m.id, m);
          });
        }
      }

      if (legChanged) {
        focusToLeg?.(newLeg);
        setCurrentLeg(newLeg);
      }

      if (incomingMessages.size || legChanged) {
        // Handle messages when new messages arrives or leg is changed.

        // Current active messages. Filter away legChange messages when leg changes.
        const currActiveMessages = legChanged
          ? activeMessages.filter(m => m.expiresOn !== 'legChange')
          : activeMessages;

        const newMessages = Array.from(incomingMessages.values());
        setActiveMessages([...currActiveMessages, ...newMessages]);
        setMessages(new Map([...messages, ...incomingMessages]));

        setShowMessages(true);
      }

      if (!focusRef.current && focusToLeg) {
        // handle initial focus when not tracking
        if (newLeg) {
          focusToLeg(newLeg);
          destCountRef.current = 0;
        } else {
          const { first, last } = getFirstLastLegs(realTimeLegs);
          if (time < legTime(first.start)) {
            focusToLeg(first);
          } else {
            focusToLeg(last);
          }
        }
        focusRef.current = true;
      }
    }

    // User position and distance from currentleg endpoint.
    if (
      position &&
      currentLeg &&
      distance(position, currentLeg.to) <= DESTINATION_RADIUS
    ) {
      destCountRef.current += 1;
    } else {
      // Todo: this works in transit legs, but do we need additional logic for bikes / scooters?
      destCountRef.current = 0;
    }
  }, [time]);

  const { first, last } = getFirstLastLegs(realTimeLegs);

  let naviTopContent;
  if (time < legTime(first.start)) {
    naviTopContent = (
      <FormattedMessage
        id="navigation-journey-start"
        values={{ time: legTimeStr(first.start) }}
      />
    );
  } else if (currentLeg) {
    if (!currentLeg.transitLeg) {
      const nextLeg = realTimeLegs.find(leg => {
        return legTime(leg.start) > legTime(currentLeg.start);
      });
      if (destCountRef.current >= TIME_AT_DESTINATION) {
        // User at the destination. show wait message.
        naviTopContent = (
          <NaviLeg leg={currentLeg} nextLeg={nextLeg} legType="wait" />
        );
      } else {
        naviTopContent = (
          <NaviLeg leg={currentLeg} nextLeg={nextLeg} legType="move" />
        );
      }
    } else {
      naviTopContent = `Tracking ${currentLeg?.mode} leg`;
    }
  } else if (time > legTime(last.end)) {
    naviTopContent = <FormattedMessage id="navigation-journey-end" />;
  } else {
    naviTopContent = <FormattedMessage id="navigation-wait" />;
  }
  const handleRemove = index => {
    setActiveMessages(activeMessages.filter((_, i) => i !== index));
  };

  const showmessages = activeMessages.length > 0;
  return (
    <>
      <button type="button" className="navitop" onClick={handleClick}>
        <div className="content">{naviTopContent}</div>
        <div type="button" className="navitop-arrow">
          {showmessages && (
            <Icon
              img="icon-icon_arrow-collapse"
              className={`cursor-pointer ${showMessages ? 'inverted' : ''}`}
              color={config.colors.primary}
            />
          )}
        </div>
      </button>
      {showmessages && (
        <NaviStack
          messages={activeMessages}
          show={showMessages}
          handleRemove={handleRemove}
        />
      )}
    </>
  );
}

NaviTop.propTypes = {
  focusToLeg: PropTypes.func,
  time: PropTypes.number.isRequired,
  realTimeLegs: PropTypes.arrayOf(legShape).isRequired,
  position: PropTypes.shape({
    lat: PropTypes.number,
    lon: PropTypes.number,
  }),

  /*
  focusToPoint: PropTypes.func.isRequired,
  */
};

NaviTop.defaultProps = {
  focusToLeg: undefined,
  position: undefined,
};

NaviTop.contextTypes = {
  intl: intlShape.isRequired,
  config: configShape.isRequired,
};

export default NaviTop;
