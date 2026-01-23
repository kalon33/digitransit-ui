import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { configShape } from '../../util/shapes';
import { getReadMessageIds, setReadMessageIds } from '../../store/localStorage';
import {
  getRentalNetworkConfig,
  getRentalNetworkId,
} from '../../util/vehicleRentalUtils';
import Disclaimer from '../Disclaimer';

const CityBikeInfo = ({ lang }, { config }) => {
  const [showCityBikeTeaser, setShowCityBikeTeaser] = useState(
    !getReadMessageIds().includes('citybike_teaser'),
  );

  const handleClose = () => {
    const readMessageIds = getReadMessageIds() || [];
    readMessageIds.push('citybike_teaser');
    setReadMessageIds(readMessageIds);
    setShowCityBikeTeaser(false);
  };
  const { vehicleRental } = config;
  // Use general information about using city bike, if one network config is available
  const networkConfig =
    Object.keys(vehicleRental.networks).length === 1 &&
    getRentalNetworkConfig(
      getRentalNetworkId(Object.keys(vehicleRental.networks)),
      config,
    );

  const href = vehicleRental.buyUrl?.[lang] || networkConfig?.url?.[lang];

  if (!showCityBikeTeaser || !href) {
    return null;
  }
  const linkLabelId = vehicleRental.buyUrl?.[lang]
    ? 'citybike-purchase-link'
    : 'citybike-start-using-info';

  return (
    <>
      <Disclaimer
        headerId="citybike-start-using"
        text={vehicleRental.buyInstructions?.[lang]}
        href={href}
        linkLabelId={linkLabelId}
        closable
        onClose={handleClose}
      />
      <div style={{ height: '8px' }} />
    </>
  );
};

CityBikeInfo.propTypes = { lang: PropTypes.string.isRequired };

CityBikeInfo.contextTypes = { config: configShape.isRequired };

export default CityBikeInfo;
