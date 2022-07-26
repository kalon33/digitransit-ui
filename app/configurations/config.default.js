/* eslint-disable prefer-template */
import safeJsonParse from '../util/safeJsonParser';
import { BIKEAVL_WITHMAX } from '../util/citybikes';

const CONFIG = process.env.CONFIG || 'default';
const API_URL = process.env.API_URL || 'https://paris.acolytesanonymes.org';
const GEOCODING_BASE_URL = `https://api.geocode.earth/v1`;
//const GEOCODING_BASE_URL = `https://pelias.badabam.net/v1`;
//const MAP_URL = process.env.MAP_URL || 'https://{s}-dev-api.digitransit.fi';
const MAP_URL =
  process.env.MAP_URL || 'https://digitransit-dev-cdn-origin.azureedge.net';
const APP_PATH = process.env.APP_CONTEXT || '';
const { SENTRY_DSN } = process.env;
const PORT = process.env.PORT || 7812;
const APP_DESCRIPTION = 'Planificateur d\'itinéraires Digitransit for Paris';
const OTP_TIMEOUT = process.env.OTP_TIMEOUT || 15000; // 10k is the current server default
const YEAR = 1900 + new Date().getYear();
const realtime = require('./realtimeUtils').default;

const REALTIME_PATCH = safeJsonParse(process.env.REALTIME_PATCH) || {};

