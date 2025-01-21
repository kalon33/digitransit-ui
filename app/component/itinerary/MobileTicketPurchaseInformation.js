import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';
import { configShape, fareShape } from '../../util/shapes';
import { renderZoneTicket } from './ZoneTicket';
import { getAlternativeFares, formatFare } from '../../util/fareUtils';
import { addAnalyticsEvent } from '../../util/analyticsUtils';

export default function MobileTicketPurchaseInformation(
  { fares, zones },
  { config, intl },
) {
  if (fares.length === 0) {
    return null;
  }
  const fare = fares[0]; // Show buy option only if there is single ticket available
  const alternativeFares = getAlternativeFares(
    zones,
    !fare.isUnknown,
    config.availableTickets,
  );
  const price =
    config.showTicketPrice && fare.price > 0 ? formatFare(fare) : '';

  const faresInfo = () => {
    const header = `${intl.formatMessage({
      id: 'itinerary-ticket.title',
      defaultMessage: 'Required ticket',
    })}:`;
    return (
      <div className="ticket-container">
        <div className="sr-only">
          <FormattedMessage
            id="mobile-ticket-purchase-aria"
            values={{
              ticketName: fare.ticketName,
              price,
            }}
            defaultMessage="Mobile ticket purchase information. Buy {ticketName} for {price}"
          />
        </div>
        <div>{header}</div>
        <div className="ticket-type-zone">
          <div className="ticket-identifier">
            {config.useTicketIcons
              ? renderZoneTicket(fare.ticketName, alternativeFares, true)
              : fare.ticketName}
            &nbsp;
            <span className="ticket-description">{price}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="itinerary-ticket-information-purchase">
      {faresInfo()}
      <div className="app-link">
        <a
          className={config.analyticsClass}
          onClick={() =>
            addAnalyticsEvent({ event: 'journey_planner_open_app' })
          }
          href={config.ticketPurchaseLink(fare, config.ticketLinkOperatorCode)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FormattedMessage id={config.ticketButtonTextId} />
        </a>
      </div>
    </div>
  );
}
MobileTicketPurchaseInformation.propTypes = {
  fares: PropTypes.arrayOf(fareShape),
  zones: PropTypes.arrayOf(PropTypes.string),
};

MobileTicketPurchaseInformation.defaultProps = {
  fares: [],
  zones: [],
};

MobileTicketPurchaseInformation.contextTypes = {
  config: configShape,
  intl: intlShape.isRequired,
};

MobileTicketPurchaseInformation.displayName = 'TicketInformation';
