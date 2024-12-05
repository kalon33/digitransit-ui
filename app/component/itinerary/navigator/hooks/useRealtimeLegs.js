import polyUtil from 'polyline-encoded';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchQuery } from 'react-relay';
import { GeodeticToEcef, GeodeticToEnu } from '../../../../util/geo-utils';
import { legTime } from '../../../../util/legUtils';
import { epochToIso } from '../../../../util/timeUtils';
import { legQuery } from '../../queries/LegQuery';

function nextTransitIndex(legs, i) {
  for (let j = i; j < legs.length; j++) {
    if (legs[j].transitLeg) {
      return j;
    }
  }
  // negative indicates not found
  return -1;
}

function getLegGap(legs, index) {
  return legTime(legs[index + 1].start) - legTime(legs[index].end);
}

// change non-transit legs' scheduled times
function shiftLegs(legs, i1, i2, gap) {
  for (let j = i1; j <= i2; j++) {
    const leg = legs[j];
    leg.start.scheduledTime = epochToIso(legTime(leg.start) + gap);
    leg.end.scheduledTime = epochToIso(legTime(leg.end) + gap);
  }
}

// scale non-transit legs' scheduled times
function scaleLegs(legs, i1, i2, k) {
  const base = legTime(legs[i1].start);
  for (let j = i1; j <= i2; j++) {
    const leg = legs[j];
    const s = legTime(leg.start);
    const e = legTime(leg.end);
    leg.start.scheduledTime = epochToIso(s + k * (s - base));
    leg.end.scheduledTime = epochToIso(e + k * (e - base));
  }
}

function matchLegEnds(legs) {
  if (legs.length < 2) {
    return;
  }
  let transit;
  let gap;

  // shift first legs to match transit start
  transit = nextTransitIndex(legs, 0);
  if (transit > 0) {
    gap = getLegGap(legs, transit - 1);
    if (gap) {
      shiftLegs(legs, 0, transit - 1, gap);
    }
  }

  // shift transfers and legs after transit end
  while (transit > 0) {
    const walk = transit + 1; // first leg after transit
    const nextTransit = nextTransitIndex(legs, walk);
    const shiftEnd = nextTransit > 0 ? nextTransit - 1 : legs.length - 1;
    if (shiftEnd > transit) {
      gap = getLegGap(legs, transit);
      if (gap) {
        shiftLegs(legs, walk, shiftEnd, -gap);
      }
    }
    if (nextTransit > walk) {
      // check if transfer needs scaling
      gap = getLegGap(legs, nextTransit - 1);
      if (gap < 0) {
        // transfer overlaps next transit leg, so we must make it shorter
        const transferDuration =
          legTime(legs[shiftEnd].end) - legTime(legs[walk].start);
        scaleLegs(
          legs,
          walk,
          shiftEnd,
          (transferDuration + gap) / transferDuration,
        );
      }
    }
    transit = nextTransit;
  }
}

const useRealtimeLegs = (relayEnvironment, initialLegs = []) => {
  const [realTimeLegs, setRealTimeLegs] = useState();
  const [time, setTime] = useState(Date.now());

  const origin = useMemo(
    () => GeodeticToEcef(initialLegs[0].from.lat, initialLegs[0].from.lon),
    [initialLegs[0]],
  );

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
            { id: leg.legId },
            { force: true },
          ).toPromise(),
        );
      const responses = await Promise.all(legQueries);
      return responses.reduce(
        (map, response) => ({ ...map, [response.leg.legId]: response.leg }),
        {},
      );
    },
    [relayEnvironment],
  );

  const fetchAndSetRealtimeLegs = useCallback(async () => {
    if (
      !initialLegs?.length ||
      time >= legTime(initialLegs[initialLegs.length - 1].end)
    ) {
      return;
    }

    const planarLegs = initialLegs.map(leg => {
      const geometry = polyUtil.decode(leg.legGeometry.points);
      return {
        ...leg,
        geometry: geometry.map(p => GeodeticToEnu(p[0], p[1], origin)),
      };
    });

    const rtLegMap = await queryAndMapRealtimeLegs(planarLegs).catch(err =>
      // eslint-disable-next-line no-console
      console.error('Failed to query and map real time legs', err),
    );

    const rtLegs = planarLegs.map(l => {
      const rtLeg = l.legId ? rtLegMap[l.legId] : null;
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
      return { ...l, start: { ...l.start }, end: { ...l.end } };
    });
    // shift non-transit-legs to match possibly changed transit legs
    matchLegEnds(rtLegs);
    setRealTimeLegs(rtLegs);
  }, [initialLegs, queryAndMapRealtimeLegs]);

  useEffect(() => {
    fetchAndSetRealtimeLegs();

    const interval = setInterval(() => {
      fetchAndSetRealtimeLegs();
      setTime(Date.now());
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchAndSetRealtimeLegs]);

  let currentIndex = -1;

  if (realTimeLegs) {
    if (time >= legTime(realTimeLegs[realTimeLegs.length - 1].end)) {
      currentIndex = realTimeLegs.length - 1;
    } else {
      currentIndex = realTimeLegs?.findIndex(
        l => legTime(l.start) <= time && time <= legTime(l.end),
      );
    }
  }

  return {
    realTimeLegs,
    time,
    origin,
    firstLeg: realTimeLegs?.[0],
    lastLeg: realTimeLegs?.[realTimeLegs.length - 1],
    currentLeg: realTimeLegs?.[currentIndex],
    nextLeg: realTimeLegs?.[currentIndex + 1],
  };
};

export { useRealtimeLegs };
