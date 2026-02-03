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
  if (!data || !data.range) {
    return null;
  }

  const { range, meta } = data;
  const { weeksAreSame, firstServiceDay } = meta || {};
  const { dayArray, wantedDay, weekday: currentWeekday } = range;

  const dayTabs = processDayTabs(dayArray);
  if (!dayTabs || dayTabs.length === 0) {
    return null;
  }

  const count = dayTabs.length;
  const weekStartDate = wantedDay.startOf('week');
  const isSameWeek = weekStartDate.hasSame(DateTime.now(), 'week');
  const firstDay = dayTabs[0][0];
  const isMerged = weeksAreSame;

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

  const tabs = dayTabs.map(tab => {
    const selected = tab === currentFocusedTab;
    const tabDate = calculateTabDate(
      range.weekStart,
      tab,
      isMerged,
      firstServiceDay,
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
      if (activeIndex === -1) {
        return;
      }

      const nextIndex = getNextIndex(activeIndex, count);
      const nextRef = tabRefs.current[dayTabs[nextIndex]];

      if (nextRef?.current) {
        nextRef.current.focus();
        onTabFocus(dayTabs[nextIndex]);
      }
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
  // Data is a structured object from scheduleDataUtils with named fields
  data: PropTypes.shape({
    weeks: PropTypes.shape({
      starts: PropTypes.arrayOf(PropTypes.instanceOf(DateTime)),
      ends: PropTypes.arrayOf(PropTypes.instanceOf(DateTime)),
      days: PropTypes.arrayOf(
        PropTypes.shape({
          patterns: PropTypes.arrayOf(PropTypes.string),
        }),
      ),
    }),
    range: PropTypes.shape({
      timeRange: PropTypes.string,
      wantedDay: PropTypes.instanceOf(DateTime),
      weekday: PropTypes.number,
      dayArray: PropTypes.arrayOf(PropTypes.string),
      weekStart: PropTypes.instanceOf(DateTime),
    }),
    options: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.string,
        date: PropTypes.instanceOf(DateTime),
      }),
    ),
    meta: PropTypes.shape({
      weeksAreSame: PropTypes.bool,
      firstServiceDay: PropTypes.instanceOf(DateTime),
    }),
  }).isRequired,
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
