import React from 'react';
import PropTypes from 'prop-types';

import Icon from '../Icon';
import IconMarker from './IconMarker';

export default function EntranceMarker({
  position,
  code,
  wheelchairAccesible,
}) {
  const objs = [];

  const subwayIconAnchor =
    // eslint-disable-next-line no-nested-ternary
    code && wheelchairAccesible === 'POSSIBLE'
      ? 36
      : code || wheelchairAccesible === 'POSSIBLE'
        ? 24
        : 12;

  const codeIconAnchor = wheelchairAccesible === 'POSSIBLE' ? 12 : 0;
  const accessibleIconAnchor = code ? -12 : 0;

  objs.push(
    <IconMarker
      className="map-subway-entrance-info-icon-metro"
      key="icon-icon_subway_entrance"
      position={position}
      icon={{
        element: <Icon img="icon-icon_subway_entrance" />,
        iconAnchor: [subwayIconAnchor, 30], // 12 if only this 24 if two  and 36 if all
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
          iconAnchor: [codeIconAnchor, 30], // 12 if three icons 0 if two
          className: 'map-subway-entrance-info-icon-metro',
        }}
      />,
    );
  }

  if (wheelchairAccesible === 'POSSIBLE') {
    objs.push(
      <IconMarker
        className="map-subway-entrance-info-icon-metro"
        key="icon-icon_wheelchair_filled"
        position={position}
        icon={{
          element: <Icon img="icon-icon_wheelchair_filled" />,
          iconAnchor: [accessibleIconAnchor, 30], // -12 if three o if two
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
  wheelchairAccesible: PropTypes.string,
};

EntranceMarker.defaultProps = {
  position: undefined,
  code: undefined,
  wheelchairAccesible: undefined,
};
