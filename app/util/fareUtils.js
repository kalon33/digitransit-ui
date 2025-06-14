import { uniqBy } from 'lodash';

// TODO: support for currency
export function formatFare(fare) {
  return `${fare.price.toFixed(2)} €`.replace('.', ',');
}

export const getFaresFromLegs = (legs, config) => {
  if (
    !Array.isArray(legs) ||
    legs.size === 0 ||
    !config.showTicketInformation
  ) {
    return null;
  }
  const availableTickets = Object.values(config.availableTickets)
    .map(r => Object.keys(r))
    .flat();
  const filteredLegs = legs.map(leg => ({
    ...leg,
    fareProducts: leg.fareProducts.filter(fp =>
      availableTickets.includes(fp.product.id),
    ),
  }));

  const knownFareLegs = uniqBy(
    filteredLegs.filter(l => l.fareProducts.length > 0),
    'fareProducts[0].id',
  ).map(leg => ({
    fareProducts: leg.fareProducts,
    agency: leg.route.agency,
    price: leg.fareProducts[0].product.price.amount,
    ticketName:
      // E2E-testing does not work without this check
      (config.NODE_ENV === 'test' &&
        leg.fareProducts[0].product.id.split(':')[1]) ||
      config.fareMapping(leg.fareProducts[0].product.id),
  }));

  // Legs that have empty fares but still have a route, i.e. transit legs
  // Never show unknown fares for TAXI legs
  const unknownFareLegs = filteredLegs
    .filter(l => l.fareProducts.length === 0 && l.route && l.mode !== 'TAXI')
    .map(leg => ({
      agency: {
        fareUrl: leg.route.agency.fareUrl,
        gtfsId: leg.route.agency.gtfsId,
        name: leg.route.agency.name,
      },
      isUnknown: true,
      routeGtfsId: leg.route.gtfsId,
      routeName: leg.route.longName,
    }));
  return [...knownFareLegs, ...unknownFareLegs];
};

/**
 * Returns alternative fares that cost as much as the one given by OpenTripPlanner
 *
 * @param {*} zones zones that are visited.
 * @param {*} currentFares fare given by OpenTripPlanner.
 * @param {*} allFares all fare options.
 */
export const getAlternativeFares = (zones, currentFares, allFares) => {
  const alternativeFares = [];
  if (zones.length === 1 && currentFares.length === 1 && allFares) {
    const { fareProducts } = currentFares[0];
    const fareId = fareProducts[0].product.id;
    const ticketFeed = fareId.split(':')[0];
    const faresForFeed = allFares[ticketFeed];
    if (faresForFeed && faresForFeed[fareId]) {
      const ticketPrice = faresForFeed[fareId].price;
      Object.keys(faresForFeed).forEach(key => {
        const fareInfo = faresForFeed[key];
        if (
          key !== fareId &&
          fareInfo.zones.includes(zones[0]) &&
          fareInfo.price === ticketPrice
        ) {
          alternativeFares.push(key.split(':')[1]);
        }
      });
    }
  }
  return alternativeFares;
};

/**
 * This function resolves if fare info should be shown.
 * Fare information is shown if showTicketInformation is true in config
 * and availableTickets includes tickets for some feedId from config.
 *
 * @param {*} config configuration.
 */
export const shouldShowFareInfo = (config, legs) => {
  if (
    config.externalFareRouteIds &&
    legs?.some(
      leg =>
        leg.route &&
        config.externalFareRouteIds.includes(leg.route.gtfsId.split(':')[1]),
    )
  ) {
    return false;
  }

  return (
    (!config.showTicketLinkOnlyWhenTesting ||
      window.localStorage
        .getItem('favouriteStore')
        ?.includes('Lippulinkkitestaus2025')) &&
    config.showTicketInformation &&
    config.availableTickets &&
    Array.isArray(config.feedIds) &&
    config.feedIds.some(feedId => config.availableTickets[feedId])
  );
};

export const shouldShowFarePurchaseInfo = (config, breakpoint, fares) => {
  const unknownFares = fares?.some(fare => fare.isUnknown);
  // Windows phones or Huawei should only show ticket information.
  const { userAgent } = navigator;
  const huaweiPattern = /(?:huaweibrowser|huawei|emui|hmscore|honor)/i;
  const windowsPattern = /windows phone/i;
  if (huaweiPattern.test(userAgent) || windowsPattern.test(userAgent)) {
    return false;
  }

  return (
    !unknownFares &&
    fares?.length === 1 &&
    config.ticketPurchaseLink &&
    config.ticketLinkOperatorCode &&
    config.availableTickets &&
    breakpoint !== 'large'
  );
};
