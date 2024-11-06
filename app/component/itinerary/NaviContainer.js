import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { fetchQuery, graphql } from 'react-relay';
import { checkPositioningPermission } from '../../action/PositionActions';
import { legTime } from '../../util/legUtils';
import { legShape, relayShape } from '../../util/shapes';
import NaviBottom from './NaviBottom';
import NaviTop from './NaviTop';

const legQuery = graphql`
  query NaviContainer_legQuery($id: String!) {
    leg(id: $id) {
      id
      start {
        scheduledTime
        estimated {
          time
        }
      }
      end {
        scheduledTime
        estimated {
          time
        }
      }

      to {
        vehicleRentalStation {
          availableVehicles {
            total
          }
        }
      }
      realtimeState
    }
  }
`;

function NaviContainer(
  { legs, focusToLeg, relayEnvironment, setNavigation, mapRef },
  { getStore },
) {
  const [realTimeLegs, setRealTimeLegs] = useState(legs);
  const [time, setTime] = useState(Date.now());
  const locationOK = useRef(true);
  const position = getStore('PositionStore').getLocationState();

  // update view after every 10 seconds
  useEffect(() => {
    checkPositioningPermission().then(permission => {
      locationOK.current = permission.state === 'granted';
      if (locationOK.current) {
        mapRef?.enableMapTracking();
      }
      setTime(Date.now()); // force refresh
    });
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const legQueries = [];
    legs.forEach(leg => {
      if (leg.transitLeg) {
        legQueries.push(
          fetchQuery(
            relayEnvironment,
            legQuery,
            { id: leg.id },
            { force: true },
          ).toPromise(),
        );
      }
    });
    if (legQueries.length) {
      Promise.all(legQueries).then(responses => {
        const legMap = {};
        responses.forEach(data => {
          legMap[data.leg.id] = data.leg;
        });
        const rtLegs = legs.map(l => {
          const rtLeg = l.id ? legMap[l.id] : null;
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
      });
    }
  }, [time]);

  // recompute estimated arrival
  let lastTransitLeg;
  let arrivalChange = 0;

  legs.forEach(leg => {
    if (leg.transitLeg) {
      lastTransitLeg = leg;
    }
  });

  if (lastTransitLeg) {
    const rtLeg = realTimeLegs.find(leg => {
      return leg.id === lastTransitLeg.id;
    });
    arrivalChange = legTime(rtLeg.end) - legTime(lastTransitLeg.end);
  }

  const arrivalTime = legTime(legs[legs.length - 1].end) + arrivalChange;

  return (
    <>
      <NaviTop
        realTimeLegs={realTimeLegs}
        focusToLeg={
          mapRef?.state.mapTracking || locationOK.current ? null : focusToLeg
        }
        time={time}
        position={position}
      />{' '}
      <NaviBottom setNavigation={setNavigation} arrival={arrivalTime} />
    </>
  );
}

NaviContainer.propTypes = {
  legs: PropTypes.arrayOf(legShape).isRequired,
  focusToLeg: PropTypes.func.isRequired,
  relayEnvironment: relayShape.isRequired,
  setNavigation: PropTypes.func.isRequired,
  // eslint-disable-next-line
  mapRef: PropTypes.object,
};

NaviContainer.contextTypes = {
  getStore: PropTypes.func.isRequired,
};

NaviContainer.defaultProps = { mapRef: undefined };

export default NaviContainer;
