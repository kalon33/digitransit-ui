import { graphql } from 'react-relay';

const walkQuery = graphql`
  query WalkQuery(
    $origin: PlanLabeledLocationInput!
    $destination: PlanLabeledLocationInput!
    $walkSpeed: Speed
    $wheelchair: Boolean
  ) {
    plan: planConnection(
      first: 1
      origin: $origin
      destination: $destination
      modes: { directOnly: true, direct: [WALK] }
      preferences: {
        accessibility: { wheelchair: { enabled: $wheelchair } }
        street: { walk: { speed: $walkSpeed } }
      }
    ) {
      edges {
        node {
          legs {
            ...ItineraryLine_legs
          }
        }
      }
    }
  }
`;

export { walkQuery };
