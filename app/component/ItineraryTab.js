import get from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import cx from 'classnames';
import { matchShape, routerShape } from 'found';
import { FormattedMessage, intlShape } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Icon from './Icon';
import TicketInformation from './TicketInformation';
import RouteInformation from './RouteInformation';
import ItinerarySummary from './ItinerarySummary';
import ItineraryLegs from './ItineraryLegs';
import BackButton from './BackButton';
import MobileTicketPurchaseInformation from './MobileTicketPurchaseInformation';
import {
  getRoutes,
  getZones,
  compressLegs,
  getTotalBikingDistance,
  getTotalBikingDuration,
  getTotalWalkingDistance,
  getTotalWalkingDuration,
  legContainsRentalBike,
  getTotalDrivingDuration,
  getTotalDrivingDistance,
  isCallAgencyPickupType,
} from '../util/legUtils';
import { BreakpointConsumer } from '../util/withBreakpoint';

import {
  getFares,
  shouldShowFareInfo,
  shouldShowFarePurchaseInfo,
} from '../util/fareUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import {
  isToday,
  isTomorrow,
  getFormattedTimeDate,
  getCurrentMillis,
} from '../util/timeUtils';
import CityBikeDurationInfo from './CityBikeDurationInfo';
import { getCityBikeNetworkId } from '../util/citybikes';
import { FareShape } from '../util/shapes';
import Emissions from './Emissions';
import EmissionsInfo from './EmissionsInfo';

const AlertShape = PropTypes.shape({ alertSeverityLevel: PropTypes.string });

const RouteShape = PropTypes.shape({
  alerts: PropTypes.arrayOf(AlertShape),
});

const TripShape = PropTypes.shape({
  pattern: PropTypes.shape({
    code: PropTypes.string,
  }),
});

const ItineraryShape = PropTypes.shape({
  legs: PropTypes.arrayOf(
    PropTypes.shape({
      route: RouteShape,
      trip: TripShape,
      distance: PropTypes.number,
      fares: PropTypes.arrayOf(FareShape),
    }),
  ),
  fares: PropTypes.arrayOf(FareShape),
  emissionsPerPerson: PropTypes.shape({
    co2: PropTypes.number,
  }),
});

/* eslint-disable prettier/prettier */
class ItineraryTab extends React.Component {
  static propTypes = {
    plan: PropTypes.shape({
      date: PropTypes.number.isRequired,
    }).isRequired,
    itinerary: ItineraryShape.isRequired,
    focusToPoint: PropTypes.func.isRequired,
    focusToLeg: PropTypes.func.isRequired,
    isMobile: PropTypes.bool.isRequired,
    currentTime: PropTypes.number.isRequired,
    hideTitle: PropTypes.bool,
    carItinerary: ItineraryShape,
    currentLanguage: PropTypes.string,
    changeHash: PropTypes.func,
  };

  static defaultProps = {
    hideTitle: false,
    currentLanguage: "fi"
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
    router: routerShape.isRequired,
    match: matchShape.isRequired,
    intl: intlShape.isRequired,
    getStore: PropTypes.func.isRequired,
  };

  handleFocus = (lat, lon) => {
    this.props.focusToPoint(lat, lon);
  };

  shouldShowDisclaimer = config => {
    return (
      config.showDisclaimer &&
      this.context.match.params.hash !== 'walk' &&
      this.context.match.params.hash !== 'bike'
    );
  };

