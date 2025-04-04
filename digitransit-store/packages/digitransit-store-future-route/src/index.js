import sortBy from 'lodash/sortBy';

const DEFAULT_ITINERARY_PREFIX = 'reitti';

export function createUrl(item, pathOpts) {
  const props = item.properties;
  if (
    props.origin?.coordinates &&
    props.destination?.coordinates &&
    props.time
  ) {
    const oLoc = props.origin.localadmin ? `, ${props.origin.localadmin}` : '';
    const oAddr = `${props.origin.name}${oLoc}`;
    const dLoc = props.destination.localadmin
      ? `, ${props.destination.localadmin}`
      : '';
    const dAddr = `${props.destination.name}${dLoc}`;

    let prefix;
    if (pathOpts?.itinerarySummaryPrefix) {
      prefix = pathOpts.itinerarySummaryPrefix;
    } else {
      prefix = DEFAULT_ITINERARY_PREFIX;
    }
    const from = encodeURIComponent(
      `${oAddr}::${props.origin.coordinates.lat},${props.origin.coordinates.lon}`,
    );
    const to = encodeURIComponent(
      `${dAddr}::${props.destination.coordinates.lat},${props.destination.coordinates.lon}`,
    );
    let url = `/${prefix}/${from}/${to}?time=${props.time}`;
    if (props.arriveBy) {
      url += '&arriveBy=true';
    }
    return url;
  }
  return '';
}

export function addFutureRoute(newRoute, routeCollection, pathOpts) {
  if (newRoute && newRoute.time > new Date().getTime() / 1000) {
    const originAddress = newRoute.origin.address.split(', ');
    const originName = originAddress[0];
    originAddress.shift();
    const originLocalAdmin =
      originAddress.length === 1 ? originAddress[0] : originAddress.join(', ');

    const destinationAddress = newRoute.destination.address.split(', ');
    const destinationName = destinationAddress[0];
    destinationAddress.shift();
    const destinationLocalAdmin =
      destinationAddress.length === 1
        ? destinationAddress[0]
        : destinationAddress.join(', ');

    const routeToAdd = {
      type: 'FutureRoute',
      properties: {
        layer: 'futureRoute',
        origin: {
          name: originName,
          localadmin: originLocalAdmin,
          coordinates: {
            lat: newRoute.origin.coordinates.lat,
            lon: newRoute.origin.coordinates.lon,
          },
        },
        destination: {
          name: destinationName,
          localadmin: destinationLocalAdmin,
          coordinates: {
            lat: newRoute.destination.coordinates.lat,
            lon: newRoute.destination.coordinates.lon,
          },
        },
        arriveBy: newRoute.arriveBy,
        time: newRoute.time,
        url: createUrl(newRoute, pathOpts),
      },
    };

    const newRouteOriginAndDestination = `${routeToAdd.properties.origin.name}, ${routeToAdd.properties.origin.localadmin} - ${routeToAdd.properties.destination.name}, ${routeToAdd.properties.destination.localadmin}`;
    const futureRoutes = routeCollection
      ? routeCollection.filter(
          r =>
            r.properties.time >= new Date().getTime() / 1000 &&
            `${r.properties.origin.name}, ${r.properties.origin.localadmin} - ${r.properties.destination.name}, ${r.properties.destination.localadmin}` !==
              newRouteOriginAndDestination,
        )
      : [];
    const sortedItems = sortBy(
      [...futureRoutes, routeToAdd],
      [
        'properties.time',
        'properties.origin.name',
        'properties.destination.name',
      ],
    );
    return sortedItems;
  }
  return routeCollection || JSON.parse('[]');
}
