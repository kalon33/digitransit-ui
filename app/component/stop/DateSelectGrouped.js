import PropTypes from 'prop-types';
import React, { useState, useMemo, useCallback } from 'react';
import { DateTime } from 'luxon';

import Select, { components as RSComponents } from 'react-select';
import { FormattedMessage } from 'react-intl';
import Icon from '../Icon';
import { useTranslationsContext } from '../../util/useTranslationsContext';
import {
  extractSelectedValue,
  prepareDates,
  processDates,
  groupDatesByWeek,
  generateDateRange,
  parseStartDate,
} from '../../util/dateSelectUtils';

function DateSelectGrouped(props) {
  const intl = useTranslationsContext();

  const GENERATED_DAYS = 60; // Fallback range when no dates provided

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const onMenuOpen = useCallback(() => {
    setIsMenuOpen(true);
  }, []);

  const onMenuClose = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Generate grouped date options from provided dates or fallback range
  const { grouped } = useMemo(() => {
    const today = DateTime.local().setLocale(intl.locale).startOf('day');
    const tomorrow = today.plus({ days: 1 });

    // Determine source dates: use provided dates or generate fallback range
    let sourceDates;
    if (Array.isArray(props.dates) && props.dates.length > 0) {
      sourceDates = prepareDates(props.dates, today, intl.locale);
    } else {
      const startDate = parseStartDate(
        props.startDate,
        props.dateFormat,
        today,
      );
      sourceDates = generateDateRange(
        startDate,
        GENERATED_DAYS,
        today,
        intl.locale,
      );
    }

    // Option objects with labels
    const processedDates = processDates(
      sourceDates,
      today,
      tomorrow,
      props.dateFormat,
      intl,
    );

    const groupedOptions = groupDatesByWeek(
      processedDates,
      today.weekNumber,
      intl,
    );

    return { grouped: groupedOptions };
  }, [props.startDate, props.dateFormat, intl, props.dates]);

  const selectedOption = useMemo(() => {
    const allOptions = grouped.flatMap(g => g.options);
    const selectedValue = extractSelectedValue(
      props.selectedDay,
      props.dateFormat,
    );
    return allOptions.find(o => o.value === selectedValue) || allOptions[0];
  }, [grouped, props.selectedDay, props.dateFormat]);

  const handleChange = useCallback(
    option => {
      props.onDateChange(option.value);
      onMenuClose();
    },
    [props.onDateChange, onMenuClose],
  );

  // Custom Option component with proper label rendering
  const Option = useCallback(propsOption => {
    const { innerProps, data, isSelected } = propsOption;
    return (
      <RSComponents.Option
        {...propsOption}
        innerProps={{ ...innerProps, 'aria-label': data.ariaLabel }}
      >
        <div className="date-select-option">
          <span className="date-select-check">
            {isSelected ? (
              <Icon img="icon_check" height={1.1525} width={0.904375} />
            ) : (
              <span className="check-placeholder" />
            )}
          </span>
          <span className="date-select-label">{data.textLabel}</span>
        </div>
      </RSComponents.Option>
    );
  }, []);

  // Custom SingleValue component to render the selected value without the check
  const SingleValue = useCallback(singleProps => {
    const { data } = singleProps;
    return (
      <RSComponents.SingleValue {...singleProps}>
        <div className="date-select-option">
          <span className="date-select-label">{data.textLabel}</span>
        </div>
      </RSComponents.SingleValue>
    );
  }, []);

  const DropdownIndicator = useCallback(indicatorProps => {
    const { selectProps } = indicatorProps;
    return (
      <RSComponents.DropdownIndicator {...indicatorProps}>
        <div className="date-select-arrow">
          <Icon
            img="icon_arrow-dropdown"
            className={selectProps.menuIsOpen ? 'inverted' : ''}
          />
        </div>
      </RSComponents.DropdownIndicator>
    );
  }, []);

  const id = 'route-schedule-datepicker';
  const classNamePrefix = 'route-schedule';

  const selectAriaLabel = intl.formatMessage({
    id: 'select-date',
    defaultMessage: 'Select date',
  });

  return (
    <div
      className={`date-select-wrapper${
        isMenuOpen ? ' date-select-wrapper--menu-open' : ''
      }`}
    >
      <h3 className="route-schedule-date-select-heading">
        <FormattedMessage
          id="route-page.select-time"
          defaultMessage="Select time"
        />
      </h3>
      <Select
        aria-labelledby={`aria-label-${id}`}
        aria-label={selectAriaLabel}
        ariaLiveMessages={{
          guidance: () => '.',
          onChange: ({ label, raw }) => {
            const msg = intl.formatMessage({ id: 'route-page.pattern-chosen' });
            const dateLabel = raw?.textLabel || label;
            return `${msg} ${dateLabel}`;
          },
          onFilter: () => '',
          onFocus: ({ context: itemContext, focused }) => {
            if (itemContext === 'menu') {
              return focused.ariaLabel || '';
            }
            return '';
          },
        }}
        className="date-select"
        classNamePrefix={classNamePrefix}
        components={{
          DropdownIndicator,
          IndicatorSeparator: () => null,
          Option,
          SingleValue,
        }}
        inputId={`aria-input-${id}`}
        isSearchable={false}
        name={id}
        menuIsOpen={isMenuOpen}
        onChange={handleChange}
        closeMenuOnSelect
        onMenuOpen={onMenuOpen}
        onMenuClose={onMenuClose}
        options={grouped}
        placeholder={
          <>
            <span className="left-column">
              <span className="combobox-label">
                {intl.formatMessage({ id: 'day', defaultMessage: 'day' })}
              </span>
              <span className="selected-value">
                {selectedOption ? selectedOption.textLabel : ''}
              </span>
            </span>
            <div>
              <Icon id="route-schedule-date-icon" img="icon_calendar" />
            </div>
          </>
        }
        value={selectedOption}
        menuPlacement="auto"
        menuPortalTarget={
          typeof document !== 'undefined' ? document.body : null
        }
        styles={{
          menuPortal: base => ({ ...base, zIndex: 9999 }),
        }}
      />
    </div>
  );
}

DateSelectGrouped.propTypes = {
  startDate: PropTypes.string.isRequired,
  selectedDay: PropTypes.instanceOf(DateTime),
  dateFormat: PropTypes.string.isRequired,
  dates: PropTypes.arrayOf(PropTypes.instanceOf(DateTime)),
  onDateChange: PropTypes.func.isRequired,
};

DateSelectGrouped.defaultProps = {
  selectedDay: undefined,
  dates: undefined,
};

DateSelectGrouped.displayName = 'DateSelectGrouped';

export default DateSelectGrouped;
