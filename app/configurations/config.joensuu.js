/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';

const CONFIG = 'joensuu';
const APP_TITLE = 'Joensuun reittiopas';
const APP_DESCRIPTION = 'Joensuun uusi reittiopas';

const walttiConfig = require('./config.waltti').default;

export default configMerger(walttiConfig, {
  CONFIG,

  feedIds: ['Joensuu'],

  searchParams: {
    'boundary.rect.min_lat': 61.6,
    'boundary.rect.max_lat': 63.6,
    'boundary.rect.min_lon': 27.1,
    'boundary.rect.max_lon': 31,
  },

  appBarLink: { name: 'Joensuun kaupunki', href: 'http://www.joensuu.fi/' },

  title: APP_TITLE,

  favicon: './app/configurations/images/joensuu/joensuu-favicon.png',

  // Navbar logo
  logo: 'joensuu/jojo-logo.png',

  colors: {
    primary: '#5c4696',
    iconColors: {
      'mode-bus': '#009fe3',
      'mode-rail': '#64be14',
    },
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  areaPolygon: [
    [27.1, 61.6],
    [27.1, 63.6],
    [31.1, 63.6],
    [31.1, 61.6],
  ],

  menu: {
    copyright: { label: `© Joensuun kaupunki ${walttiConfig.YEAR}` },
    content: [
      {
        name: 'about-this-service',
        route: '/tietoja-palvelusta',
      },
      {
        name: 'accessibility-statement',
        href: {
          fi: 'https://www.digitransit.fi/accessibility',
          sv: 'https://www.digitransit.fi/accessibility',
          en: 'https://www.digitransit.fi/en/accessibility',
        },
      },
    ],
  },

  geoJson: {
    layers: [
      {
        name: {
          fi: 'Vyöhykkeet',
          sv: 'Zoner',
          en: 'Zones',
        },
        url: '/assets/geojson/joensuu_zone_lines_20250402.geojson',
      },
    ],
  },

  defaultEndpoint: {
    address: 'Keskusta, Joensuu',
    lat: 62.6024263,
    lon: 29.7569847,
  },

  vehicles: true,
  showVehiclesOnStopPage: true,
  showVehiclesOnItineraryPage: true,

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Tämän palvelun tarjoaa Joensuun kaupunki joukkoliikenteen reittisuunnittelua varten Joensuun alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit-palvelualustaan.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Den här tjänsten erbjuds av Joensuu för reseplanering inom Joensuu region. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'This service is provided by Joensuu city for local route planning in Joensuu region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
        ],
      },
    ],
  },
  zoneIdMapping: {
    1: 'A',
    2: 'B',
    3: 'C',
    4: 'D',
  },
  zones: {
    stops: true,
    itinerary: true,
  },
});
