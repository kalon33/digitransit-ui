import { graphql } from 'react-relay';

const streetQuery = graphql`
  query StreetQuery(
    $mode: PlanDirectMode!
    $origin: PlanLabeledLocationInput!
    $destination: PlanLabeledLocationInput!
    $walkSpeed: Speed
    $bikeSpeed: Speed
    $wheelchair: Boolean
  ) {
    plan: planConnection(
      first: 1
      origin: $origin
      destination: $destination
      modes: { directOnly: true, direct: [$mode] }
      preferences: {
        accessibility: { wheelchair: { enabled: $wheelchair } }
        street: { walk: { speed: $walkSpeed }, bicycle: { speed: $bikeSpeed } }
      }
    ) {
      edges {
        node {
          legs {
            mode
            rentedBike
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
            duration
            distance
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
            transitLeg
            interlineWithPreviousLeg
            route {
              gtfsId
              shortName
              color
              type
              agency {
                name
              }
            }
            from {
              lat
              lon
              name
              vehicleRentalStation {
                lat
                lon
                stationId
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
              stop {
                gtfsId
                code
                platformCode
              }
            }
            to {
              lat
              lon
              name
              vehicleRentalStation {
                lat
                lon
                stationId
                rentalNetwork {
                  networkId
                }
                availableVehicles {
                  total
                }
              }
              stop {
                gtfsId
                code
                platformCode
              }
            }
            intermediatePlaces {
              stop {
                gtfsId
                lat
                lon
                name
                platformCode
              }
            }
          }
        }
      }
    }
  }
`;

export { streetQuery };
