import Relay from 'react-relay/classic';
import get from 'lodash/get';
import isString from 'lodash/isString';
import take from 'lodash/take';
import orderBy from 'lodash/orderBy';
import sortBy from 'lodash/sortBy';
import debounce from 'lodash/debounce';
import flatten from 'lodash/flatten';
import merge from 'lodash/merge';
import unorm from 'unorm';

import { getJson } from './xhrPromise';
import routeCompare from './route-compare';
import { distance } from './geo-utils';
import { uniqByLabel, isStop } from './suggestionUtils';
import mapPeliasModality from './pelias-to-modality-mapper';
import { PREFIX_ROUTES } from '../util/path';

/**
 * LayerType depicts the type of the point-of-interest.
 */
const LayerType = {
  Address: 'address',
  CurrentPosition: 'currentPosition',
  FavouriteStop: 'favouriteStop',
  FavouriteStation: 'favouriteStation',
  FavouritePlace: 'favouritePlace',
  Station: 'station',
  Stop: 'stop',
  Street: 'street',
  Venue: 'venue',
};

/**
 * SearchType depicts the type of the search.
 */
const SearchType = {
  All: 'all',
  Endpoint: 'endpoint',
  Search: 'search',
};

function getRelayQuery(query) {
  return new Promise((resolve, reject) => {
    const callback = readyState => {
      if (readyState.error) {
        reject(readyState.error);
      } else if (readyState.done) {
        resolve(Relay.Store.readQuery(query));
      }
    };

    Relay.Store.primeCache({ query }, callback);
  });
}

const mapRoute = item => ({
  type: 'Route',
  properties: {
    ...item,
    layer: `route-${item.mode}`,
    link: `/${PREFIX_ROUTES}/${item.gtfsId}/pysakit/${item.patterns[0].code}`,
  },
  geometry: {
    coordinates: null,
  },
});

function filterMatchingToInput(list, Input, fields) {
  if (typeof Input === 'string' && Input.length > 0) {
    const input = Input.toLowerCase().trim();

    return list.filter(item => {
      let parts = [];
      fields.forEach(pName => {
        let value = get(item, pName);

        if ((pName === 'properties.label' || pName === 'address') && value) {
          // special case: drop last parts i.e. city and neighbourhood
          value = value.split(',');
          if (value.length > 2) {
            value.splice(value.length - 2, 2);
          } else if (value.length > 1) {
            value.splice(value.length - 1, 1);
          }
          value = value.join();
        }
        if (value) {
          parts = parts.concat(
            value
              .toLowerCase()
              .replace(/,/g, ' ')
              .split(' '),
          );
        }
      });
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].indexOf(input) === 0) {
          // accept match only at word start
          return true;
        }
      }
      return false;
    });
  }

  return list;
}

function getCurrentPositionIfEmpty(input, position) {
  if (typeof input !== 'string' || input.length === 0) {
    return Promise.resolve([
      {
        type: 'CurrentLocation',
        address: position.address,
        lat: position.lat,
        lon: position.lon,
        properties: {
          labelId: 'use-own-position',
          layer: 'currentPosition',
          address: position.address,
          lat: position.lat,
          lon: position.lon,
        },
      },
    ]);
  }

  return Promise.resolve([]);
}

function getOldSearches(oldSearches, input, dropLayers) {
  let matchingOldSearches = filterMatchingToInput(oldSearches, input, [
    'properties.name',
    'properties.label',
    'properties.address',
    'properties.shortName',
    'properties.longName',
  ]);

  if (dropLayers) {
    // don't want these
    matchingOldSearches = matchingOldSearches.filter(
      item => !dropLayers.includes(item.properties.layer),
    );
  }

  return Promise.resolve(
    take(matchingOldSearches, 10).map(item => {
      const newItem = {
        ...item,
        type: 'OldSearch',
        timetableClicked: false, // reset latest selection action
      };
      delete newItem.properties.confidence;
      return newItem;
    }),
  );
}

function getFavouriteLocations(favourites, input) {
  return Promise.resolve(
    orderBy(
      filterMatchingToInput(favourites, input, ['address', 'locationName']),
      feature => feature.locationName,
    ).map(item => ({
      type: 'FavouritePlace',
      properties: {
        ...item,
        label: item.locationName,
        layer: 'favouritePlace',
      },
      geometry: { type: 'Point', coordinates: [item.lon, item.lat] },
    })),
  );
}

