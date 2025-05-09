import { graphql } from 'react-relay';

export const planConnection = graphql`
  query PlanConnectionQuery(
    $fromPlace: PlanLabeledLocationInput!
    $toPlace: PlanLabeledLocationInput!
    $modes: PlanModesInput!
    $datetime: PlanDateTimeInput!
    $walkReluctance: Reluctance
    $walkBoardCost: Cost
    $carReluctance: Reluctance
    $minTransferTime: Duration
    $walkSpeed: Speed
    $wheelchair: Boolean
    $transferPenalty: Cost
    $bikeSpeed: Speed
    $allowedRentalNetworks: [String!]
    $after: String
    $first: Int
    $before: String
    $last: Int
    $via: [PlanViaLocationInput!]
  ) {
    plan: planConnection(
      dateTime: $datetime
      after: $after
      first: $first
      before: $before
      last: $last
      origin: $fromPlace
      destination: $toPlace
      modes: $modes
      via: $via
      preferences: {
        accessibility: { wheelchair: { enabled: $wheelchair } }
        street: {
          bicycle: {
            speed: $bikeSpeed
            rental: { allowedNetworks: $allowedRentalNetworks }
          }
          scooter: { rental: { allowedNetworks: $allowedRentalNetworks } }
          walk: {
            speed: $walkSpeed
            reluctance: $walkReluctance
            boardCost: $walkBoardCost
          }
          car: { reluctance: $carReluctance }
        }
        transit: {
          transfer: { cost: $transferPenalty, slack: $minTransferTime }
        }
      }
    ) {
      searchDateTime
      routingErrors {
        code
        inputField
      }
      pageInfo {
        startCursor
        endCursor
      }
      edges {
        ...ItineraryListContainerPlanEdges
        node {
          ...ItineraryDetailsFragment
          duration
          walkDistance
          emissionsPerPerson {
            co2
          }
          legs {
            legId: id
            mode
            rentedBike
            duration
            distance
            transitLeg
            interlineWithPreviousLeg
            headsign
            realtimeState
            alerts {
              alertSeverityLevel
              effectiveStartDate
              effectiveEndDate
              alertDescriptionText
              alertHeaderText
              id
            }
            intermediatePlaces {
              arrival {
                scheduledTime
                estimated {
                  time
                }
              }
              stop {
                gtfsId
                lat
                lon
                name
                code
                platformCode
              }
            }
            start {
              scheduledTime
              estimated {
                time
              }
            }
            end {
              scheduledTime
              estimated {
                time
              }
            }
            legGeometry {
              points
            }
            steps {
              feature {
                __typename
                ... on Entrance {
                  publicCode
                  wheelchairAccessible
                }
              }
              lat
              lon
            }
            route {
              shortName
              longName
              color
              gtfsId
              type
              mode
              agency {
                name
              }
            }
            trip {
              gtfsId
              directionId
              tripHeadsign
              stoptimesForDate {
                stop {
                  gtfsId
                }
                scheduledDeparture
                serviceDay
              }
              stoptimes {
                stop {
                  gtfsId
                }
              }
            }
            from {
              lat
              lon
              name
              stop {
                gtfsId
                name
                lat
                lon
                vehicleMode
                code
                platformCode
                zoneId
                parentStation {
                  name
                }
                routes {
                  type
                }
              }
              vehicleRentalStation {
                lat
                lon
                stationId
                name
                rentalNetwork {
                  networkId
                }
                availableVehicles {
                  total
                }
              }
              rentalVehicle {
                vehicleId
                rentalNetwork {
                  networkId
                }
              }
            }
            to {
              lat
              lon
              name
              stop {
                gtfsId
                name
                code
                platformCode
                vehicleMode
                zoneId
                parentStation {
                  name
                }
                routes {
                  type
                }
              }
              vehicleParking {
                name
              }
              vehicleRentalStation {
                lat
                lon
                stationId
                name
                rentalNetwork {
                  networkId
                }
                availableVehicles {
                  total
                }
              }
              rentalVehicle {
                rentalNetwork {
                  networkId
                  url
                }
              }
            }
            fareProducts {
              product {
                name
                id
                ... on DefaultFareProduct {
                  price {
                    amount
                  }
                }
              }
            }
          }
          start
          end
        }
      }
    }
  }
`;
