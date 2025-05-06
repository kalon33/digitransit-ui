import { graphql } from 'react-relay';

export const LegAgencyInfoLeg = graphql`
  fragment LegAgencyInfoLeg on Leg {
    agency {
      name
      url
      fareUrl
    }
  }
`;
