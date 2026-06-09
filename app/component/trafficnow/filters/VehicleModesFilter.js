import React from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { useFilterContext } from './FiltersContext';
import { useConfigContext } from '../../../configurations/ConfigContext';
import { getTransportModes } from '../../../util/modeUtils';
import { TrafficNowTransportModes } from '../../../constants';
import Icon from '../../Icon';

const VehicleModesFilter = ({ filterId }) => {
  const config = useConfigContext();
  const intl = useIntl();
  const { selectedFilters, setFilter } = useFilterContext();

  const handleCheck = option => {
    const checked = selectedFilters[filterId] || [];

    if (checked.includes(option)) {
      setFilter(
        filterId,
        checked.filter(c => c !== option),
      );
    } else {
      setFilter(filterId, [...checked, option]);
    }
  };

  const availableModes = Object.entries(getTransportModes(config)).reduce(
    (acc, [k, v]) => {
      if (
        v.availableForSelection &&
        TrafficNowTransportModes.includes(k.toUpperCase())
      ) {
        acc.push(k);
      }
      return acc;
    },
    [],
  );
  return (
    <fieldset>
      <legend className="input-legend">
        {intl.formatMessage({
          id: 'traffic-now_filters_vehicle-mode',
          defaultMessage: 'Filter by vehicle mode',
        })}
      </legend>
      {availableModes.map(option => (
        <div
          key={option}
          role="checkbox"
          aria-checked={selectedFilters[filterId]?.includes(option) || false}
          aria-label={intl.formatMessage({ id: option.toLowerCase() })}
          tabIndex={0}
          className="traffic-now__filters-mode-option"
          onClick={() => handleCheck(option)}
          onKeyDown={e =>
            (e.key === 'Enter' || e.key === ' ') && handleCheck(option)
          }
        >
          <label className="input-label">
            <Icon
              img={`icon_${option.toLowerCase()}`}
              className={option.toLowerCase()}
              height={1.5}
              width={1.5}
            />
            {intl.formatMessage({ id: option.toLowerCase() })}
          </label>
          <span
            className={`traffic-now__filters-mode-option-checkbox${
              selectedFilters[filterId]?.includes(option) ? ' checked' : ''
            }`}
          >
            <Icon img="icon_checkbox" height={1.5} width={1.5} />
          </span>
        </div>
      ))}
    </fieldset>
  );
};

VehicleModesFilter.propTypes = {
  filterId: PropTypes.string.isRequired,
};

export default VehicleModesFilter;
