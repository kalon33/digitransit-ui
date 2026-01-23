import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { getReadMessageIds, setReadMessageIds } from '../../store/localStorage';
import Disclaimer from '../Disclaimer';

const ParkInfo = ({ mode }) => {
  const key = `${mode}_info`;
  const prefix = mode === 'CARPARK' ? 'car' : 'bike';
  const [showParkInfo, setShowParkInfo] = useState(
    !getReadMessageIds().includes(key),
  );

  if (!showParkInfo) {
    return null;
  }

  const handleClose = () => {
    const readMessageIds = getReadMessageIds() || [];
    readMessageIds.push(key);
    setReadMessageIds(readMessageIds);
    setShowParkInfo(false);
  };

  return (
    <>
      <Disclaimer
        headerId={`${prefix}-park-disclaimer-header`}
        textId={`${prefix}-park-disclaimer`}
        linkLabelId="park-disclaimer-link"
        href=""
        closable
        onClose={handleClose}
      />
      <div style={{ height: '8px' }} />
    </>
  );
};

ParkInfo.propTypes = { mode: PropTypes.string.isRequired };

export default ParkInfo;
