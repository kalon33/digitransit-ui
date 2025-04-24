import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { configShape, legShape } from '../../../util/shapes';
import { epochToTime } from '../../../util/timeUtils';
import Duration from '../Duration';
import {
  getFaresFromLegs,
  shouldShowFareInfo,
  shouldShowFarePurchaseInfo,
} from '../../../util/fareUtils';

export default function NaviBottom(
  { setNavigation, arrival, time, legs },
  { config },
) {
  const handleClose = useCallback(() => {
    addAnalyticsEvent({
      category: 'Itinerary',
      event: 'navigator',
      action: 'cancel_navigation',
    });
    setNavigation(false);
  }, [setNavigation]);
  const handleTicketButtonClick = useCallback(e => e.stopPropagation(), []);
  const fares = getFaresFromLegs(legs, config);
  const isTicketSaleActive =
    shouldShowFareInfo(config, legs) &&
    shouldShowFarePurchaseInfo(config, 'small', fares);

  const remainingDuration =
    arrival >= time ? <Duration duration={arrival - time} /> : null;

  const sheetClasses = cx('navi-bottom-sheet', {
    'ticket-link': isTicketSaleActive,
  });

  const closeButton = (
    <button type="button" onClick={handleClose} className="navi-close-button">
      <FormattedMessage id="navigation-quit" />
    </button>
  );

  const durationDiv = remainingDuration && (
    <div className="navi-time" aria-live="polite" role="status">
      <FormattedMessage id="travel-time-label">
        {msg => <span className="sr-only">{msg}</span>}
      </FormattedMessage>
      {remainingDuration}
      <FormattedMessage id="arriving-at">
        {msg => <span className="sr-only">{msg}</span>}
      </FormattedMessage>
      <FormattedMessage id="at-time">
        {msg => (
          <span className="navi-daytime">
            {msg} {epochToTime(arrival, config)}
          </span>
        )}
      </FormattedMessage>
    </div>
  );

  const [FirstElement, SecondElement] = isTicketSaleActive
    ? [closeButton, durationDiv]
    : [durationDiv, closeButton];

  return (
    <div className={sheetClasses}>
      {FirstElement}
      {SecondElement}
      {isTicketSaleActive && (
        <button type="button" className="navi-ticket-button">
          <a
            onClick={handleTicketButtonClick}
            href={config.ticketPurchaseLink(
              fares[0],
              config.ticketLinkOperatorCode,
              config.appName,
              config.availableTickets,
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FormattedMessage id="navigation-ticket" />
          </a>
        </button>
      )}
    </div>
  );
}

NaviBottom.propTypes = {
  setNavigation: PropTypes.func.isRequired,
  arrival: PropTypes.number.isRequired,
  time: PropTypes.number.isRequired,
  legs: PropTypes.arrayOf(legShape).isRequired,
};

NaviBottom.contextTypes = {
  config: configShape.isRequired,
};
