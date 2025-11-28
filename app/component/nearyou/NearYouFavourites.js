import PropTypes from 'prop-types';
import React from 'react';
import { graphql, QueryRenderer, ReactRelayContext } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import {
  locationShape,
  relayShape,
  stopShape,
  stationShape,
  vehicleRentalStationShape,
} from '../../util/shapes';
import NearYouFavouritesContainer from './NearYouFavouritesContainer';
import withBreakpoint from '../../util/withBreakpoint';
import Loading from '../Loading';

function NearYouFavourites({
  favouriteStops,
  favouriteStations,
  favouriteVehicleRentalStationIds,
  relayEnvironment,
  searchPosition,
  breakpoint,
  noFavourites,
  isParentTabActive,
  currentTime,
}) {
  if (noFavourites) {
    return (
      <div className="no-favourites-container">
        {breakpoint !== 'large' && (
          <div className="no-favourites-header">
            <FormattedMessage id="nearest-favourites" />
          </div>
        )}
        <div className="no-favourites-content">
          <FormattedMessage id="nearest-favourites-no-favourites" />
        </div>
        <img
          className="instruction-image"
          src={`/img/nearby-stop_${
            breakpoint === 'large' ? 'desktop-' : ''
          }animation.gif`}
          alt="Käyttöohje"
        />
        <FormattedMessage id="nearest-favourites-browse-stops" />
      </div>
    );
  }
  return (
    <QueryRenderer
      query={graphql`
        query NearYouFavouritesQuery(
          $stopIds: [String!]!
          $stationIds: [String!]!
          $vehicleRentalStationIds: [String!]!
        ) {
          stops: stops(ids: $stopIds) {
            ...NearYouFavouritesContainer_stops
          }
          stations: stations(ids: $stationIds) {
            ...NearYouFavouritesContainer_stations
          }
          vehicleStations: vehicleRentalStations(
            ids: $vehicleRentalStationIds
          ) {
            ...NearYouFavouritesContainer_vehicleStations
          }
        }
      `}
      variables={{
        stopIds: favouriteStops || [],
        stationIds: favouriteStations || [],
        vehicleRentalStationIds: favouriteVehicleRentalStationIds || [],
      }}
      environment={relayEnvironment}
      render={({ props }) => {
        if (props) {
          return (
            <NearYouFavouritesContainer
              searchPosition={searchPosition}
              stops={props.stops}
              stations={props.stations}
              vehicleStations={props.vehicleStations}
              isParentTabActive={isParentTabActive}
              currentTime={currentTime}
            />
          );
        }
        return <Loading />;
      }}
    />
  );
}
NearYouFavourites.propTypes = {
  favouriteStops: PropTypes.arrayOf(PropTypes.string),
  favouriteStations: PropTypes.arrayOf(PropTypes.string),
  favouriteVehicleRentalStationIds: PropTypes.arrayOf(PropTypes.string),
  relayEnvironment: relayShape.isRequired,
  searchPosition: locationShape.isRequired,
  stops: PropTypes.arrayOf(stopShape),
  stations: PropTypes.arrayOf(stationShape),
  vehicleStations: PropTypes.arrayOf(vehicleRentalStationShape),
  breakpoint: PropTypes.string,
  noFavourites: PropTypes.bool,
  isParentTabActive: PropTypes.bool,
  currentTime: PropTypes.number.isRequired,
};

NearYouFavourites.defaultProps = {
  favouriteStops: undefined,
  favouriteStations: undefined,
  favouriteVehicleRentalStationIds: undefined,
  stops: undefined,
  stations: undefined,
  vehicleStations: undefined,
  breakpoint: undefined,
  noFavourites: false,
  isParentTabActive: false,
};

const NearYouFavouritesWithBreakpoint = withBreakpoint(props => (
  <ReactRelayContext.Consumer>
    {({ environment }) => (
      <NearYouFavourites {...props} relayEnvironment={environment} />
    )}
  </ReactRelayContext.Consumer>
));

export default NearYouFavouritesWithBreakpoint;
