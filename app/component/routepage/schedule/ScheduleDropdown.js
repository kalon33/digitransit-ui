import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useState, useMemo } from 'react';
import Select from 'react-select';
import Icon from '@digitransit-component/digitransit-component-icon';
import isEmpty from 'lodash/isEmpty';
import { useTranslationsContext } from '../../../util/useTranslationsContext';
import { truncateLabel } from '../../../util/stringUtils';
import DropdownIcon from './DropdownIcon';
import { getAriaMessages, getClassNamePrefix } from './scheduleDropdownUtils';

/**
 * ScheduleDropdown
 * Generic dropdown used on the schedule page for stop and date selection.
 */
function ScheduleDropdown({
  alignRight,
  changeTitleOnChange,
  id,
  labelId,
  list,
  onSelectChange,
  title,
}) {
  const intl = useTranslationsContext();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState([]);

  const onMenuOpen = () => setIsMenuOpen(true);
  const onMenuClose = () => setIsMenuOpen(false);

  const handleChange = selectedOption => {
    if (changeTitleOnChange) {
      const option = {
        ...selectedOption,
        label: selectedOption.titleLabel,
      };
      setSelectedValue(option);
    } else {
      setSelectedValue(title);
    }
    if (onSelectChange) {
      onSelectChange(selectedOption.value);
    }
  };

  const optionList = useMemo(() => {
    if (!changeTitleOnChange) {
      return list;
    }

    return list.map(option => {
      const titleLabel = truncateLabel(option.label);
      return {
        value: option.value,
        fullLabel: option.label,
        label: (
          <>
            <span>{option.label}</span>
            {option.label === title && (
              <Icon img="check" height={1.1525} width={0.904375} />
            )}
          </>
        ),
        titleLabel,
      };
    });
  }, [list, title, changeTitleOnChange]);

  const ariaMessages = useMemo(() => getAriaMessages(intl), [intl]);

  const classNamePrefix = getClassNamePrefix(alignRight, id);

  return (
    <div
      className={cx('dd-container', labelId ? 'withLabel' : '')}
      aria-live="off"
    >
      {labelId && (
        <label
          className={cx('dd-header-title', alignRight ? 'alignRight' : '')}
          id={`aria-label-${id}`}
          htmlFor={`aria-input-${id}`}
        >
          {intl.formatMessage({ id: labelId })}
        </label>
      )}
      {!labelId && (
        <label
          className="dd-header-title sr-only"
          id={`aria-label-${id}`}
          htmlFor={`aria-input-${id}`}
        >
          {title}
        </label>
      )}
      <Select
        aria-labelledby={`aria-label-${id}`}
        ariaLiveMessages={ariaMessages}
        className="dd-select"
        classNamePrefix={classNamePrefix}
        components={{
          DropdownIndicator: () => null,
          IndicatorSeparator: () => null,
        }}
        inputId={`aria-input-${id}`}
        aria-label={
          (isEmpty(selectedValue) &&
            `${
              labelId &&
              intl.formatMessage({
                id: 'route-page.pattern-chosen',
              })
            } ${title}`) ||
          ''
        }
        isSearchable={false}
        name={id}
        menuIsOpen={isMenuOpen}
        onChange={handleChange}
        onMenuOpen={onMenuOpen}
        onMenuClose={onMenuClose}
        options={optionList}
        placeholder={title && <DropdownIcon text={title} />}
        value={!title && <DropdownIcon text={selectedValue} />}
      />
    </div>
  );
}

ScheduleDropdown.propTypes = {
  alignRight: PropTypes.bool,
  changeTitleOnChange: PropTypes.bool,
  id: PropTypes.string.isRequired,
  labelId: PropTypes.string,
  list: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ).isRequired,
  onSelectChange: PropTypes.func,
  title: PropTypes.string,
};

ScheduleDropdown.defaultProps = {
  alignRight: false,
  changeTitleOnChange: true,
  labelId: undefined,
  onSelectChange: undefined,
  title: 'No title',
};

ScheduleDropdown.displayName = 'ScheduleDropdown';

export default ScheduleDropdown;
