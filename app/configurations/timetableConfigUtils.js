import { splitGtfsId } from '../util/gtfs';

/* eslint-disable no-unused-vars */
export default {
  HSL: {
    routeTimetableUrlResolver: function routeTimetableUrlResolver(
      baseURL,
      route,
      date,
      lang,
    ) {
      const { entityId: routeId } = splitGtfsId(route.gtfsId);

      // From YYYYMMDD to YYYY-MM-DD
      const formattedDate = date.replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');

      const defaultSearchParams =
        'props[showPrintButton]=true&props[redirect]=false';
      const url = new URL(`${baseURL}&${defaultSearchParams}`);
      url.searchParams.append('props[lineId]', routeId);
      url.searchParams.append('props[dateBegin]', formattedDate);
      url.searchParams.append('props[dateEnd]', formattedDate);
      url.searchParams.append('props[lang]', lang);
      return url;
    },
    stopTimetableUrlResolver: function stopTimetableUrlResolver(
      baseURL,
      stop,
      date,
      lang,
    ) {
      const { entityId: stopId } = splitGtfsId(stop.gtfsId);
      const formattedDate = date.replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
      const defaultSearchParams =
        'props[isSummerTimetable]=false&props[printTimetablesAsA4]=true&props[printTimetablesAsGreyscale]=false&props[template]=default&props[showAddressInfo]=false&props[showPrintButton]=true&props[redirect]=false&template=default';
      const url = new URL(`${baseURL}&${defaultSearchParams}`);
      url.searchParams.append('props[stopId]', stopId);
      url.searchParams.append('props[date]', formattedDate);
      url.searchParams.append('props[lang]', lang);
      return url;
    },
  },
  tampere: {
    routeTimetableUrlResolver: function routeTimetableUrlResolver(
      baseURL,
      route,
      date,
      lang,
    ) {
      const routeNumber = route.shortName.replace(/\D/g, '');
      return new URL(`${baseURL}${routeNumber}.html`);
    },
    stopTimetableUrlResolver: function stopTimetableUrlResolver(
      baseURL,
      stop,
      date,
      lang,
    ) {
      const { entityId: stopId } = splitGtfsId(stop.gtfsId);
      return new URL(`${baseURL}${parseInt(stopId, 10)}.pdf`);
    },
  },
};
