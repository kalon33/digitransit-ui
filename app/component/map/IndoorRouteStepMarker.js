import React, { useEffect, useState } from 'react';
/* eslint-disable react/no-array-index-key */

import PropTypes from 'prop-types';
import { default as L } from 'leaflet';

import { intlShape } from 'react-intl';
import cx from 'classnames';
import { configShape, locationShape } from '../../util/shapes';
import GenericMarker from './GenericMarker';

import Card from '../Card';
import PopupHeader from './PopupHeader';
import Icon from '../Icon';
import { RelativeDirection, VerticalDirection } from '../../constants';
import { getVerticalTransportationUseIconId } from '../../util/indoorUtils';

export default function IndoorRouteStepMarker(
  { position, index, indoorRouteSteps },
  { intl },
) {
  const [indoorBackgroundImageUrl, setIndoorBackgroundImageUrl] = useState();
  useEffect(() => {
    import(
      /* webpackChunkName: "indoor-dotted-line-horizontal" */ `../../configurations/images/default/indoor-dotted-line-horizontal.svg`
    ).then(insideImageUrl => {
      setIndoorBackgroundImageUrl(`url(${insideImageUrl.default})`);
    });
  }, []);

  const objs = [];

  const getIcon = () => {
    const radius = 10;
    const iconSvg = `
        <svg viewBox="0 0 ${radius * 2} ${radius * 2}">
          <circle
            class="vertical-transportation-use-marker"
            cx="${radius}"
            cy="${radius}"
            r="${radius * 0.7}"
            stroke-width="${radius * 0.4}"
          />
        </svg>`;

    return L.divIcon({
      html: iconSvg,
      iconSize: [radius * 2, radius * 2],
      className: 'map-vertical-transportation-use-marker disable-icon-border',
    });
  };

  objs.push(
    <GenericMarker
      key={`verticaltransportationusegenericmarker_lat_${position.lat}_lon_${position.lon}`}
      position={position}
      getIcon={getIcon}
      maxWidth={450}
      minWidth={180}
    >
      <Card>
        <PopupHeader
          header={intl.formatMessage({
            id: 'itinerary-indoor-route',
            defaultMessage: 'Indoor route',
          })}
        />
        <div className="bottom vertical-transportation-use-popup-container">
          <div className="vertical-transportation-use-popup-icons">
            {indoorRouteSteps.map((obj, i, filteredObjs) => (
              <React.Fragment
                key={`verticaltransportationuseicon_lat_${position.lat}_lon_${position.lon}_index_${i}`}
              >
                <Icon
                  img={getVerticalTransportationUseIconId(
                    obj.feature?.verticalDirection,
                    obj.relativeDirection,
                    true,
                  )}
                  className="vertical-transportation-use-popup-icon"
                />
                {filteredObjs.length !== i + 1 ? (
                  <Icon
                    img="icon_arrow-right-long"
                    className="arrow-popup-icon"
                  />
                ) : null}
              </React.Fragment>
            ))}
          </div>
          <div className="vertical-transportation-use-popup-line-container">
            <div className="vertical-transportation-use-popup-line-circle-container">
              {indoorRouteSteps.map((obj, i) => (
                <React.Fragment
                  key={`indoorroutestepmarker_lat_${position.lat}_lon_${position.lon}_index_${i}`}
                >
                  <div className="vertical-transportation-use-popup-line-circle">
                    <svg width={28} height={28}>
                      <circle
                        className={cx('vertical-transportation-use-marker', {
                          selected: index === i,
                        })}
                        width={28}
                        cx={14}
                        cy={14}
                        r={6}
                        strokeWidth={4}
                      />
                    </svg>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div
              style={{
                backgroundImage: indoorBackgroundImageUrl,
              }}
              className="vertical-transportation-use-popup-line"
            />
          </div>
        </div>
      </Card>
    </GenericMarker>,
  );

  return <div>{objs}</div>;
}

IndoorRouteStepMarker.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};

IndoorRouteStepMarker.propTypes = {
  position: locationShape.isRequired,
  index: PropTypes.number.isRequired,
  indoorRouteSteps: PropTypes.arrayOf(
    PropTypes.shape({
      relativeDirection: PropTypes.oneOf(Object.values(RelativeDirection)),
      feature: PropTypes.shape({
        verticalDirection: PropTypes.oneOf(Object.values(VerticalDirection)),
      }),
    }),
  ),
};

IndoorRouteStepMarker.defaultProps = {
  indoorRouteSteps: [],
};
