import { graphql } from 'react-relay';

export const legQuery = graphql`
  query LegQuery($id: String!) {
    leg(id: $id) {
      legId: id
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
      alerts {
        alertSeverityLevel
        effectiveStartDate
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
        }
      }
      to {
        vehicleRentalStation {
          availableVehicles {
            total
          }
        }
      }
      realtimeState
    }
  }
`;
