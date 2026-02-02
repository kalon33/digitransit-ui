import PropTypes from 'prop-types';
import React, { useMemo, useCallback } from 'react';
import cx from 'classnames';
import dayRangePattern from '@digitransit-util/digitransit-util-day-range-pattern';
import { getTranslatedDayString } from '@digitransit-util/digitransit-util-route-pattern-option-text';
import { DateTime } from 'luxon';
import {
  processDayTabs,
  calculateTabDate,
  calculateFocusedTab,
} from '../../../util/scheduleDayTabUtils';
import { DATA_INDEX, RANGE_INDEX } from '../../../util/scheduleDataUtils';
import { DATE_FORMAT } from '../../../constants';

// Keyboard navigation mapping
const KEYBOARD_ACTIONS = {
  ArrowLeft: (index, count) => (index - 1 + count) % count,
  ArrowRight: (index, count) => (index + 1) % count,
};

/**
 * ScheduleDayTabs - Renders day tabs for schedule navigation
 * Pure presentational component for rendering day of week tabs
 */
const ScheduleDayTabs = ({
  data,
  focusedTab,
  tabRefs,
  onTabClick,
  onTabFocus,
  locale,
}) => {
  if (!data || data.length < 3) {
    return null;
  }

  const range = data[DATA_INDEX.RANGE];
  const dayArray = range?.[RANGE_INDEX.DAY_ARRAY];

  const dayTabs = processDayTabs(dayArray);
  if (!dayTabs || dayTabs.length === 0) {
    return null;
  }

  const count = dayTabs.length;
  const weekStartDate = range[RANGE_INDEX.WANTED_DAY].startOf('week');
  const isSameWeek = weekStartDate.hasSame(DateTime.now(), 'week');
  const firstDay = dayTabs[0][0];
  const currentWeekday = range[RANGE_INDEX.WEEKDAY];
  const isMerged = data[DATA_INDEX.WEEKS_ARE_SAME];
  const pastDate = data[DATA_INDEX.PAST_DATE];

  // Determine which tab should be focused initially
  const currentFocusedTab = useMemo(
    () =>
      calculateFocusedTab(
        focusedTab,
        dayTabs,
        currentWeekday,
        firstDay,
        isSameWeek,
        count,
      ),
    [focusedTab, dayTabs, currentWeekday, firstDay, isSameWeek, count],
  );

  // Callback to safely create/assign refs without mutation during render
  const getTabRef = useCallback(
    tab => {
      if (!tabRefs.current[tab]) {
        // eslint-disable-next-line no-param-reassign
        tabRefs.current[tab] = React.createRef();
      }
      return tabRefs.current[tab];
    },
    [tabRefs],
  );

  const tabs = dayTabs.map((tab, id) => {
    const isSelectedByDay = tab.indexOf(currentWeekday) !== -1;
    const isFirstDayFallback =
      tab.indexOf(firstDay) !== -1 &&
      !isSameWeek &&
      dayTabs.indexOf(currentWeekday) === id;
    const selected = isSelectedByDay || isFirstDayFallback || count === 1;

    const tabDate = calculateTabDate(
      range[RANGE_INDEX.WEEK_START],
      tab,
      isMerged,
      pastDate,
    );

    return (
      <button
        type="button"
        disabled={dayArray.length === 1 && dayTabs.length < 2}
        key={tab}
        className={cx({ 'is-active': selected })}
        onClick={() => onTabClick(tabDate.toFormat(DATE_FORMAT))}
        ref={getTabRef(tab)}
        tabIndex={selected ? 0 : -1}
        role="tab"
        aria-selected={selected}
        style={{ '--totalCount': `${count}` }}
      >
        {getTranslatedDayString(locale, dayRangePattern(tab.split('')), true)}
      </button>
    );
  });

  const handleKeyNavigation = useCallback(
    e => {
      const { code } = e.nativeEvent;
      const getNextIndex = KEYBOARD_ACTIONS[code];

      if (!getNextIndex) {
        return;
      }

      const activeIndex = dayTabs.indexOf(currentFocusedTab);
      const nextIndex = getNextIndex(activeIndex, count);

      tabRefs.current[dayTabs[nextIndex]].current.focus();
      onTabFocus(dayTabs[nextIndex]);
    },
    [currentFocusedTab, dayTabs, count, tabRefs, onTabFocus],
  );

  return (
    <div
      className="route-tabs days"
      role="tablist"
      tabIndex={0}
      onKeyDown={handleKeyNavigation}
    >
      {tabs}
    </div>
  );
};

ScheduleDayTabs.propTypes = {
  // Data is a tuple-like array with fixed structure from scheduleDataUtils:
  // [0]: weekStarts (array of DateTime objects)
  // [1]: days (array of day patterns)
  // [2]: range (object with RANGE_INDEX constants: WANTED_DAY, WEEKDAY, DAY_ARRAY, etc.)
  // [3]: options (array of dropdown options)
  // [4]: weeksAreSame (boolean)
  // [5]: pastDate (boolean)
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.array.isRequired,
  focusedTab: PropTypes.string,
  tabRefs: PropTypes.shape({
    current: PropTypes.objectOf(
      PropTypes.shape({
        current: PropTypes.instanceOf(Element),
      }),
    ),
  }).isRequired,
  onTabClick: PropTypes.func.isRequired,
  onTabFocus: PropTypes.func.isRequired,
  locale: PropTypes.string.isRequired,
};

ScheduleDayTabs.defaultProps = {
  focusedTab: null,
};

export default ScheduleDayTabs;
