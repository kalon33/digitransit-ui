import { expect } from 'chai';
import { describe, it } from 'mocha';
import { createMemoryHistory } from 'react-router';

import defaultConfig from '../../app/configurations/config.default';
import { getDefaultModes } from '../../app/util/modeUtils';
import * as utils from '../../app/util/queryUtils';

describe('queryUtils', () => {
  describe('getIntermediatePlaces', () => {
    it('should return an empty array for missing query', () => {
      const query = null;
      const result = utils.getIntermediatePlaces(query);
      expect(Array.isArray(result)).to.equal(true);
      expect(result.length).to.equal(0);
    });

    it('should return an empty array for missing intermediatePlaces', () => {
      const query = {};
      const result = utils.getIntermediatePlaces(query);
      expect(Array.isArray(result)).to.equal(true);
      expect(result.length).to.equal(0);
    });

    it('should return an empty array for whitespace intermediatePlaces', () => {
      const query = {
        intermediatePlaces: ' ',
      };
      const result = utils.getIntermediatePlaces(query);
      expect(Array.isArray(result)).to.equal(true);
      expect(result.length).to.equal(0);
    });

    it('should return a location parsed from a string-mode intermediatePlaces', () => {
      const query = {
        intermediatePlaces: 'Kera, Espoo::60.217992,24.75494',
      };
      const result = utils.getIntermediatePlaces(query);
      expect(Array.isArray(result)).to.equal(true);
      expect(result.length).to.equal(1);
      expect(result[0].address).to.equal('Kera, Espoo');
      expect(result[0].lat).to.equal(60.217992);
      expect(result[0].lon).to.equal(24.75494);
    });

    it('should return locations parsed from an array-mode intermediatePlaces', () => {
      const query = {
        intermediatePlaces: [
          'Kera, Espoo::60.217992,24.75494',
          'Leppävaara, Espoo::60.219235,24.81329',
        ],
      };
      const result = utils.getIntermediatePlaces(query);
      expect(Array.isArray(result)).to.equal(true);
      expect(result.length).to.equal(2);
      expect(result[0].address).to.equal('Kera, Espoo');
      expect(result[0].lat).to.equal(60.217992);
      expect(result[0].lon).to.equal(24.75494);
      expect(result[1].address).to.equal('Leppävaara, Espoo');
      expect(result[1].lat).to.equal(60.219235);
      expect(result[1].lon).to.equal(24.81329);
    });

    it('should return an empty array if intermediatePlaces is neither a string nor an array', () => {
      const query = {
        intermediatePlaces: {},
      };
      const result = utils.getIntermediatePlaces(query);
      expect(Array.isArray(result)).to.equal(true);
      expect(result.length).to.equal(0);
    });
  });

  describe('setIntermediatePlaces', () => {
    it('should not modify the query if the parameter is neither a string nor an array', () => {
      const router = createMemoryHistory();
      utils.setIntermediatePlaces(router, {});
      const { intermediatePlaces } = router.getCurrentLocation().query;
      expect(intermediatePlaces).to.equal(undefined);
    });

    it('should not modify the query if the parameter is an array but not a string array', () => {
      const router = createMemoryHistory();
      const intermediatePlaces = [
        {
          lat: 60.217992,
          lon: 24.75494,
          address: 'Kera, Espoo',
        },
        {
          lat: 60.219235,
          lon: 24.81329,
          address: 'Leppävaara, Espoo',
        },
      ];

      utils.setIntermediatePlaces(router, intermediatePlaces);

      expect(router.getCurrentLocation().query.intermediatePlaces).to.equal(
        undefined,
      );
    });

    it('should modify the query if the parameter is a string', () => {
      const router = createMemoryHistory();
      const intermediatePlace = 'Kera, Espoo::60.217992,24.75494';

      utils.setIntermediatePlaces(router, intermediatePlace);

      expect(router.getCurrentLocation().query.intermediatePlaces).to.equal(
        intermediatePlace,
      );
    });

    it('should modify the query if the parameter is a string array', () => {
      const router = createMemoryHistory();
      const intermediatePlaces = [
        'Kera, Espoo::60.217992,24.75494',
        'Leppävaara, Espoo::60.219235,24.81329',
      ];

      utils.setIntermediatePlaces(router, intermediatePlaces);

      expect(
        router.getCurrentLocation().query.intermediatePlaces,
      ).to.deep.equal(intermediatePlaces);
    });
  });

  describe('getQuerySettings', () => {
    it('should return an empty set if there is no query', () => {
      const query = undefined;
      const result = utils.getQuerySettings(query);
      expect(result).to.deep.equal({});
    });

    it('should return all elements from the default settings', () => {
      const defaultSettings = { ...defaultConfig.defaultSettings };
      const defaultModes = getDefaultModes(defaultConfig);
      const query = { ...defaultSettings, modes: defaultModes };
      const result = utils.getQuerySettings(query);
      expect(result).to.deep.equal(query);
    });

    it('should return numeric values when appropriate', () => {
      const query = {
        bikeSpeed: '5',
      };
      const result = utils.getQuerySettings(query);
      expect(result.bikeSpeed).to.equal(5);
    });

    it('should completely omit missing values', () => {
      const query = {
        optimize: 'QUICK',
        minTransferTime: '120',
      };
      const result = utils.getQuerySettings(query);
      expect(Object.keys(result)).to.have.lengthOf(2);
    });

    it('should return comma-separated lists as arrays', () => {
      const query = {
        modes: 'BUS,WALK',
        preferredRoutes: 'a,b,c',
        unpreferredRoutes: 'd,e,f',
      };
      const result = utils.getQuerySettings(query);
      expect(result.modes).to.deep.equal(['BUS', 'WALK']);
      expect(result.preferredRoutes).to.deep.equal(['a', 'b', 'c']);
      expect(result.unpreferredRoutes).to.deep.equal(['d', 'e', 'f']);
    });
  });

  describe('addPreferredRoute', () => {
    it('should add a route as a preferred option', () => {
      const routeToAdd = 'HSL__1052';
      const router = createMemoryHistory();
      utils.addPreferredRoute(router, routeToAdd);
      expect(router.getCurrentLocation().query).to.deep.equal({
        preferredRoutes: routeToAdd,
      });
    });

    it('should not add the same route as a preferred option twice', () => {
      const routeToAdd = 'HSL__1052';
      const router = createMemoryHistory();
      utils.addPreferredRoute(router, routeToAdd);
      utils.addPreferredRoute(router, routeToAdd);
      expect(router.getCurrentLocation().query).to.deep.equal({
        preferredRoutes: routeToAdd,
      });
    });

    it('should add multiple routes as preferred options', () => {
      const router = createMemoryHistory();
      utils.addPreferredRoute(router, 'HSL__1052');
      utils.addPreferredRoute(router, 'HSL__7480');
      expect(router.getCurrentLocation().query).to.deep.equal({
        preferredRoutes: 'HSL__1052,HSL__7480',
      });
    });
  });

  describe('addUnpreferredRoute', () => {
    it('should add a route as an unpreferred option', () => {
      const routeToAdd = 'HSL__1052';
      const router = createMemoryHistory();
      utils.addUnpreferredRoute(router, routeToAdd);
      expect(router.getCurrentLocation().query).to.deep.equal({
        unpreferredRoutes: routeToAdd,
      });
    });

    it('should not add the same route as an unpreferred option twice', () => {
      const routeToAdd = 'HSL__1052';
      const router = createMemoryHistory();
      utils.addUnpreferredRoute(router, routeToAdd);
      utils.addUnpreferredRoute(router, routeToAdd);
      expect(router.getCurrentLocation().query).to.deep.equal({
        unpreferredRoutes: routeToAdd,
      });
    });

    it('should add multiple routes as unpreferred options', () => {
      const router = createMemoryHistory();
      utils.addUnpreferredRoute(router, 'HSL__1052');
      utils.addUnpreferredRoute(router, 'HSL__7480');
      expect(router.getCurrentLocation().query).to.deep.equal({
        unpreferredRoutes: 'HSL__1052,HSL__7480',
      });
    });
  });

  describe('removePreferredRoute', () => {
    it('should remove a preferred route option', () => {
      const router = createMemoryHistory();
      utils.addPreferredRoute(router, 'HSL__1052');
      utils.removePreferredRoute(router, 'HSL__1052');
      expect(router.getCurrentLocation().query).to.deep.equal({});
    });

    it('should ignore a missing preferred route', () => {
      const router = createMemoryHistory();
      utils.addPreferredRoute(router, 'HSL__1052');
      utils.removePreferredRoute(router, 'foobar');
      expect(router.getCurrentLocation().query).to.deep.equal({
        preferredRoutes: 'HSL__1052',
      });
    });
  });

  describe('removeUnpreferredRoute', () => {
    it('should remove a Unpreferred route option', () => {
      const router = createMemoryHistory();
      utils.addUnpreferredRoute(router, 'HSL__1052');
      utils.removeUnpreferredRoute(router, 'HSL__1052');
      expect(router.getCurrentLocation().query).to.deep.equal({});
    });

    it('should ignore a missing Unpreferred route', () => {
      const router = createMemoryHistory();
      utils.addUnpreferredRoute(router, 'HSL__1052');
      utils.removeUnpreferredRoute(router, 'foobar');
      expect(router.getCurrentLocation().query).to.deep.equal({
        unpreferredRoutes: 'HSL__1052',
      });
    });
  });

  describe('clearQueryParams', () => {
    it('should remove only given parameters', () => {
      const router = createMemoryHistory();
      router.replace({
        query: {
          foo: 'bar',
          bar: 'baz',
        },
      });
      utils.clearQueryParams(router, 'foo');
      expect(router.getCurrentLocation().query).to.deep.equal({
        bar: 'baz',
      });
    });
  });
});