  printItinerary = e => {
    e.stopPropagation();

    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'Print',
      name: null,
    });

    const printPath = `${this.context.match.location.pathname}/tulosta`;
    this.context.router.push({
      ...this.context.match.location,
      pathname: printPath,
    });
  };

  getFutureText = (startTime, currentTime) => {
    const refTime = getCurrentMillis(currentTime);
    if (isToday(startTime, refTime)) {
      return '';
    }
    if (isTomorrow(startTime, refTime)) {
      return this.context.intl.formatMessage({
        id: 'tomorrow',
      });
    }
    return getFormattedTimeDate(startTime, 'dd D.M.');
  };

  setExtraProps = itinerary => {
    const compressedItinerary = {
      ...itinerary,
      legs: compressLegs(itinerary.legs),
    };
    const walkingDistance = getTotalWalkingDistance(compressedItinerary);
    const walkingDuration = getTotalWalkingDuration(compressedItinerary);
    const bikingDistance = getTotalBikingDistance(compressedItinerary);
    const bikingDuration = getTotalBikingDuration(compressedItinerary);
    const drivingDuration = getTotalDrivingDuration(compressedItinerary);
    const drivingDistance = getTotalDrivingDistance(compressedItinerary);
    const futureText = this.getFutureText(
      itinerary.startTime,
      this.props.currentTime,
    );
    const isMultiRow =
      walkingDistance > 0 &&
      (bikingDistance > 0 || drivingDistance > 0) &&
      futureText !== '';
    const extraProps = {
      walking: {
        duration: walkingDuration,
        distance: walkingDistance,
      },
      biking: {
        duration: bikingDuration,
        distance: bikingDistance,
      },
      driving: {
        duration: drivingDuration,
        distance: drivingDistance,
      },
      futureText,
      isMultiRow,
    };
    return extraProps;
  };

  render() {
    const { itinerary, currentLanguage } = this.props;
    const { config } = this.context;

    if (!itinerary || !itinerary.legs[0]) {
      return null;
    }
    const fares = getFares(itinerary.fares, getRoutes(itinerary.legs), config);
    const extraProps = this.setExtraProps(itinerary);
    const legsWithRentalBike = compressLegs(itinerary.legs).filter(leg =>
      legContainsRentalBike(leg),
    );
    const rentalBikeNetworks = new Set();
    let showRentalBikeDurationWarning = false;
    if (legsWithRentalBike.length > 0) {
      for (let i = 0; i < legsWithRentalBike.length; i++) {
        const leg = legsWithRentalBike[i];
        const network = getCityBikeNetworkId(
          leg.from.bikeRentalStation?.networks,
        );
        if (
          config.cityBike.networks[network]?.timeBeforeSurcharge &&
          config.cityBike.networks[network]?.durationInstructions
        ) {
          const rentDurationOverSurchargeLimit =
            leg.duration >
            config.cityBike.networks[network].timeBeforeSurcharge;
          if (rentDurationOverSurchargeLimit) {
            rentalBikeNetworks.add(network);
            showRentalBikeDurationWarning =
              rentDurationOverSurchargeLimit || showRentalBikeDurationWarning;
          }
        }
      }
    }
    const suggestionIndex = this.context.match.params.secondHash
      ? Number(this.context.match.params.secondHash) + 1
      : Number(this.context.match.params.hash) + 1;

    const itineraryContainsCallLegs = itinerary.legs.some(leg => isCallAgencyPickupType(leg));

    return (
      <div className="itinerary-tab">
        <h2 className="sr-only">
          <FormattedMessage
            id="summary-page.row-label"
            values={{
              number: suggestionIndex,
            }}
          />
        </h2>
        <BreakpointConsumer>
          {breakpoint => [
            breakpoint !== 'large' ? (
              <ItinerarySummary
                itinerary={itinerary}
                key="summary"
                walking={extraProps.walking}
                biking={extraProps.biking}
                driving={extraProps.driving}
                futureText={extraProps.futureText}
                isMultiRow={extraProps.isMultiRow}
                isMobile={this.props.isMobile}
                hideBottomDivider={shouldShowFarePurchaseInfo(config, breakpoint, fares)}
              />
            ) : (
              <>
                {!this.props.hideTitle && (
                  <div className="desktop-title" key="header">
                    <div className="title-container h2">
                      <BackButton
                        title={
                          <FormattedMessage
                            id="itinerary-page.title"
                            defaultMessage="Itinerary suggestions"
                          />
                        }
                        icon="icon-icon_arrow-collapse--left"
                        iconClassName="arrow-icon"
                        fallback="pop"
                      />
                    </div>
                  </div>
                )}
                <div className="itinerary-summary-container">
                  <ItinerarySummary
                    itinerary={itinerary}
                    key="summary"
                    walking={extraProps.walking}
                    biking={extraProps.biking}
                    driving={extraProps.driving}
                    futureText={extraProps.futureText}
                    isMultiRow={extraProps.isMultiRow}
                    isMobile={this.props.isMobile}
                  />
                </div>
              </>
            ),
            showRentalBikeDurationWarning && (
              <CityBikeDurationInfo
                networks={Array.from(rentalBikeNetworks)}
                config={config}
              />
            ),
            shouldShowFareInfo(config) && (
              shouldShowFarePurchaseInfo(config,breakpoint,fares) ? (
                <MobileTicketPurchaseInformation
                  fares={fares}
                  zones={getZones(itinerary.legs)}
                />) :
                (<TicketInformation
                  fares={fares}
                  zones={getZones(itinerary.legs)}
                  legs={itinerary.legs}
                />)
            ),
            config.showCO2InItinerarySummary && <EmissionsInfo itinerary={itinerary} isMobile={this.props.isMobile} />,
            <div
              className={cx('momentum-scroll itinerary-tabs__scroll', {
                multirow: extraProps.isMultiRow,
              })}
              key="legs"
            >
              <div
                className={cx('itinerary-main', {
                  'bp-large': breakpoint === 'large',
                })}
              >
                {shouldShowFareInfo(config) &&
                  fares.some(fare => fare.isUnknown) && (
                    <div className="disclaimer-container unknown-fare-disclaimer__top">
                      <div className="icon-container">
                        <Icon className="info" img="icon-icon_info" />
                      </div>
                      {config.callAgencyInfo && itineraryContainsCallLegs ?
                        (<div className="description-container">
                          <FormattedMessage
                            id="separate-ticket-required-for-call-agency-disclaimer"
                            values={{
                              callAgencyInfoUrl: get(
                                config,
                                `callAgencyInfo.${currentLanguage}.callAgencyInfoLink`,
                              ),
                            }}
                          />
                          <a href={config.callAgencyInfo[currentLanguage].callAgencyInfoLink}>
                            <FormattedMessage
                              id={config.callAgencyInfo[currentLanguage].callAgencyInfoLinkText}
                              defaultMessage={config.callAgencyInfo[currentLanguage].callAgencyInfoLinkText}
                            />
                          </a>
                        </div>
                        ) : (
                          <div className="description-container">
                            <FormattedMessage
                              id="separate-ticket-required-disclaimer"
                              values={{
                                agencyName: get(
                                  config,
                                  'ticketInformation.primaryAgencyName',
                                ),
                              }}
                            />
                          </div>
                        )}
                    </div>
                  )}
                <ItineraryLegs
                  fares={fares}
                  itinerary={itinerary}
                  focusToPoint={this.handleFocus}
                  focusToLeg={this.props.focusToLeg}
                  changeHash={this.props.changeHash}
                  tabIndex={suggestionIndex - 1}
                />
                {config.showRouteInformation && <RouteInformation />}
              </div>
              {config.showCO2InItinerarySummary &&
                <Emissions
                  config={config}
                  itinerary={itinerary}
                  carItinerary={this.props.carItinerary}
                  emissionsInfolink={config.URL.EMISSIONS_INFO?.[currentLanguage]}
                />}
              {this.shouldShowDisclaimer(config) && (
                <div className="itinerary-disclaimer">
                  <FormattedMessage
                    id="disclaimer"
                    defaultMessage="Results are based on estimated travel times"
                  />
                </div>
              )}
              <div className="itinerary-empty-space" />
            </div>,
          ]}
        </BreakpointConsumer>
      </div>
    );
  }
}

