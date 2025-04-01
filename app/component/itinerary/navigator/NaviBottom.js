import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import addAnalyticsEvent from '../../../util/analyticsUtils';
import { configShape } from '../../../util/shapes';
import { epochToTime } from '../../../util/timeUtils';

export default function NaviBottom(
  { setNavigation, arrival, time },
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

  const isTicketSaleActive = !!config?.ticketLink;
  const remainingDuration = Math.ceil((arrival - time) / 60000); // ms to minutes

  const sheetClasses = cx('navi-bottom-sheet', {
    'ticket-link': isTicketSaleActive,
  });

  const closeButton = (
    <button type="button" onClick={handleClose} className="navi-close-button">
      <FormattedMessage id="navigation-quit" />
    </button>
  );

  const durationDiv = remainingDuration >= 0 && (
    <div className="navi-time">
      <FormattedMessage id="travel-time" values={{ min: remainingDuration }} />
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
            href={config.ticketLink}
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
};

NaviBottom.contextTypes = {
  config: configShape.isRequired,
};