export function getGeocodingResult(
  _text,
  searchParams,
  lang,
  focusPoint,
  sources,
  config,
) {
  const text = _text ? _text.trim() : null;
  if (
    text === undefined ||
    text === null ||
    text.length < 1 ||
    (config.search &&
      config.search.minimalRegexp &&
      !config.search.minimalRegexp.test(text))
  ) {
    return Promise.resolve([]);
  }

  let opts = { text, ...searchParams, ...focusPoint, lang };
  if (sources) {
    opts = { ...opts, sources };
  }

  return getJson(config.URL.PELIAS, opts)
    .then(res =>
      orderBy(res.features, feature => feature.properties.confidence, 'desc'),
    )
    .then(features => mapPeliasModality(features, config));
}

function getFavouriteRoutes(favourites, input) {
  const query = Relay.createQuery(
    Relay.QL`
    query favouriteRoutes($ids: [String!]!) {
      routes(ids: $ids ) {
        gtfsId
        agency { name }
        shortName
        mode
        longName
        patterns { code }
      }
    }`,
    { ids: favourites },
  );

  return getRelayQuery(query)
    .then(favouriteRoutes => favouriteRoutes.map(mapRoute))
    .then(routes =>
      routes.map(favourite => ({
        ...favourite,
        properties: { ...favourite.properties, layer: 'favouriteRoute' },
        type: 'FavouriteRoute',
      })),
    )
    .then(routes =>
      filterMatchingToInput(routes, input, [
        'properties.shortName',
        'properties.longName',
      ]),
    )
    .then(routes =>
      routes.sort((x, y) => routeCompare(x.properties, y.properties)),
    );
}

function getFavouriteStops(favourites, input, origin) {
  // Currently we're updating only stops as there isn't suitable query for stations
  const stopQuery = Relay.createQuery(
    Relay.QL`
    query favouriteStops($ids: [String!]!) {
      stops(ids: $ids ) {
        gtfsId
        lat
        lon
        name
        code
      }
    }`,
    { ids: favourites.map(item => item.gtfsId) },
  );

  const stationQuery = Relay.createQuery(
    Relay.QL`
    query favouriteStations($ids: [String!]!) {
      stations(ids: $ids ) {
        gtfsId
        lat
        lon
        name
      }
    }`,
    { ids: favourites.map(item => item.gtfsId) },
  );

  const refLatLng = origin &&
    origin.lat &&
    origin.lon && { lat: origin.lat, lng: origin.lon };

  return getRelayQuery(stopQuery)
    .then(stops =>
      getRelayQuery(stationQuery).then(stations =>
        merge(stops, stations, favourites).map(stop => ({
          type: 'FavouriteStop',
          properties: {
            ...stop,
            label: stop.locationName,
            layer: isStop(stop) ? 'favouriteStop' : 'favouriteStation',
          },
          geometry: {
            coordinates: [stop.lon, stop.lat],
          },
        })),
      ),
    )
    .then(stops =>
      filterMatchingToInput(stops, input, [
        'properties.locationName',
        'properties.name',
        'properties.address',
      ]),
    )
    .then(
      stops =>
        refLatLng
          ? sortBy(stops, stop =>
              distance(refLatLng, {
                lat: stop.lat,
                lng: stop.lon,
              }),
            )
          : stops,
    );
}

function getRoutes(input, config) {
  if (typeof input !== 'string' || input.trim().length === 0) {
    return Promise.resolve([]);
  }
  const number = input.match(/^\d+$/);
  if (number && number[0].length > 3) {
    return Promise.resolve([]);
  }

  const query = Relay.createQuery(
    Relay.QL`
    query routes($name: String) {
      viewer {
        routes(name: $name ) {
          gtfsId
          agency {name}
          shortName
          mode
          longName
          patterns { code }
        }
      }
    }`,
    { name: input },
  );

  return getRelayQuery(query)
    .then(data =>
      data[0].routes
        .filter(
          item =>
            config.feedIds === undefined ||
            config.feedIds.indexOf(item.gtfsId.split(':')[0]) > -1,
        )
        .map(mapRoute)
        .sort((x, y) => routeCompare(x.properties, y.properties)),
    )
    .then(suggestions => take(suggestions, 10));
}

export const getAllEndpointLayers = () => [
  'CurrentPosition',
  'FavouritePlace',
  'FavouriteStop',
  'OldSearch',
  'Geocoding',
  'Stops',
];

/**
 * Helper function to sort the results. Orders as follows:
 *  - current position first for an empty search
 *  - matching routes first
 *  - otherwise by confidence, except that:
 *    - boost well matching stations (especially from GTFS)
 *    - rank stops lower as they tend to occupy most of the search results
 *  - items with no confidence (old searches and favorites):
 *    - rank favourites better than ordinary old searches
 *    - if perfect match at start, assign high confidence
 *    - if not as above, put to the end of list in layer-ranked order
 * @param {*[]} results The search results that were received
 * @param {String} term The search term that was used
 */
