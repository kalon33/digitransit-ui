import PropTypes from 'prop-types';
import React from 'react';
import Icon from '../../Icon';
import ScheduleDropdown from './ScheduleDropdown';
import { stopShape } from '../../../util/shapes';

function ScheduleHeader({
  stops,
  from,
  to,
  onFromSelectChange,
  onToSelectChange,
}) {
  const options = stops.map((stop, index) => ({
    label: stop.name,
    value: index,
  }));

  const stopCount = options.length;
  const fromOptions = options.slice(0, to > stopCount ? stopCount : to);
  const toOptions = options.slice(from + 1);
  const fromOption = fromOptions.find(o => o.value === from);
  const toOption = toOptions.find(
    o => o.value === (to > stopCount ? stopCount : to),
  );
  const fromDisplayName = fromOption?.label || '';
  const toDisplayName = toOption?.label || '';

  const stopHeadersForPrinting = (
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

  return (
    <div className="route-schedule-header row">
      {stopHeadersForPrinting}
      <div className="route-schedule-dropdowns">
        <ScheduleDropdown
          id="origin"
          labelId="origin"
          title={fromDisplayName}
          list={fromOptions}
          onSelectChange={onFromSelectChange}
        />
        <ScheduleDropdown
          id="destination"
          labelId="destination"
          title={toDisplayName}
          list={toOptions}
          onSelectChange={onToSelectChange}
          alignRight
        />
      </div>
    </div>
  );
}
ScheduleHeader.propTypes = {
  stops: PropTypes.arrayOf(stopShape).isRequired,
  from: PropTypes.number.isRequired,
  to: PropTypes.number.isRequired,
  onFromSelectChange: PropTypes.func.isRequired,
  onToSelectChange: PropTypes.func.isRequired,
};

ScheduleHeader.displayName = 'ScheduleHeader';

export default ScheduleHeader;
