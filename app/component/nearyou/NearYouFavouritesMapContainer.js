import PropTypes from 'prop-types';
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import distance from '@digitransit-search-util/digitransit-search-util-distance';
import NearYouMap from '../map/NearYouMap';
import {
  vehicleRentalStationShape,
  stopShape,
  stationShape,
  locationShape,
} from '../../util/shapes';

function NearYouFavouritesMapContainer(props) {
  const { stops, stations, vehicleStations, position } = props;
  const stopList = [];
  stopList.push(
    ...stops
      .filter(s => s)
      .map(stop => {
        return {
          type: 'stop',
          node: {
            distance: distance(position, stop),
            place: {
              ...stop,
            },
          },
        };
      }),
  );
  stopList.push(
    ...stations
      .filter(s => s)
      .map(stop => {
        return {
          type: 'station',
          node: {
            distance: distance(position, stop),
            place: {
              ...stop,
            },
          },
        };
      }),
  );
  stopList.push(
    ...vehicleStations
      .filter(s => s)
      .map(stop => {
        return {
          type: 'vehicleRentalStation',
          node: {
            distance: distance(position, stop),
            place: {
              ...stop,
            },
          },
        };
      }),
  );

  stopList.sort((a, b) => a.node.distance - b.node.distance);

  return <NearYouMap {...props} stopsNearYou={stopList} />;
}

NearYouFavouritesMapContainer.propTypes = {
  stops: PropTypes.arrayOf(stopShape).isRequired,
  stations: PropTypes.arrayOf(stationShape).isRequired,
  vehicleStations: PropTypes.arrayOf(vehicleRentalStationShape).isRequired,
  position: locationShape.isRequired,
};

const containerComponent = createFragmentContainer(
  NearYouFavouritesMapContainer,
  {
    stops: graphql`
      fragment NearYouFavouritesMapContainer_stops on Stop
      @relay(plural: true)
      @argumentDefinitions(startTime: { type: "Long!", defaultValue: 0 }) {
        gtfsId
        lat
        lon
        name
        patterns {
          route {
            gtfsId
            shortName
            mode
          }
          code
          directionId
          patternGeometry {
            points
          }
        }
        stoptimesWithoutPatterns(startTime: $startTime, omitNonPickups: true) {
          scheduledArrival
        }
      }
    `,
    stations: graphql`
      fragment NearYouFavouritesMapContainer_stations on Stop
      @relay(plural: true)
      @argumentDefinitions(startTime: { type: "Long!", defaultValue: 0 }) {
        gtfsId
        lat
        lon
        name
        stops {
          patterns {
            route {
              gtfsId
              shortName
              mode
            }
            code
            directionId
            patternGeometry {
              points
            }
          }
        }
        stoptimesWithoutPatterns(startTime: $startTime, omitNonPickups: true) {
          scheduledArrival
        }
      }
    `,
    vehicleStations: graphql`
      fragment NearYouFavouritesMapContainer_vehicleStations on VehicleRentalStation
      @relay(plural: true) {
        name
        lat
        lon
        stationId
      }
    `,
  },
);

export {
  containerComponent as default,
  NearYouFavouritesMapContainer as Component,
};
