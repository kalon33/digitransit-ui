const CONFIG = process.env.CONFIG || 'default';
const API_URL = process.env.API_URL || 'https://paris.acolytesanonymes.org';
const MAP_URL = process.env.MAP_URL || 'https://{s}-dev-api.digitransit.fi';
const APP_PATH = process.env.APP_CONTEXT || '';
const PIWIK_ADDRESS = process.env.PIWIK_ADDRESS || '';
const PIWIK_ID = process.env.PIWIK_ID || '';
const SENTRY_DSN = process.env.SENTRY_DSN || '';
const PORT = process.env.PORT || 7812;
const APP_DESCRIPTION = 'Planificateur d\'itinéraires Digitransit for Paris';

export default {
  PIWIK_ADDRESS,
  PIWIK_ID,
  SENTRY_DSN,
  PORT,
  CONFIG,

  URL: {
    API_URL,
    OTP: `https://paris.acolytesanonymes.org/otp/routers/paris/`,
    MAP: {
      default: `https://{s}.tile.thunderforest.com/transport/`,
    },
    STOP_MAP: ``,
    CITYBIKE_MAP: ``,
    MQTT: '',
    ALERTS: ``,
    FONT: 'https://fonts.googleapis.com/css?family=Lato:300,400,900%7CPT+Sans+Narrow:400,700',
    REALTIME: ``,
    PELIAS: `https://search.mapzen.com/v1/search?boundary.country=fr&api_key=****`,
    PELIAS_REVERSE_GEOCODER: `https://search.mapzen.com/v1/reverse?api_key=****`,
  },

  APP_PATH: `${APP_PATH}`,
  title: 'Digitransit for Paris',

  contactName: {
    sv: 'Digitransit',
    fi: 'Digitransit',
    default: "Kalon33",
  },

  // Default labels for manifest creation
  name: 'Digitransit beta',
  shortName: 'Digitransit',

  searchParams: {},

  search: {
    suggestions: {
      useTransportIcons: true,
    },
  },

  nearbyRoutes: {
    radius: 10000,
    bucketSize: 1000,
  },

  maxWalkDistance: 10000,
  maxBikingDistance: 100000,
  availableLanguages: ['fr', 'en', 'fi', 'sv', 'nb', 'de'],
  defaultLanguage: 'fr',
  // This timezone data will expire on 31.12.2020
    timezoneData: 'Europe/Paris|PMT WET WEST CEST CET WEMT|-9.l 0 -10 -20 -10 -20|0121212121212121212121212121212121212121212121212123434352543434343434343434343434343434343434343434343434343434343434343434343434343434343434343434343434343434343434343434343434343434|-2nco8.l cNb8.l HA0 19A0 1iM0 11c0 1oo0 Wo0 1rc0 QM0 1EM0 UM0 1u00 10o0 1io0 1wo0 Rc0 1a00 1fA0 1cM0 1cM0 1io0 17c0 1fA0 1a00 1io0 1a00 1io0 17c0 1fA0 1a00 1io0 17c0 1cM0 1cM0 1a00 1io0 1cM0 1cM0 1a00 1fA0 1io0 17c0 1cM0 1cM0 1a00 1fA0 1io0 1qM0 Df0 Ik0 5M30 WM0 1fA0 1cM0 Vx0 hB0 1aq0 16M0 1ekn0 1cL0 1fC0 1a00 1fA0 1cM0 1cM0 1cM0 1fA0 1a00 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|11e6',

  mainMenu: {
    // Whether to show the left menu toggle button at all
    show: true,
    showDisruptions: false,
    showInquiry: false,
    showLoginCreateAccount: false,
    showOffCanvasList: false,
  },

  feedback: {
    // Whether to allow the feedback popup
    enable: false,
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
    useVectorTiles: false,

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
    },
  },

  autoSuggest: {
    // Let Pelias suggest based on current user location
    locationAware: true,
  },

  // TODO: Switch back in april
  cityBike: {
    showCityBikes: false,

    useUrl: {
      fi: 'http://en.velib.paris.fr/Subscriptions-and-fees/Access-the-service',
      sv: 'http://en.velib.paris.fr/Subscriptions-and-fees/Access-the-service',
      en: 'http://en.velib.paris.fr/Subscriptions-and-fees/Access-the-service',
      fr: 'http://www.velib.paris/Abonnements-tarifs/Acceder-au-service',
    },

    infoUrl: {
      fi: 'http://en.velib.paris.fr',
      sv: 'http://en.velib.paris.fr',
      en: 'http://en.velib.paris.fr',
      fr: 'http://www.velib.paris',
    },

    cityBikeMinZoom: 14,
    cityBikeSmallIconZoom: 14,
    // When should bikeshare availability be rendered in orange rather than green
    fewAvailableCount: 3,
  },
  // Lowest level for stops and terminals are rendered
  stopsMinZoom: 13,
  // Highest level when stops and terminals are still rendered as small markers
  stopsSmallMaxZoom: 14,
  // Highest level when terminals are still rendered instead of individual stops
  terminalStopsMaxZoom: 17,
  terminalStopsMinZoom: 12,
  terminalNamesZoom: 15,

  appBarLink: { name: 'Digitransit', href: 'https://transit.paris/' },

  colors: {
    primary: '#00AFFF',
  },

  disruption: {
    showInfoButton: false,
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

    // TODO: Switch back in april
    citybike: {
      availableForSelection: true,
      defaultValue: false,
    },

    airplane: {
      availableForSelection: false,
      defaultValue: false,
    },

    ferry: {
      availableForSelection: false,
      defaultValue: false,
    },
  },

  streetModes: {
    walk: {
      availableForSelection: true,
      defaultValue: true,
      icon: 'walk',
    },

    bicycle: {
      availableForSelection: true,
      defaultValue: false,
      icon: 'bicycle-withoutBox',
    },

    car: {
      availableForSelection: true,
      defaultValue: false,
      icon: 'car-withoutBox',
    },

    car_park: {
      availableForSelection: false,
      defaultValue: false,
      icon: 'car_park-withoutBox',
    },
  },

  ticketOptions: [{
    displayName: 'Il y a une zone de validité des tickets',
    value: '0',
  }],

  accessibilityOptions: [{
    displayName: 'Illimité',
    value: '0',
  }, {
    displayName: 'Je me déplace en fauteuil',
    value: '1',
  }],

  showModeFilter: true,

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
      available: false,
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

  footer: {
    content: [
      { label: (function () { return `© HSL, Liikennevirasto ${(1900 + new Date().getYear())}`; }()) },
      {},
      { name: 'footer-feedback', nameEn: 'Submit feedback', href: 'https://github.com/HSLdevcom/digitransit-ui/issues', icon: 'icon-icon_speech-bubble' },
      { name: 'about-this-service', nameEn: 'About this service', route: '/tietoja-palvelusta', icon: 'icon-icon_info' },
    ],
  },

  // Default origin endpoint to use when user is outside of area
  defaultEndpoint: {
    address: 'Paris - Châtelet les Halles',
    lat: 48.8588589,
    lon: 2.3475569,
  },
  defaultOrigins: [
    { icon: 'icon-icon_airplane', label: 'Aéroport Charles de Gaulle', lat: 49.0097, lon: 2.5479 },
    { icon: 'icon-icon_rail', label: 'Gare de Massy TGV', lat: 48.72584, lon: 2.261345 },
    { icon: 'icon-icon_rail', label: 'Gare de Paris Montparnasse', lat: 48.841157, lon: 2.320474 },
    { icon: 'icon-icon_airplane', label: 'Aéroport d\'Orly', lat: 48.7262, lon: 2.3652 },
  ],

  aboutThisService: {
    fi: {
      about: 'Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit palvelualustaan.',
      digitransit: 'Digitransit palvelualusta on HSL:n ja Liikenneviraston kehittämä avoimen lähdekoodin ratkaisu, jonka taustalla toimii mm. OpenTripPlanner. Lähdekoodi tarjotaan EUPL v1.2 ja AGPLv3 lisensseillä.',
      datasources: 'Kartat, kadut, rakennukset, pysäkkisijainnit ym. tiedot tarjoaa © OpenStreetMap contributors ja ne ladataan Geofabrik palvelusta. Osoitetiedot tuodaan VRK:n rakennustietorekisteristä ja ne ladataan OpenAddresses-palvelusta. Joukkoliikenteen reitit ja aikataulut ladataan mm. Liikenneviraston valtakunnallisesta joukkoliikenteen tietokannasta.',
    },

    sv: {
      about: 'Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
      digitransit: 'Digitransit-plattformen är en öppen programvara utvecklad av HRT och Trafikverket, som bl.a. stödjer sig på OpenTripPlanner. Källkoden distribueras under EUPL v1.2 och AGPLv3 licenserna.',
      datasources: 'Kartor, gator, byggnader, hållplatser och dylik information erbjuds av © OpenStreetMap contributors och laddas ned från Geofabrik-tjänsten. Addressinformation hämtas från BRC:s byggnadsinformationsregister och laddas ned från OpenAddresses-tjänsten. Kollektivtrafikens rutter och tidtabeller hämtas bl.a. från Trafikverkets landsomfattande kollektivtrafiksdatabas.',
    },

    en: {
      about: 'The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
      digitransit: 'Digitransit service platform is created by HSL and Finnish Transport Agency, built on top of e.g. OpenTripPlanner. The source code of the platform is dual-licensed under the EUPL v1.2 and AGPLv3 licenses.',
      datasources: "Maps, streets, buildings, stop locations etc. from © OpenStreetMap contributors downloaded from Geofabrik. Additional address data from Finland's Population Register Centre downloaded from OpenAddresses Public transport routes and timetables from Finnish Transport Agency's national public transit database.",
    },

    nb: {},
    fr: {
      about: 'Ce service est fourni par kalon33 (@kalonbuntu33) pour le calcul d\'itinéraires et l\'information trajet en Île de France (et un peu plus). Ce service couvre les transports en commun, la marche, le vélo, certains cars Macron (OUIBUS, Flixbus), les TER et les Intercités. Il est construit à partir de la plateforme Digitransit.',
      digitransit: 'La plateforme Digitransit est développée par HSL et la Finnish Transport Agency, et basée sur OpenTripPlanner. Le code source de la plateforme est disponible sous les deux licences EUPL v1.2 et AGPLv3',
      datasources: "Cartographie, rues, bâtiments, localisation des arrêts sont © contributeurs d'OpenStreetMap téléchargés depuis Geofabrik. Les données de transports sont téléchargées depuis les sites Opendata respectifs des différents transporteurs/opérateurs (STIF, SNCF, OUIBUS...)",
    },
    de: {},
  },

  staticMessages: [],

  themeMap: {
    turku: 'turku',
    hsl: 'reittiopas',
    lappeenranta: 'lappeenranta',
    joensuu: 'joensuu',
    oulu: 'oulu',
    matka: 'matka',
  },

  piwikMap: [ // in priority order. 1st match stops
    { id: '5', expr: 'dev.reittiopas' },
    { id: '4', expr: 'reittiopas' },
    { id: '7', expr: 'dev.matka|dev.digitransit' },
    { id: '6', expr: 'matka|digitransit' },
    { id: '10', expr: 'dev-joensuu' },
    { id: '11', expr: 'joensuu' },
    { id: '12', expr: 'dev-turku' },
    { id: '13', expr: 'turku' },
  ],
};
