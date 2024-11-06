import { graphql } from 'react-relay';

const legQuery = graphql`
  query LegQuery($id: String!) {
    leg(id: $id) {
      id
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

// eslint-disable-next-line import/prefer-default-export
export { legQuery };
