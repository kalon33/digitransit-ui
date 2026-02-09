import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import ScheduleDropdown from './ScheduleDropdown';
import StopHeaderDisplay from './StopHeaderDisplay';
import { stopShape } from '../../../util/shapes';

/**
 * ScheduleHeader
 * Header component for route schedules with origin/destination selection.
 * Includes printable stop headers for the print view.
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
  const safeDestinationIndex = Math.min(to, stopCount - 1);

  const { fromDisplayName, toDisplayName, fromOptions, toOptions } =
    useMemo(() => {
      const fromOptionsSlice = options.slice(0, safeDestinationIndex);
      const toOptionsSlice = options.slice(from + 1);
      const fromOption = fromOptionsSlice.find(o => o.value === from);
      const toOption = toOptionsSlice.find(o => o.value === to);
      return {
        fromDisplayName: fromOption?.label || '',
        toDisplayName: toOption?.label || '',
        fromOptions: fromOptionsSlice,
        toOptions: toOptionsSlice,
      };
    }, [options, from, to, safeDestinationIndex]);

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
