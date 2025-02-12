import React from 'react';
import PropTypes from 'prop-types';

import Icon from '../Icon';
import IconMarker from './IconMarker';

export default function EntranceMarker({ position, code }) {
  const objs = [];

  const subwayIconAnchor = code ? 61 : 36;
  const codeIconAnchor = 36;

  objs.push(
    <IconMarker
      className="map-subway-entrance-info-icon-metro"
      key="icon-icon_subway_entrance"
      position={position}
      icon={{
        element: <Icon img="icon-icon_subway_entrance" />,
        iconAnchor: [12, subwayIconAnchor],
        className: 'map-subway-entrance-info-icon-metro',
      }}
    />,
  );

  if (code) {
    objs.push(
      <IconMarker
        className="map-subway-entrance-info-icon-metro"
        key="icon-icon_subway_entrance_a"
        position={position}
        icon={{
          element: <Icon img={`icon-icon_subway_entrance_${code}`} />,
          iconAnchor: [12, codeIconAnchor],
          className: 'map-subway-entrance-info-icon-metro',
        }}
      />,
    );
  }
  return <div className="map-entrance-info-container">{objs}</div>;
}

EntranceMarker.propTypes = {
  position: IconMarker.propTypes.position,
  code: PropTypes.string,
};

EntranceMarker.defaultProps = {
  position: undefined,
  code: undefined,
};
