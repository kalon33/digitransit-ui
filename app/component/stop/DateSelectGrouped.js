import PropTypes from 'prop-types';
import React, { useState, useRef, useMemo, useCallback } from 'react';
import { DateTime } from 'luxon';

import Select, { components as RSComponents } from 'react-select';
import { FormattedMessage } from 'react-intl';
import Icon from '../Icon';
import { useTranslationsContext } from '../../util/useTranslationsContext';

/**
 * Extract selected value from props (uses `selectedDay`).
 * @param {DateTime} selectedDay - Selected day as a Luxon `DateTime`
 * @param {string} dateFormat - Format string for DateTime conversion
 * @returns {string|undefined} Formatted date string or undefined
 */
function extractSelectedValue(selectedDay, dateFormat) {
  if (selectedDay instanceof DateTime) {
    return selectedDay.toFormat(dateFormat);
  }
  return undefined;
}

/**
 * Generate human-readable label for a date.
 * Returns "Today", "Tomorrow", or formatted date (e.g., "Mon 15.1.").
 * @param {DateTime} date - Date to label
 * @param {DateTime} today - Today's date for comparison
 * @param {DateTime} tomorrow - Tomorrow's date for comparison
 * @param {Object} intl - Internationalization object with formatMessage
 * @returns {string} Formatted label
 */
function getDateLabel(date, today, tomorrow, intl) {
  const isToday = date.hasSame(today, 'day');
  const isTomorrow = date.hasSame(tomorrow, 'day');

  if (isToday) {
    return intl.formatMessage({ id: 'today', defaultMessage: 'Today' });
  }
  if (isTomorrow) {
    return intl.formatMessage({ id: 'tomorrow', defaultMessage: 'Tomorrow' });
  }
  return date.toFormat('ccc d.L.');
}

/**
 * Generate week group label ("This week", "Next week", or "Week N").
 * @param {number} weekNum - Week number
 * @param {number} currentWeek - Current week number
 * @param {Object} intl - Internationalization object with formatMessage
 * @returns {string} Formatted group label
 */
function getWeekLabel(weekNum, currentWeek, intl) {
  if (weekNum === currentWeek) {
    return intl.formatMessage({ id: 'this-week', defaultMessage: 'This week' });
  }
  if (weekNum === currentWeek + 1) {
    return intl.formatMessage({ id: 'next-week', defaultMessage: 'Next week' });
  }
  return intl.formatMessage(
    { id: 'week-number', defaultMessage: 'Week {number}' },
    { number: weekNum },
  );
}