const withRelay = createFragmentContainer(
  connectToStores(ItineraryTab, ['TimeStore'], context => ({
    currentTime: context.getStore('TimeStore').getCurrentTime().unix(),
    currentLanguage: context.getStore('PreferencesStore').getLanguage(),
  })),
  {
    plan: graphql`
      fragment ItineraryTab_plan on Plan {
        date
      }
    `,
    itinerary: graphql`
      fragment ItineraryTab_itinerary on Itinerary {
        walkDistance
        duration
        startTime
        endTime
        fares {
          cents
          components {
            cents
            fareId
            routes {
              agency {
                gtfsId
                fareUrl
                name
              }
              gtfsId
            }
          }
          type
        }
        emissionsPerPerson {
          co2
        }
        legs {
          mode
          nextLegs(numberOfLegs: 2  originModesWithParentStation: [RAIL]  destinationModesWithParentStation: [RAIL]) {
            mode
            distance
            route {
              alerts {
                alertSeverityLevel
              }
              shortName
              mode
              type
              gtfsId
              color
            }
            from {
              stop {
                platformCode
                alerts {
                  alertSeverityLevel
                }
              }
            }
            to {
              stop {
                alerts {
                  alertSeverityLevel
                }
              }
            }
            startTime
            trip {
              tripHeadsign
              pattern {
                code
              } 
              occupancy {
                occupancyStatus
              }
              gtfsId
            }
            realTime
          }
          ...LegAgencyInfo_leg
          from {
            lat
            lon
            name
            vertexType
            bikePark {
              bikeParkId
              name
            }
            bikeRentalStation {
              networks
              bikesAvailable
              lat
              lon
              stationId
            }
            stop {
              gtfsId
              code
              platformCode
              vehicleMode
              zoneId
              alerts {
                alertSeverityLevel
                effectiveEndDate
                effectiveStartDate
                alertHeaderText
                alertDescriptionText
                entities {
                  __typename
                  ... on Stop {
                    gtfsId
                  }
                }
              }
            }
          }
          to {
            lat
            lon
            name
            vertexType
            bikeRentalStation {
              lat
              lon
              stationId
              networks
              bikesAvailable
            }
            stop {
              gtfsId
              code
              platformCode
              zoneId
              name
              vehicleMode
              alerts {
                alertSeverityLevel
                effectiveEndDate
                effectiveStartDate
                alertHeaderText
                alertDescriptionText
                entities {
                  __typename
                  ... on Stop {
                    gtfsId
                  }
                }
              }
            }
            bikePark {
              bikeParkId
              name
            }
            carPark {
              carParkId
              name
            }
          }
          legGeometry {
            length
            points
          }
          intermediatePlaces {
            arrivalTime
            stop {
              gtfsId
              lat
              lon
              name
              code
              platformCode
              zoneId
            }
          }
          realTime
          realtimeState
          transitLeg
          rentedBike
          startTime
          endTime
          mode
          interlineWithPreviousLeg
          distance
          duration
          intermediatePlace
          route {
            shortName
            color
            gtfsId
            type
            longName
            desc
            agency {
              gtfsId
              fareUrl
              name
              phone
            }
            alerts {
              alertSeverityLevel
              effectiveEndDate
              effectiveStartDate
              alertHeaderText
              alertDescriptionText
              entities {
                __typename
                ... on Route {
                  gtfsId
                }
              }
            }
          }
          trip {
            gtfsId
            tripHeadsign
            pattern {
              code
            }
            stoptimesForDate {
              headsign
              pickupType
              realtimeState
              stop {
                gtfsId
              }
            }
            occupancy {
              occupancyStatus
            }
          }
        }
      }
    `,
  },
);

export { ItineraryTab as Component, withRelay as default };
