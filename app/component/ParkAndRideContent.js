import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import { matchShape, routerShape } from 'found';
import { parkShape, errorShape } from '../util/shapes';
import ParkOrStationHeader from './ParkOrStationHeader';
import Icon from './Icon';
import Disclaimer from './Disclaimer';
import { PREFIX_BIKEPARK, PREFIX_CARPARK } from '../util/path';
import { useConfigContext } from '../configurations/ConfigContext';

function parkLabel(id) {
  return (
    <div className="park-label">
      <FormattedMessage id={id} />
    </div>
  );
}

function ParkAndRideContent({
  vehicleParking,
  error,
  mode,
  showInfo,
  showDetails,
  backButton,
  router,
  match,
}) {
  // throw error when relay query fails
  if (error) {
    throw error.message;
  }
  const { parkAndRide, language } = useConfigContext();
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
  } = parkAndRide.resolver;

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
    Number.isInteger(available) &&
    Number.isInteger(capacity);

  const detailClass = showDetails ? 'park-details' : 'park-details-row';

  return (
    <div className="station-page-container">
      <div className={cx('park-header', { 'large-header': showDetails })}>
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
          <div className={cx('header-icon', 'park-details')}>
            <Icon img={`icon_${prePostFix}`} height={2.45} width={2.45} />
          </div>
        )}
        {openingHours.length > 0 && (
          <div className={detailClass}>
            {parkLabel('is-open')}
            <div className={cx('opening-hours', 'park-value')}>
              {openingHours.map(text => (
                // eslint-disable-next-line react/no-array-index-key
                <span key={`opening-hour-${text}`}>{text}</span>
              ))}
            </div>
          </div>
        )}
        {(realtime || Number.isInteger(available)) && (
          <>
            <div className="separator" />
            <div className={detailClass}>
              {realtime && (
                <>
                  {parkLabel('park-and-ride-availability')}
                  <span className="park-value">
                    {available} / {capacity}
                  </span>
                </>
              )}
              {!realtime && (
                <>
                  {parkLabel('number-of-spaces')}
                  <span className="park-value">{available}</span>
                </>
              )}
            </div>
          </>
        )}
        {showDetails && (parkIsFree || parkIsPaid) && (
          <>
            <div className="separator" />
            <div className={detailClass}>
              {parkLabel('price')}
              <span className="park-value">
                {parkIsFree && <FormattedMessage id="free-of-charge" />}
                {parkIsPaid && <FormattedMessage id="paid" />}
                {authenticationMethods.length > 0 && (
                  <>
                    {', '}
                    <FormattedMessage id="access_with" />{' '}
                  </>
                )}
                {authenticationMethods.map((method, i) => (
                  <>
                    <FormattedMessage id={method} />
                    {i < authenticationMethods.length - 1 ? ' | ' : ''}{' '}
                  </>
                ))}
              </span>
            </div>
          </>
        )}
        {showDetails && services.length > 0 && (
          <>
            <div className="separator" />
            <div className={detailClass}>
              {parkLabel('services-and-features')}
              <span className="park-value">
                {services.map((service, i) => (
                  <>
                    <FormattedMessage id={service} />
                    {i < services.length - 1 ? ' | ' : ''}
                  </>
                ))}
              </span>
            </div>
          </>
        )}
      </div>
      {showInfo && (
        <>
          <br />
          <Disclaimer
            headerId={`${prePostFix}-disclaimer-header`}
            textId={`${prePostFix}-disclaimer`}
            href={parkAndRide?.url?.[language]}
            linkLabelId="park-disclaimer-link"
          />
        </>
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
  router: routerShape.isRequired,
  match: matchShape.isRequired,
};

ParkAndRideContent.defaultProps = {
  vehicleParking: undefined,
  error: undefined,
  mode: undefined,
  showInfo: true,
  showDetails: true,
  backButton: true,
};

export default ParkAndRideContent;
