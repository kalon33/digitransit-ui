import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import ScheduleDropdown from './ScheduleDropdown';
import StopHeaderDisplay from './StopHeaderDisplay';
import { stopShape } from '../../../util/shapes';

/**
 * ScheduleHeader - Header component for route schedule with stop selection
 * Displays origin and destination dropdowns with printable headers
 */
function ScheduleHeader({
  stops,
  from,
  to,
  onFromSelectChange,
  onToSelectChange,
}) {
  const options = useMemo(
    () =>
      stops.map((stop, index) => ({
        label: stop.name,
        value: index,
      })),
    [stops],
  );

  const stopCount = options.length;
  const safeToIndex = Math.min(to, stopCount);

  const fromOptions = options.slice(0, safeToIndex);
  const toOptions = options.slice(from + 1);
  const fromOption = fromOptions.find(o => o.value === from);
  const toOption = toOptions.find(o => o.value === safeToIndex);
  const fromDisplayName = fromOption?.label || '';
  const toDisplayName = toOption?.label || '';

  return (
    <div className="route-schedule-header row">
      <StopHeaderDisplay
        fromDisplayName={fromDisplayName}
        toDisplayName={toDisplayName}
      />
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
