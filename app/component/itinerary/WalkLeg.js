import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import Link from 'found/Link';
import { legShape, configShape } from '../../util/shapes';
import { legTime, legTimeStr, legDestination } from '../../util/legUtils';
import Icon from '../Icon';
import ItineraryMapAction from './ItineraryMapAction';
import ItineraryCircleLineWithIcon from './ItineraryCircleLineWithIcon';
import PlatformNumber from '../PlatformNumber';
import ServiceAlertIcon from '../ServiceAlertIcon';
import { getActiveAlertSeverityLevel } from '../../util/alertUtils';
import { PREFIX_STOPS } from '../../util/path';
import {
  RentalNetworkType,
  getRentalNetworkConfig,
} from '../../util/vehicleRentalUtils';
import { displayDistance } from '../../util/geo-utils';
import { durationToString } from '../../util/timeUtils';
import { splitStringToAddressAndPlace } from '../../util/otpStrings';
import VehicleRentalLeg from './VehicleRentalLeg';

function WalkLeg(
  {
    children,
    focusAction,
    focusToLeg,
    index,
    leg,
    previousLeg,
    nextLeg,
    useOriginAddress,
  },
  { config, intl },
) {
  const distance = displayDistance(
    parseInt(leg.mode !== 'WALK' ? 0 : leg.distance, 10),
    config,
    intl.formatNumber,
  );
  //
  const duration = durationToString(
    leg.mode !== 'WALK' ? 0 : leg.duration * 1000,
  );
  const startMs = legTime(leg.start);
  // If mode is not WALK, WalkLeg should get information from "to". If useOriginAddress is true, force WalkLeg to get information from "from".
  const toOrFrom = leg.mode !== 'WALK' && !useOriginAddress ? 'to' : 'from';
  const modeClassName = 'walk';
  const fromMode = (leg[toOrFrom].stop && leg[toOrFrom].stop.vehicleMode) || '';
  const isFirstLeg = i => i === 0;
  const [address, place] = splitStringToAddressAndPlace(leg[toOrFrom].name);
  const network =
    previousLeg?.[toOrFrom]?.vehicleRentalStation?.rentalNetwork.networkId ||
    previousLeg?.[toOrFrom]?.rentalVehicle?.rentalNetwork.networkId;

  const networkType = getRentalNetworkConfig(
    previousLeg?.rentedBike && network,
    config,
  ).type;
  const isScooter = networkType === RentalNetworkType.Scooter;
  const alightNotice = previousLeg?.mode === 'TAXI' || leg?.mode === 'TAXI'; // Taxi leg is the current leg when the walk leg is added after a taxi leg without a walk leg from data
  const returnNotice = previousLeg?.rentedBike ? (
    <FormattedMessage
      id={
        networkType === RentalNetworkType.Scooter
          ? 'return-e-scooter-to'
          : 'return-cycle-to'
      }
      values={{ station: leg[toOrFrom] ? leg[toOrFrom].name : '' }}
      defaultMessage="Return the bike to {station} station"
    />
  ) : null;
  let appendClass;

  if (returnNotice) {
    appendClass = !isScooter ? 'return-citybike' : '';
  }

  const destinationLabel =
    leg.to.name?.toLowerCase() === 'scooter'
      ? intl.formatMessage({
          id: 'e-scooter',
          defaultMessage: 'scooter',
        })
      : leg.to.name;
  const entranceName = leg?.steps?.find(
    step =>
      // eslint-disable-next-line no-underscore-dangle
      step?.feature?.__typename === 'Entrance' || step?.feature?.publicCode,
  )?.feature?.publicCode;

  const entranceAccessible = leg?.steps?.find(
    // eslint-disable-next-line no-underscore-dangle
    step =>
      // eslint-disable-next-line no-underscore-dangle
      step?.feature?.__typename === 'Entrance' ||
      step?.feature?.wheelchairAccessible,
  )?.feature?.wheelchairAccessible;

  return (
    <div key={index} className="row itinerary-row">
      <span className="sr-only">
        {returnNotice}
        <FormattedMessage
          id="itinerary-details.walk-leg"
          values={{
            time: legTimeStr(leg.start),
            to: legDestination(intl, leg),
            distance,
            duration,
            origin: leg[toOrFrom] ? leg[toOrFrom].name : '',
            destination: leg.to ? destinationLabel : '',
          }}
        />
      </span>
      <div className="small-2 columns itinerary-time-column" aria-hidden="true">
        <div className="itinerary-time-column-time">
          <span className={cx({ realtime: previousLeg?.realTime })}>
            {leg.mode === 'WALK' ? legTimeStr(leg.start) : legTimeStr(leg.end)}
          </span>
        </div>
      </div>
      <ItineraryCircleLineWithIcon
        appendClass={appendClass}
        index={index}
        modeClassName={modeClassName}
      />
      <div
        className={`small-9 columns itinerary-instruction-column ${leg.mode.toLowerCase()}`}
      >
        <span className="sr-only">
          <FormattedMessage
            id="itinerary-summary.show-on-map"
            values={{ target: leg[toOrFrom].name || '' }}
          />
        </span>
        {isFirstLeg(index) ? (
          <div className={cx('itinerary-leg-first-row', 'walk', 'first')}>
            <div className="address-container">
              <div className="address">
                {address}
                {leg[toOrFrom].stop && (
                  <Icon
                    img="icon-icon_arrow-collapse--right"
                    className="itinerary-arrow-icon"
                    color={config.colors.primary}
                  />
                )}
              </div>
              <div className="place">{place}</div>
            </div>
            <ItineraryMapAction
              target={leg[toOrFrom].name || ''}
              focusAction={focusAction}
            />
          </div>
        ) : (
          <div
            className={cx(
              returnNotice
                ? 'itinerary-leg-first-row-return-bike'
                : 'itinerary-leg-first-row',
              isScooter && 'scooter',
              alightNotice && 'alight',
            )}
          >
            <div className="itinerary-leg-row">
              {leg[toOrFrom].stop && !alightNotice ? (
                <Link
                  onClick={e => {
                    e.stopPropagation();
                  }}
                  to={`/${PREFIX_STOPS}/${leg[toOrFrom].stop.gtfsId}`}
                >
                  {returnNotice || leg[toOrFrom].name}
                  {leg.isViaPoint && (
                    <Icon
                      img="icon-icon_mapMarker"
                      className="itinerary-mapmarker-icon"
                    />
                  )}
                  {leg[toOrFrom].stop && (
                    <Icon
                      img="icon-icon_arrow-collapse--right"
                      className="itinerary-arrow-icon"
                      color={config.colors.primary}
                    />
                  )}
                  <ServiceAlertIcon
                    className="inline-icon"
                    severityLevel={getActiveAlertSeverityLevel(
                      leg[toOrFrom].stop && leg[toOrFrom].stop.alerts,
                      startMs / 1000,
                    )}
                  />
                </Link>
              ) : (
                <div>
                  {returnNotice && (
                    <>
                      <div className="divider" />
                      <VehicleRentalLeg
                        isScooter={isScooter}
                        stationName={leg[toOrFrom].name}
                        vehicleRentalStation={
                          leg[toOrFrom].vehicleRentalStation
                        }
                        returnBike
                        rentalVehicle={leg.from.rentalVehicle}
                      />
                    </>
                  )}
                  {alightNotice && (
                    <div className="itinerary-leg-action-content">
                      <FormattedMessage
                        id="get-off-the-ride"
                        defaultMessage="Get off the taxi"
                      />
                    </div>
                  )}
                  {!returnNotice && !alightNotice && leg[toOrFrom].name}
                  {leg[toOrFrom].stop && !alightNotice && (
                    <Icon
                      img="icon-icon_arrow-collapse--right"
                      className="itinerary-arrow-icon"
                      color={config.colors.primary}
                    />
                  )}
                  <ServiceAlertIcon
                    className="inline-icon"
                    severityLevel={getActiveAlertSeverityLevel(
                      leg[toOrFrom].stop && leg[toOrFrom].stop.alerts,
                      startMs / 1000,
                    )}
                  />
                </div>
              )}
              {networkType !== RentalNetworkType.Scooter && (
                <div className="stop-code-container">
                  {children}
                  {leg[toOrFrom].stop && (
                    <PlatformNumber
                      number={leg[toOrFrom].stop.platformCode}
                      short
                      isRailOrSubway={
                        fromMode === 'RAIL' || fromMode === 'SUBWAY'
                      }
                    />
                  )}
                </div>
              )}
            </div>
            {!returnNotice && (
              <ItineraryMapAction
                target={leg[toOrFrom].name || ''}
                focusAction={focusAction}
              />
            )}
          </div>
        )}
        <div className="itinerary-leg-action">
          {previousLeg?.mode === 'SUBWAY' && (
            <div
              className="subway-entrance-info-container"
              aria-labelledby="subway-entrance-label"
            >
              <span id="subway-entrance-label" className="sr-only">
                <FormattedMessage
                  id={
                    entranceAccessible === 'POSSIBLE'
                      ? 'subway-exit.sr-description.accessible'
                      : 'subway-exit.sr-description'
                  }
                  defaultMessage="Exit {entranceName}"
                  values={{ entranceName: entranceName || '' }}
                />
              </span>

              <div className="subway-entrance-info-text" aria-hidden="true">
                <FormattedMessage id="station-exit" defaultMessage="Exit" />
              </div>
              <Icon
                img="icon-icon_subway_entrance"
                className="subway-entrance-info-icon"
              />
              {entranceName && (
                <Icon
                  className="subway-entrance-info-icon"
                  img={`icon-icon_subway_entrance_${entranceName.toLowerCase()}`}
                />
              )}
              {entranceAccessible === 'POSSIBLE' && (
                <Icon
                  className="subway-entrance-info-icon"
                  img="icon-icon_wheelchair_filled"
                />
              )}
            </div>
          )}
          <div className=" itinerary-leg-action-content">
            <FormattedMessage
              id="walk-distance-duration"
              values={{
                distance: config.emphasizeDistance ? (
                  <b>{distance}</b>
                ) : (
                  distance
                ),
                duration,
              }}
              defaultMessage="Walk {distance} ({duration})"
            />
            <ItineraryMapAction
              target=""
              ariaLabelId="itinerary-summary-row.clickable-area-description"
              focusAction={focusToLeg}
            />
          </div>
          {nextLeg?.mode === 'SUBWAY' && (
            <div
              className="subway-entrance-info-container"
              aria-labelledby="subway-entrance-label"
            >
              <span id="subway-entrance-label" className="sr-only">
                <FormattedMessage
                  id={
                    entranceAccessible === 'POSSIBLE'
                      ? 'subway-entrance.sr-description.accessible'
                      : 'subway-entrance.sr-description'
                  }
                  defaultMessage="Exit {entranceName}"
                  values={{ entranceName: entranceName || '' }}
                />
              </span>
              <div className="subway-entrance-info-text" aria-hidden="true">
                <FormattedMessage
                  id="station-entrance"
                  defaultMessage="Entrance"
                />
              </div>
              <Icon
                img="icon-icon_subway_entrance"
                className="subway-entrance-info-icon"
              />
              {entranceName && (
                <Icon
                  className="subway-entrance-info-icon"
                  img={`icon-icon_subway_entrance_${entranceName.toLowerCase()}`}
                />
              )}
              {entranceAccessible === 'POSSIBLE' && (
                <Icon
                  className="subway-entrance-info-icon"
                  img="icon-icon_wheelchair_filled"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

WalkLeg.propTypes = {
  children: PropTypes.node,
  focusAction: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  leg: legShape.isRequired,
  previousLeg: legShape,
  nextLeg: legShape,
  focusToLeg: PropTypes.func.isRequired,
  useOriginAddress: PropTypes.bool,
};

WalkLeg.defaultProps = {
  previousLeg: undefined,
  nextLeg: undefined,
  children: undefined,
  useOriginAddress: false,
};

WalkLeg.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};

export default WalkLeg;