function DateSelectGrouped(props) {
  const intl = useTranslationsContext();
  // Menu measurement constants (avoid magic numbers inline)
  const MENU_PADDING = 12;
  const MENU_MIN_HEIGHT = 120;
  const MENU_BOTTOM_EXTRA = 8;
  const ACTION_BAR_SELECTOR = '.route-page-action-bar';
  const AFTER_SCROLLABLE_SELECTOR = '.after-scrollable-area';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuMaxHeight, setMenuMaxHeight] = useState(300);
  const controlRef = useRef(null);

  const onMenuOpen = useCallback(() => {
    setIsMenuOpen(true);
    if (controlRef.current && typeof window !== 'undefined') {
      const rect = controlRef.current.getBoundingClientRect();
      const actionBar = document.querySelector(ACTION_BAR_SELECTOR);
      const afterScrollable = document.querySelector(AFTER_SCROLLABLE_SELECTOR);
      const bottomOffset =
        (actionBar?.getBoundingClientRect().height || 0) +
        (afterScrollable?.getBoundingClientRect().height || 0) +
        MENU_BOTTOM_EXTRA;
      const availableBelow = Math.max(
        window.innerHeight - rect.bottom - MENU_PADDING - bottomOffset,
        MENU_MIN_HEIGHT,
      );
      const availableAbove = Math.max(rect.top - MENU_PADDING, MENU_MIN_HEIGHT);
      setMenuMaxHeight(Math.max(availableBelow, availableAbove));
    }
  }, []);

  const onMenuClose = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const { grouped } = useMemo(() => {
    // If the caller provided a list of DateTime `dates` (from scheduleDataUtils),
    // use those and compute labels/grouping here.
    if (Array.isArray(props.dates) && props.dates.length > 0) {
      const today = DateTime.local().setLocale(intl.locale).startOf('day');
      const tomorrow = today.plus({ days: 1 });

      const futureDates = props.dates
        .map(d => (d.setLocale ? d.setLocale(intl.locale) : d))
        .filter(d => d && d.isValid)
        .sort((a, b) => a.toMillis() - b.toMillis())
        .filter(d => d >= today);

      const dates = futureDates.map(d => ({
        dateObj: d,
        value: d.toFormat(props.dateFormat),
        textLabel: getDateLabel(d, today, tomorrow, intl),
        weekNumber: d.weekNumber,
      }));

      const byWeek = dates.reduce((acc, item) => {
        if (!acc[item.weekNumber]) {
          acc[item.weekNumber] = [];
        }
        acc[item.weekNumber].push(item);
        return acc;
      }, {});

      const currentWeek = today.weekNumber;
      const groupedOptions = [];

      Object.keys(byWeek)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach(weekNum => {
          const groupLabel = getWeekLabel(weekNum, currentWeek, intl);

          const options = byWeek[weekNum].map(item => ({
            value: item.value,
            textLabel: item.textLabel,
            // accessibility label with full weekday
            ariaLabel: item.dateObj.toFormat('EEEE d.L.'),
            raw: item,
          }));

          groupedOptions.push({ label: groupLabel, options });
        });

      return { flatDates: dates, grouped: groupedOptions };
    }

    // Fallback: local generation when no `dates` provided.
    // Generate a reasonable default range (60 days) starting from `props.startDate` or today.
    const today = DateTime.local().setLocale(intl.locale).startOf('day');
    let start = DateTime.fromFormat(props.startDate || '', props.dateFormat);
    if (!start || !start.isValid) {
      start = today;
    }

    const GENERATED_DAYS = 60;
    const generated = Array.from({ length: GENERATED_DAYS }, (_, i) =>
      start.plus({ days: i }).setLocale(intl.locale).startOf('day'),
    ).filter(d => d >= today);

    const tomorrow = today.plus({ days: 1 });
    const dates = generated.map(d => ({
      dateObj: d,
      value: d.toFormat(props.dateFormat),
      textLabel: getDateLabel(d, today, tomorrow, intl),
      weekNumber: d.weekNumber,
    }));

    const byWeek = dates.reduce((acc, item) => {
      if (!acc[item.weekNumber]) {
        acc[item.weekNumber] = [];
      }
      acc[item.weekNumber].push(item);
      return acc;
    }, {});

    const currentWeek = today.weekNumber;
    const groupedOptions = [];

    Object.keys(byWeek)
      .map(Number)
      .sort((a, b) => a - b)
      .forEach(weekNum => {
        const groupLabel = getWeekLabel(weekNum, currentWeek, intl);

        const options = byWeek[weekNum].map(item => ({
          value: item.value,
          textLabel: item.textLabel,
          // accessibility label with full weekday
          ariaLabel: item.dateObj.toFormat('EEEE d.L.'),
          raw: item,
        }));

        groupedOptions.push({ label: groupLabel, options });
      });

    return { flatDates: dates, grouped: groupedOptions };
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

  // Dropdown indicator that shows arrow up/down depending on menu state
  const DropdownIndicator = useCallback(
    indicatorProps => (
      <RSComponents.DropdownIndicator {...indicatorProps}>
        <div className="date-select-arrow">
          <Icon
            img="icon_arrow-dropdown"
            className={isMenuOpen ? 'inverted' : ''}
          />
        </div>
      </RSComponents.DropdownIndicator>
    ),
    [isMenuOpen],
  );

  const id = 'route-schedule-datepicker';
  const classNamePrefix = 'route-schedule';

  const selectAriaLabel = intl.formatMessage({
    id: 'select-date',
    defaultMessage: 'Select date',
  });

  return (
    <div
      ref={controlRef}
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
        maxMenuHeight={menuMaxHeight}
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