export const sortSearchResults = (config, results, term = '') => {
  if (!Array.isArray(results)) {
    return results;
  }

  const isLineIdentifier = value =>
    isString(value) &&
    config.search &&
    config.search.lineRegexp &&
    config.search.lineRegexp.test(value);

  const normalize = str => {
    if (!isString(str)) {
      return '';
    }
    const lowerCaseStr = str.toLowerCase();
    return `${(lowerCaseStr.normalize
      ? lowerCaseStr.normalize('NFD')
      : unorm.nfd(lowerCaseStr)
    ).replace(/[\u0300-\u036f]/g, '')}`;
  };

  const matchProps = ['name', 'label', 'address', 'shortName'];

  const isMatch = (t, props) =>
    t.length > 0 &&
    matchProps
      .map(v => props[v])
      .filter(v => v && v.length > 0 && normalize(v).indexOf(t) === 0).length >
      0;

  const normalizedTerm = normalize(term);
  const isLineSearch = isLineIdentifier(normalizedTerm);

  const orderedResults = orderBy(
    results,
    [
      // rank matching routes best
      result =>
        isLineSearch &&
        isLineIdentifier(normalize(result.properties.shortName)) &&
        normalize(result.properties.shortName).indexOf(normalizedTerm) === 0
          ? 2
          : 0,

      result => {
        let layerRank;
        switch (result.properties.layer) {
          case LayerType.CurrentPosition:
            layerRank = 1;
            break;
          case LayerType.FavouriteStation:
            layerRank = 0.9;
            break;
          case LayerType.Station: {
            if (
              isString(result.properties.source) &&
              result.properties.source.indexOf('gtfs') === 0
            ) {
              layerRank = 0.8;
            } else {
              layerRank = 0.7;
            }
            break;
          }
          case LayerType.FavouritePlace:
            layerRank = 0.6;
            break;
          case LayerType.FavouriteStop:
            layerRank = 0.5;
            break;
          case LayerType.Stop:
            layerRank = 0.3;
            break;
          default:
            // venue, address, street, route-xxx
            layerRank = 0.4;
        }
        if (normalizedTerm.length === 0) {
          // Doing search with empty string.
          // No confidence to macth, so use ranked old searches and favourites
          return layerRank;
        }

        // must handle a mixup of geocoder searches and items above
        // Normal confidence range from geocoder is about 0.3 .. 1
        const { confidence } = result.properties;
        if (!confidence) {
          // not from geocoder, estimate confidence ourselves
          if (isMatch(normalizedTerm, result.properties)) {
            return 1 + layerRank; // put previously used stuff above new geocoding
          }
          return 0.3 * layerRank; // not so good match, put to the end
        }

        // geocoded items with confidence, just adjust a little
        switch (result.properties.layer) {
          case LayerType.Station: {
            const boost =
              result.properties.source.indexOf('gtfs') === 0 ? 0.05 : 0.01;
            return Math.min(confidence + boost, 1);
          }
          case LayerType.Stop:
            return confidence - 0.1;
          default:
            return confidence;
        }
      },
    ],
    ['desc', 'desc', 'desc'],
  );
  return orderedResults;
};

