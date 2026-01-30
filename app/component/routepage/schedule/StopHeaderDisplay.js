import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../../Icon';

/**
 * StopHeaderDisplay - Displays stop information for printing
 * Shows origin and destination stops with map marker icons
 * This component is only visible when printing the schedule
 */
const StopHeaderDisplay = ({ fromDisplayName, toDisplayName }) => {
  return (
    <div className="printable-stop-header">
      <div className="printable-stop-header_icon-from">
        <Icon img="icon_mapMarker" />
      </div>
      <div className="printable-stop-header_from">
        <span>{fromDisplayName}</span>
      </div>
      <div className="printable-stop-header_icon-to">
        <Icon img="icon_mapMarker" />
      </div>
      <div className="printable-stop-header_to">
        <span>{toDisplayName}</span>
      </div>
    </div>
  );
};

StopHeaderDisplay.propTypes = {
  fromDisplayName: PropTypes.string.isRequired,
  toDisplayName: PropTypes.string.isRequired,
};

StopHeaderDisplay.displayName = 'StopHeaderDisplay';

export default StopHeaderDisplay;