export default {
  SENTRY_DSN,
  PORT,
  CONFIG,
  OTPTimeout: OTP_TIMEOUT,
  URL: {
    API_URL,
    ASSET_URL: process.env.ASSET_URL,
    MAP_URL,
    OTP: process.env.OTP_URL || `https://paris.acolytesanonymes.org/otp/routers/merged/`,
    MAP: {
      default: `https://{s}.tile.thunderforest.com/transport/`,
//      default: `https://{s}.tile.openstreetmap.org/`,
    },
    STOP_MAP: ``,
    CITYBIKE_MAP: ``,
    ALERTS: process.env.ALERTS_URL || `https://stif.spiralo.net/STIF_ALERTS`,
    FONT:
      'https://fonts.googleapis.com/css?family=Lato:300,400,900%7CPT+Sans+Narrow:400,700',
//    REALTIME:
//      process.env.VEHICLE_URL || ``,
    PELIAS: `https://api.geocode.earth/v1/search?api_key=ge-75839918737b683b&boundary.country=fr`,
    PELIAS_REVERSE_GEOCODER: `https://api.geocode.earth/v1/reverse?api_key=ge-75839918737b683b`,
//    PELIAS: `${process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL}/search`,
//    PELIAS_REVERSE_GEOCODER: `${process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL}/reverse`,
    PELIAS_PLACE: `https://api.geocode.earth/v1/place?api_key=ge-75839918737b683b`,

    ROUTE_TIMETABLES: {
      HSL: `${API_URL}/timetables/v1/hsl/routes/`,
      tampere: 'http://nysse.fi/media/aikataulut/',
    },
    STOP_TIMETABLES: {
      HSL: `${API_URL}/timetables/v1/hsl/stops/`,
      tampere: 'https://www.tampere.fi/ekstrat/ptdata/pdf/',
    },
  },

  APP_PATH: `${APP_PATH}`,
  title: 'Digitransit for Paris',

  textLogo: false,
  // Navbar logo
  logo: 'default/digitransit-logo.png',

  contactName: {
    sv: 'Digitransit',
    fi: 'Digitransit',
    default: "Kalon33",
  },

  // Default labels for manifest creation
  name: 'Digitransit beta',
  shortName: 'Digitransit',

  searchParams: {},
  feedIds: ['1', '2', '3', '4', '5'],

  realTime: realtime,
  realTimePatch: REALTIME_PATCH,

  // Google Tag Manager id
  GTMid: process.env.GTM_ID || null,

  /*
   * by default search endpoints from all but gtfs sources, correct gtfs source
   * figured based on feedIds config variable
   */
  searchSources: ['oa', 'osm'],

  search: {
    suggestions: {
      useTransportIcons: true,
    },
    usePeliasStops: false,
    mapPeliasModality: false,
    peliasMapping: {},
    peliasLayer: null,
    peliasLocalization: null,
    minimalRegexp: new RegExp('.{2,}'),
  },

  nearbyRoutes: {
    radius: 10000,
    bucketSize: 1000,
  },

  defaultSettings: {
    accessibilityOption: 0,
    bikeSpeed: 5,
    minTransferTime: 120,
    optimize: 'QUICK',
    preferredRoutes: [],
    ticketTypes: 'none',
    transferPenalty: 0,
    unpreferredRoutes: [],
    walkBoardCost: 600,
    walkReluctance: 2,
    walkSpeed: 1.2,
  },

  /**
   * These are used for dropdown selection of values to override the default
   * settings. This means that values ought to be relative to the current default.
   * If not, the selection may not make any sense.
   */
  defaultOptions: {
    walkBoardCost: {
      least: 3600,
      less: 1200,
      more: 360,
      most: 120,
    },
    walkReluctance: {
      least: 5,
      less: 3,
      more: 1,
      most: 0.2,
    },
  },

  quickOptions: {
    public_transport: {
      availableOptionSets: [
        'least-transfers',
        'least-walking',
        'public-transport-with-bicycle',
        'saved-settings',
      ],
    },
    walk: {
      availableOptionSets: ['prefer-walking-routes', 'saved-settings'],
    },
    bicycle: {
      availableOptionSets: [
        'least-elevation-changes',
        'prefer-greenways',
        'saved-settings',
      ],
    },
    car_park: {
      availableOptionSets: [
        'least-transfers',
        'least-walking',
        'saved-settings',
      ],
    },
  },

  maxWalkDistance: 10000,
  maxBikingDistance: 100000,
  useUnpreferredRoutesPenalty: 1200, // adds 10 minute (weight) penalty to routes that are unpreferred
  availableLanguages: ['fr', 'en', 'es', 'de', 'fi', 'sv', 'nb', 'da', 'ro'],
  defaultLanguage: 'fr',
  itineraryFiltering: 1.5, // drops 66% worse routes
 // availableLanguages: ['fi', 'sv', 'en', 'fr', 'nb', 'de', 'da', 'es', 'ro'],
  // This timezone data will expire on 31.12.2020
    timezoneData: 'Europe/Paris|PMT WET WEST CEST CET WEMT|-9.l 0 -10 -20 -10 -20|0121212121212121212121212121212121212121212121212123434352543434343434343434343434343434343434343434343434343434343434343434343434343434343434343434343434343434343434343434343434343434|-2nco8.l cNb8.l HA0 19A0 1iM0 11c0 1oo0 Wo0 1rc0 QM0 1EM0 UM0 1u00 10o0 1io0 1wo0 Rc0 1a00 1fA0 1cM0 1cM0 1io0 17c0 1fA0 1a00 1io0 1a00 1io0 17c0 1fA0 1a00 1io0 17c0 1cM0 1cM0 1a00 1io0 1cM0 1cM0 1a00 1fA0 1io0 17c0 1cM0 1cM0 1a00 1fA0 1io0 1qM0 Df0 Ik0 5M30 WM0 1fA0 1cM0 Vx0 hB0 1aq0 16M0 1ekn0 1cL0 1fC0 1a00 1fA0 1cM0 1cM0 1cM0 1fA0 1a00 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|11e6',

  /* Option to disable the "next" column of the Route panel as it can be confusing sometimes: https://github.com/mfdz/digitransit-ui/issues/167 */
  displayNextDeparture: true,

  mainMenu: {
    // Whether to show the left menu toggle button at all
    show: true,
    showDisruptions: true,
    showInquiry: false,
    showLoginCreateAccount: false,
    showOffCanvasList: false,
  },

  itinerary: {
    // How long vehicle should be late in order to mark it delayed. Measured in seconds.
    delayThreshold: 180,
    // Wait time to show "wait leg"? e.g. 180 means over 3 minutes are shown as wait time.
    // Measured in seconds.
    waitThreshold: 180,
    enableFeedback: false,

    timeNavigation: {
      enableButtonArrows: false,
    },

    showZoneLimits: false,
    // Number of days to include to the service time range from the future (DT-3317)
    serviceTimeRange: 30,
  },

  initialLocation: {
    zoom: 10,
    lat: 48.8588589,
    lon: 2.3475569,
  },

  nearestStopDistance: {
    maxShownDistance: 5000,
  },

  map: {
    useRetinaTiles: true,
//    tileSize: 512,
//    zoomOffset: -1,
    minZoom: 1,
    maxZoom: 18,
    useVectorTiles: false,
    controls: {
      zoom: {
        // available controls positions: 'topleft', 'topright', 'bottomleft, 'bottomright'
        position: 'bottomleft',
      },
      scale: {
        position: 'bottomright',
      },
    },
    genericMarker: {
      // Do not render name markers at zoom levels below this value
      nameMarkerMinZoom: 18,

      popup: {
        offset: [106, 16],
        maxWidth: 250,
        minWidth: 250,
      },
    },

    line: {
      halo: {
        weight: 7,
        thinWeight: 4,
      },

      leg: {
        weight: 5,
        thinWeight: 2,
      },
    },

    useModeIconsInNonTileLayer: true,
  },

  stopCard: {
    header: {
      showDescription: true,
      showStopCode: false,
      showDistance: true,
      showZone: false,
    },
  },

  autoSuggest: {
    // Let Pelias suggest based on current user location
    locationAware: true,
  },

  cityBike: {
    // Config for map features. NOTE: availability for routing is controlled by
    // transportModes.citybike.availableForSelection
    showCityBikes: true,
    showStationId: true,

    useUrl: {
      fi: 'https://www.velib-metropole.fr/en_GB/offers',
      sv: 'https://www.velib-metropole.fr/en_GB/offers',
      en: 'https://www.velib-metropole.fr/en_GB/offers',
      fr: 'https://www.velib-metropole.fr/offers',
    },

    infoUrl: {
      fi: 'https://www.velib-metropole.fr/en_GB',
      sv: 'https://www.velib-metropole.fr/en_GB',
      en: 'https://www.velib-metropole.fr/en_GB',
      fr: 'https://www.velib-metropole.fr',
    },

    cityBikeMinZoom: 14,
    cityBikeSmallIconZoom: 14,
    // When should bikeshare availability be rendered in orange rather than green
    fewAvailableCount: 3,
    networks: {},
    capacity: BIKEAVL_WITHMAX,
  },

  // Lowest level for stops and terminals are rendered
  stopsMinZoom: 13,
  // Highest level when stops and terminals are still rendered as small markers
  stopsSmallMaxZoom: 14,
  // Highest level when terminals are still rendered instead of individual stops
  terminalStopsMaxZoom: 17,
  terminalStopsMinZoom: 12,
  terminalNamesZoom: 15,
  stopsIconSize: {
    small: 8,
    selected: 28,
    default: 18,
  },

  appBarLink: { name: 'Digitransit', href: 'https://transit.paris/' },

  colors: {
    primary: '#00AFFF',
  },

  sprites: 'assets/svg-sprite.default.svg',

  disruption: {
    showInfoButton: true,
  },

  agency: {
    show: false,
  },

  socialMedia: {
    title: 'Digitransit Travel Planner for Paris',
    description: APP_DESCRIPTION,
    locale: 'fr_FR',

    image: {
      url: '/img/default-social-share.png',
      width: 2400,
      height: 1260,
    },

    twitter: {
      card: 'summary_large_image',
      site: '@kalonbuntu33',
    },
  },

  meta: {
    description: APP_DESCRIPTION,
    keywords: 'Digitransit,transit,trajet,itinéraires,Paris,Ile de France',
  },

  // Ticket information feature toggle
  showTicketInformation: false,
  ticketInformation: {
    // This is the name of the primary agency operating in the area.
    // It is used when a ticket price cannot be shown to the user, indicating
    // that the primary agency is not responsible for ticketing.
    /*
    primaryAgencyName: ...,
    */
    // UTM parameters (per agency) that should be appended to the agency's
    // fareUrl when the fareUrl link is shown in the UI.
    /*
    trackingParameters: {
      "agencyGtfsId": {
        utm_campaign: ...,
        utm_content: ...,
        utm_medium: ...,
        utm_source: ...,
      }
    },
    */
  },

  useTicketIcons: false,
  showRouteInformation: false,

  modeToOTP: {
    bus: 'BUS',
    tram: 'TRAM',
    rail: 'RAIL',
    subway: 'SUBWAY',
    citybike: 'BICYCLE_RENT',
    airplane: 'AIRPLANE',
    ferry: 'FERRY',
    walk: 'WALK',
    bicycle: 'BICYCLE',
    car: 'CAR',
    car_park: 'CAR_PARK',
    public_transport: 'WALK',
  },

  // Control what transport modes that should be possible to select in the UI
  // and whether the transport mode is used in trip planning by default.
  transportModes: {
    bus: {
      availableForSelection: true,
      defaultValue: true,
    },

    tram: {
      availableForSelection: true,
      defaultValue: true,
    },

    rail: {
      availableForSelection: true,
      defaultValue: true,
    },

    subway: {
      availableForSelection: true,
      defaultValue: true,
    },

    airplane: {
      availableForSelection: false,
      defaultValue: false,
    },

    ferry: {
      availableForSelection: false,
      defaultValue: false,
    },

    citybike: {
      availableForSelection: true,
      defaultValue: false, // always false
    },
  },

  streetModes: {
    public_transport: {
      availableForSelection: true,
      defaultValue: true,
      exclusive: false,
      icon: 'bus-withoutBox',
    },

    walk: {
      availableForSelection: true,
      defaultValue: false,
      exclusive: true,
      icon: 'walk',
    },

    bicycle: {
      availableForSelection: true,
      defaultValue: false,
      exclusive: true,
      icon: 'bicycle-withoutBox',
    },

    car: {
      availableForSelection: true,
      defaultValue: false,
      exclusive: true,
      icon: 'car-withoutBox',
    },

    car_park: {
      availableForSelection: false,
      defaultValue: false,
      exclusive: false,
      icon: 'car_park-withoutBox',
    },
  },

  accessibilityOptions: [{
    messageId: 'accessibility-nolimit',
    displayName: 'Illimité',
    value: '0',
  }, {
    messageId: 'accessibility-limited',
    displayName: 'Je me déplace en fauteuil',
    value: '1',
  }],

  moment: {
    relativeTimeThreshold: {
      seconds: 55,
      minutes: 59,
      hours: 23,
      days: 26,
      months: 11,
    },
  },

  customizeSearch: {
    walkReluctance: {
      available: true,
    },

    walkBoardCost: {
      available: true,
    },

    transferMargin: {
      available: true,
    },

    walkingSpeed: {
      available: true,
    },

    ticketOptions: {
      available: false,
    },

    accessibility: {
      available: true,
    },
    transferpenalty: {
      available: true,
    },
  },

  areaPolygon: [
    [ 38.23488429, 21.25950778 ],
    [ -3.40456064, 27.14097341 ],
    [ -4.48214, 48.38749 ],
    [ -0.148349, 51.492513 ],
    [ 4.836263, 52.389289 ],
    [ 8.14067588, 49.35006155 ],
    [ 38.23488429, 21.25950778 ]
  ],

  // Minimun distance between from and to locations in meters. User is noticed
  // if distance is less than this.
  minDistanceBetweenFromAndTo: 20,

  // If certain mode(s) only exist in limited number of areas, listing the areas as a list of polygons for
  // selected mode key will remove the mode(s) from queries if no coordinates in the query are within the polygon(s).
  // This reduces complexity in finding routes for the query.
  modePolygons: {},

  footer: {
    content: [
      { label: `© HSL, Traficom, geocode.earth, kalon33 ${YEAR}` },
      {},
      {
        name: 'footer-feedback',
        nameEn: 'Submit feedback',
        href: 'https://github.com/HSLdevcom/digitransit-ui/issues',
        icon: 'icon-icon_speech-bubble',
      },
      {
        name: 'about-this-service',
        nameEn: 'About this service',
        route: '/tietoja-palvelusta',
        icon: 'icon-icon_info',
      },
    ],
  },

  // Default origin endpoint to use when user is outside of area
  defaultEndpoint: {
    address: 'Paris - Châtelet les Halles',
    lat: 48.8588589,
    lon: 2.3475569,
  },
  defaultOrigins: [
    { icon: 'icon-icon_airplane', label: 'Aéroport Charles de Gaulle', lat: 49.0097, lon: 2.5479, },
    { icon: 'icon-icon_rail', label: 'Gare de Massy TGV', lat: 48.72584, lon: 2.261345, },
    { icon: 'icon-icon_rail', label: 'Gare de Paris Montparnasse', lat: 48.841157, lon: 2.320474, },
    { icon: 'icon-icon_airplane', label: 'Aéroport d\'Orly', lat: 48.7262, lon: 2.3652, },
    { icon: 'icon-icon_airplane', label: 'Aéroport de Bordeaux-Mérignac', lat: 44.82861, lon: -0.71528 },
    { icon: 'icon-icon_rail', label: 'Pessac - Gare de Pessac Centre', lat: 44.804417, lon: -0.631747 },
    { icon: 'icon-icon_rail', label: 'Bordeaux - Gare Saint-Jean', lat: 44.825815, lon: -0.555732 },
    { icon: 'icon-icon_airplane', label: 'Aéroport de Cherbourg-Manche', lat: 49.6470013, lon: -1.4786955 },
    { icon: 'icon-icon_rail', label: 'Cherbourg - Gare de Cherbourg', lat: 49.63346, lon: -1.6236467 },
    { icon: 'icon-icon_rail', label: 'Valognes - Gare de Valognes', lat: 49.5053464, lon: -1.4820209 }
  ],

  availableRouteTimetables: {},

  routeTimetableUrlResolver: {},

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit-palvelualustaan.',
        ],
      },
      {
        header: 'Digitransit-palvelualusta',
        paragraphs: [
          'Digitransit-palvelualusta on HSL:n ja Traficomin kehittämä avoimen lähdekoodin reititystuote.',
        ],
      },
      {
        header: 'Tietolähteet',
        paragraphs: [
          'Kartat, tiedot kaduista, rakennuksista, pysäkkien sijainnista ynnä muusta tarjoaa © OpenStreetMap contributors. Osoitetiedot tuodaan Väestörekisterikeskuksen rakennustietorekisteristä. Joukkoliikenteen reitit ja aikataulut ladataan Traficomin valtakunnallisesta joukkoliikenteen tietokannasta.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
        ],
      },
      {
        header: 'Digitransit-plattformen',
        paragraphs: [
          'Digitransit-plattformen är en öppen programvara utvecklad av HRT och Traficom.',
        ],
      },
      {
        header: 'Datakällor',
        paragraphs: [
          'Kartor, gator, byggnader, hållplatser och dylik information erbjuds av © OpenStreetMap contributors. Addressinformation hämtas från BRC:s byggnadsinformationsregister. Kollektivtrafikens rutter och tidtabeller hämtas från Traficoms landsomfattande kollektivtrafiksdatabas.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'The service covers public transport, walking, cycling, some Macron buses (OUIBUS, Flixbus), TER and Intercités trains. Service is built on Digitransit platform and provided by kalon33 (@kalonbuntu33).',
        ],
      },
      {
        header: 'Digitransit platform',
        paragraphs: [
          'The Digitransit service platform is an open source routing platform developed by HSL and Traficom.',
        ],
      },
      {
        header: 'Data sources',
        paragraphs: [
          "Maps, streets, buildings, stop locations etc. are provided by © OpenStreetMap contributors. Address data is provided by https://geocode.earth based on https://geocode.earth/guidelines.",
        ],
      },
    ],
    nb: {},

    fr: [
      {
        header: 'À propos de ce service',
        paragraphs: ['Ce service est fourni par kalon33 (@kalonbuntu33) pour le calcul d\'itinéraires et l\'information trajet en Île de France (et un peu plus). Ce service couvre les transports en commun, la marche, le vélo, certains cars Macron (OUIBUS, Flixbus), les TER et les Intercités. Il est construit à partir de la plateforme Digitransit.'],
      },
      {
        header: 'La plateforme Digitransit',
        paragraphs: ['La plateforme de service Digitransit est une plateforme de calcul d\'itinéraires open source routing platform developed HSL et la Finnish Transport Agency. Le code source de la plateforme est disponible sous les licences EUPL v1.2 et AGPLv3. Rejoignez-nous pour rendre ce service encore meilleur.'],
      },
      {
        header: 'Sources des données',
        paragraphs: ["Cartographie, rues, bâtiments, localisation des arrêts sont © contributeurs d'OpenStreetMap téléchargés depuis Geofabrik. Les données d\'adresses sont fournies par https://geocode.earth, selon https://geocode.earth/guidelines. Les données de transports sont téléchargées depuis les sites Opendata respectifs des différents transporteurs/opérateurs (STIF, SNCF, OUIBUS...)"],
      },
    ],
    de: {},
  },

  staticMessages: [],

  staticIEMessage: [
    {
      id: '3',
      priority: -1,
      shouldTrigger: true,
      content: {
        fi: [
          {
            type: 'text',
            content:
              'Palvelu ei tue käyttämääsi selainta. Päivitä selainohjelmasi tai lataa uusi selain oheisista linkeistä.\n',
          },
          {
            type: 'a',
            content: 'Google Chrome',
            href: 'https://www.google.com/chrome/',
          },
          {
            type: 'a',
            content: 'Firefox',
            href: 'https://www.mozilla.org/fi/firefox/new/',
          },
          {
            type: 'a',
            content: 'Microsoft Edge',
            href: 'https://www.microsoft.com/en-us/windows/microsoft-edge',
          },
        ],
        en: [
          {
            type: 'text',
            content:
              'The service does not support the browser you are using. Update your browser or download a new browser using the links below.\n',
          },
          {
            type: 'a',
            content: 'Google Chrome',
            href: 'https://www.google.com/chrome/',
          },
          {
            type: 'a',
            content: 'Firefox',
            href: 'https://www.mozilla.org/fi/firefox/new/',
          },
          {
            type: 'a',
            content: 'Microsoft Edge',
            href: 'https://www.microsoft.com/en-us/windows/microsoft-edge',
          },
        ],
        sv: [
          {
            type: 'text',
            content:
              'Tjänsten stöder inte den webbläsare som du har i bruk. Uppdatera din webbläsare eller ladda ner en ny webbläsare via nedanstående länk.\n',
          },
          {
            type: 'a',
            content: 'Google Chrome',
            href: 'https://www.google.com/chrome/',
          },
          {
            type: 'a',
            content: 'Firefox',
            href: 'https://www.mozilla.org/sv-SE/firefox/new/',
          },
          {
            type: 'a',
            content: 'Microsoft Edge',
            href: 'https://www.microsoft.com/en-us/windows/microsoft-edge',
          },
        ],
      },
    },
  ],
  themeMap: {
    hsl: 'reittiopas',
    turku: '(turku|foli)',
    lappeenranta: 'lappeenranta',
    joensuu: 'joensuu',
    oulu: 'oulu',
    hameenlinna: 'hameenlinna',
    matka: 'matka',
    walttiOpas: 'waltti',
    salo: 'salo',
    rovaniemi: 'rovaniemi',
    kouvola: 'kouvola',
    tampere: 'tampere',
    mikkeli: 'mikkeli',
    kotka: 'kotka',
    jyvaskyla: 'jyvaskyla',
    lahti: 'lahti',
    kuopio: 'kuopio',
  },

  minutesToDepartureLimit: 9,

  imperialEnabled: false,
  // this flag when true enables imperial measurements  'feet/miles system'

  showAllBusses: true,
  showVehiclesOnStopPage: true,
  mapLayers: {
    featureMapping: {
      ticketSales: {},
    },
  },

  timetables: {},
  showLogin: false,
};
