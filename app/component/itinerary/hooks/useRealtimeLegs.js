import { useEffect, useState, useCallback } from 'react';
import { fetchQuery } from 'react-relay';
import { legQuery } from '../queries/LegQuery';

const useRealtimeLegs = (initialLegs, relayEnvironment, enableMapTracking) => {
  const [realTimeLegs, setRealTimeLegs] = useState(initialLegs);
  const [time, setTime] = useState(Date.now());

  const queryAndMapRealtimeLegs = useCallback(
    async legs => {
      if (!legs.length) {
        return {};
      }

      const legQueries = legs
        .filter(leg => leg.transitLeg)
        .map(leg =>
          fetchQuery(
            relayEnvironment,
            legQuery,
            { id: leg.id },
            { force: true },
          ).toPromise(),
        );
      const responses = await Promise.all(legQueries);
      return responses.reduce(
        (map, response) => ({ ...map, [response.leg.id]: response.leg }),
        {},
      );
    },
    [initialLegs, relayEnvironment, fetchQuery],
  );

  const fetchAndSetRealtimeLegs = useCallback(async () => {
    const rtLegMap = await queryAndMapRealtimeLegs(initialLegs).catch(err =>
      // eslint-disable-next-line no-console
      console.error('Failed to query and map real time legs', err),
    );

    const rtLegs = initialLegs.map(l => {
      const rtLeg = l.id ? rtLegMap[l.id] : null;
      if (rtLeg) {
        return {
          ...l,
          ...rtLeg,
          to: {
            ...l.to,
            vehicleRentalStation: rtLeg.to.vehicleRentalStation,
          },
        };
      }
      return { ...l };
    });
    setRealTimeLegs(rtLegs);
  }, [
    initialLegs,
    relayEnvironment,
    enableMapTracking,
    queryAndMapRealtimeLegs,
  ]);

  useEffect(() => {
    enableMapTracking();
    fetchAndSetRealtimeLegs();
    const interval = setInterval(() => {
      fetchAndSetRealtimeLegs();
      setTime(Date.now());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return { realTimeLegs, time };
};

export { useRealtimeLegs };
