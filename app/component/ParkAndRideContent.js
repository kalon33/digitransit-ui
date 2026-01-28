import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';
import { parkShape, configShape, errorShape } from '../util/shapes';
import ParkOrStationHeader from './ParkOrStationHeader';
import Icon from './Icon';
import Disclaimer from './Disclaimer';
import { PREFIX_BIKEPARK, PREFIX_CARPARK } from '../util/path';

function ParkAndRideContent(
  { vehicleParking, error, mode, showInfo, showDetails, backButton },
  { config, intl, router, match },
) {
  // throw error when relay query fails
  if (error) {
    throw error.message;
  }
  const bikePark = mode
    ? mode === 'BIKEPARK'
    : match.location.pathname.includes(PREFIX_BIKEPARK);
  if (!vehicleParking) {
    const path = bikePark ? PREFIX_BIKEPARK : PREFIX_CARPARK;
    router.replace(`/${path}`);
    return null;
  }
  const prePostFix = bikePark ? 'bike-park' : 'car-park';

  const {
    getAuthenticationMethods,
    getPricingMethods,
    getServices,
    isFree,
    isPaid,
    getOpeningHours,
  } = config.parkAndRide.resolver;

  const authenticationMethods = getAuthenticationMethods(vehicleParking);
  const services = getServices(vehicleParking);
  const openingHours = getOpeningHours(vehicleParking);
  const pricingMethods = getPricingMethods(vehicleParking);
  const parkIsPaid = isPaid(pricingMethods);
  const parkIsFree = isFree(pricingMethods);

  let available;
  let capacity;
  if (bikePark) {
    available = vehicleParking.parkCapacity?.bicycleSpaces;
  } else {
    available = vehicleParking.availability?.carSpaces;
    capacity = vehicleParking.parkCapacity?.carSpaces;
  }
  const realtime =
    vehicleParking.realtime &&
    !Number.isNaN(available) &&
    !Number.isNaN(capacity);

  return (
    <div className="station-page-container">
      <div className="park-header">
        {!showDetails && (
          <div className="header-icon">
            <Icon img={`icon_${prePostFix}`} height={2.45} width={2.45} />
          </div>
        )}
        <ParkOrStationHeader
          parkOrStation={vehicleParking}
          parkType={bikePark ? 'bike' : 'car'}
          backButton={backButton}
          withSeparator={showDetails}
        />
      </div>
      <div className="park-content-container">
        {showDetails && (
          <div className="header-icon">
            <Icon img={`icon_${prePostFix}`} height={2.45} width={2.45} />
          </div>
        )}
        {openingHours.length > 0 && (
          <div className="park-details">
            <FormattedMessage id="is-open" /> &#160;
            <span>
              {openingHours.map(text => (
                // eslint-disable-next-line react/no-array-index-key
                <p key={`opening-hour-${text}`}>{text}</p>
              ))}
            </span>
          </div>
        )}
        {(realtime || !Number.isNaN(available)) && (
          <>
            <div className="separator" />
            <div className="park-details">
              {realtime && (
                <>
                  <FormattedMessage id="park-and-ride-availability" />
                  <div>
                    {available} / {capacity}
                  </div>
                </>
              )}
              {!realtime && (
                <>
                  <FormattedMessage id="number-of-spaces" />
                  <div>{available}</div>
                </>
              )}
            </div>
          </>
        )}
        {showDetails && (
          <div className="park-details">
            {(parkIsFree || parkIsPaid) && (
              <span>
                {parkIsFree && intl.formatMessage({ id: 'free-of-charge' })}
                {parkIsPaid && intl.formatMessage({ id: 'paid' })}
                {authenticationMethods.length > 0 &&
                  `, ${intl.formatMessage({
                    id: 'access_with',
                  })} `}
                {authenticationMethods.map(
                  (method, i) =>
                    `
                ${intl.formatMessage({ id: method })}
                ${i < authenticationMethods.length - 1 ? ' | ' : ''}
              `,
                )}
              </span>
            )}
            {services.length > 0 && (
              <span>
                {services.map(
                  (service, i) =>
                    `
                ${intl.formatMessage({ id: service })}
                ${i < services.length - 1 ? ' | ' : ''}
              `,
                )}
              </span>
            )}
          </div>
        )}
      </div>
      {showInfo && (
        <Disclaimer
          headerId={`${prePostFix}-disclaimer-header`}
          textId={`${prePostFix}-disclaimer`}
          href={config.parkAndRide?.url?.[config.language]}
          linkLabelId="park-disclaimer-link"
        />
      )}
    </div>
  );
}

ParkAndRideContent.propTypes = {
  vehicleParking: parkShape,
  error: errorShape,
  mode: PropTypes.oneOf(['CARPARK', 'BIKEPARK']),
  showInfo: PropTypes.bool,
  showDetails: PropTypes.bool,
  backButton: PropTypes.bool,
};

ParkAndRideContent.defaultProps = {
  vehicleParking: undefined,
  error: undefined,
  mode: undefined,
  showInfo: true,
  showDetails: true,
  backButton: true,
};

ParkAndRideContent.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
};

export default ParkAndRideContent;