export function executeSearchImmediate(
  getStore,
  refPoint,
  { input, type, layers, config },
  callback,
) {
  const position = getStore('PositionStore').getLocationState();
  const endpointSearches = { type: 'endpoint', term: input, results: [] };
  const searchSearches = { type: 'search', term: input, results: [] };

  let endpointSearchesPromise;
  let searchSearchesPromise;
  const endpointLayers = layers || getAllEndpointLayers();

  if (type === SearchType.Endpoint || type === SearchType.All) {
    const favouriteLocations = getStore(
      'FavouriteLocationStore',
    ).getLocations();
    const oldSearches = getStore('OldSearchesStore').getOldSearches('endpoint');
    const favouriteStops = getStore('FavouriteStopsStore').getStops();
    const language = getStore('PreferencesStore').getLanguage();
    const searchComponents = [];

    if (
      endpointLayers.includes('CurrentPosition') &&
      position.status !== 'geolocation-not-supported'
    ) {
      searchComponents.push(getCurrentPositionIfEmpty(input, position));
    }
    if (endpointLayers.includes('FavouritePlace')) {
      searchComponents.push(getFavouriteLocations(favouriteLocations, input));
    }
    if (endpointLayers.includes('FavouriteStop')) {
      searchComponents.push(getFavouriteStops(favouriteStops, input, refPoint));
    }
    if (endpointLayers.includes('OldSearch')) {
      const dropLayers = ['currentPosition'];
      // old searches should also obey the layers definition
      if (!endpointLayers.includes('FavouritePlace')) {
        dropLayers.push('favouritePlace');
      }
      searchComponents.push(getOldSearches(oldSearches, input, dropLayers));
    }

    if (endpointLayers.includes('Geocoding')) {
      const focusPoint =
        config.autoSuggest.locationAware && position.hasLocation
          ? {
              // Round coordinates to approx 1 km, in order to improve caching
              'focus.point.lat': position.lat.toFixed(2),
              'focus.point.lon': position.lon.toFixed(2),
            }
          : {};

      const sources = get(config, 'searchSources', '').join(',');

      searchComponents.push(
        getGeocodingResult(
          input,
          config.searchParams,
          language,
          focusPoint,
          sources,
          config,
        ),
      );
    }

    if (endpointLayers.includes('Stops')) {
      const focusPoint =
        config.autoSuggest.locationAware && position.hasLocation
          ? {
              // Round coordinates to approx 1 km, in order to improve caching
              'focus.point.lat': position.lat.toFixed(2),
              'focus.point.lon': position.lon.toFixed(2),
            }
          : {};
      const sources = get(config, 'feedIds', [])
        .map(v => `gtfs${v}`)
        .join(',');

      if (sources) {
        searchComponents.push(
          getGeocodingResult(
            input,
            undefined,
            language,
            focusPoint,
            sources,
            config,
          ),
        );
      }
    }

    endpointSearchesPromise = Promise.all(searchComponents)
      .then(resultsArray => {
        if (
          endpointLayers.includes('Stops') &&
          endpointLayers.includes('Geocoding')
        ) {
          // sort & combine pelias results into single array
          const modifiedResultsArray = [];
          for (let i = 0; i < resultsArray.length - 2; i++) {
            modifiedResultsArray.push(resultsArray[i]);
          }
          const sorted = orderBy(
            resultsArray[resultsArray.length - 1].concat(
              resultsArray[resultsArray.length - 2],
            ),
            [u => u.properties.confidence],
            ['desc'],
          );
          modifiedResultsArray.push(sorted);
          return modifiedResultsArray;
        }
        return resultsArray;
      })
      .then(flatten)
      .then(uniqByLabel)
      .then(results => {
        endpointSearches.results = results;
      })
      .catch(err => {
        endpointSearches.error = err;
      });

    if (type === SearchType.Endpoint) {
      endpointSearchesPromise.then(() =>
        callback({
          ...endpointSearches,
          results: sortSearchResults(config, endpointSearches.results, input),
        }),
      );
      return;
    }
  }

  if (type === SearchType.Search || type === SearchType.All) {
    const oldSearches = getStore('OldSearchesStore').getOldSearches('search');
    const favouriteRoutes = getStore('FavouriteRoutesStore').getRoutes();

    searchSearchesPromise = Promise.all([
      getFavouriteRoutes(favouriteRoutes, input),
      getOldSearches(oldSearches, input),
      getRoutes(input, config),
    ])
      .then(flatten)
      .then(uniqByLabel)
      .then(results => {
        searchSearches.results = results;
      })
      .catch(err => {
        searchSearches.error = err;
      });

    if (type === 'search') {
      searchSearchesPromise.then(() => {
        callback({
          ...searchSearches,
          results: sortSearchResults(config, searchSearches.results, input),
        });
      });
      return;
    }
  }

  Promise.all([endpointSearchesPromise, searchSearchesPromise]).then(() => {
    const results = [];
    if (endpointSearches && Array.isArray(endpointSearches.results)) {
      results.push(...endpointSearches.results);
    }
    if (searchSearches && Array.isArray(searchSearches.results)) {
      results.push(...searchSearches.results);
    }
    callback({
      results: sortSearchResults(config, results, input),
    });
  });
}

const debouncedSearch = debounce(executeSearchImmediate, 300, {
  leading: true,
});

export const executeSearch = (getStore, refPoint, data, callback) => {
  callback(null); // This means 'we are searching'
  debouncedSearch(getStore, refPoint, data, callback);
};

export const withCurrentTime = (getStore, location) => {
  const query = (location && location.query) || {};

  return {
    ...location,
    query: {
      ...query,
      time: query.time
        ? query.time
        : getStore('TimeStore')
            .getCurrentTime()
            .unix(),
    },
  };
};
