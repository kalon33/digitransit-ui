import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import dayRangePattern from '@digitransit-util/digitransit-util-day-range-pattern';
import { getTranslatedDayString } from '@digitransit-util/digitransit-util-route-pattern-option-text';
import { DateTime } from 'luxon';
import {
  processDayTabs,
  calculateTabDate,
} from '../../../util/scheduleDayTabUtils';
import { DATA_INDEX, RANGE_INDEX } from '../../../util/scheduleDataUtils';
import { DATE_FORMAT } from '../../../constants';

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

  let currentFocusedTab = focusedTab;

  const tabs = dayTabs.map((tab, id) => {
    const isSelectedByDay = tab.indexOf(currentWeekday) !== -1;
    const isFirstDayFallback =
      tab.indexOf(firstDay) !== -1 &&
      !isSameWeek &&
      dayTabs.indexOf(currentWeekday) === id;
    const selected = isSelectedByDay || isFirstDayFallback || count === 1;

    // Create refs for accessibility
    if (!tabRefs.current[tab]) {
      // eslint-disable-next-line no-param-reassign
      tabRefs.current[tab] = React.createRef();
    }
    if (!currentFocusedTab && selected) {
      currentFocusedTab = tab;
    }

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
        ref={tabRefs.current[tab]}
        tabIndex={selected ? 0 : -1}
        role="tab"
        aria-selected={selected}
        style={{ '--totalCount': `${count}` }}
      >
        {getTranslatedDayString(locale, dayRangePattern(tab.split('')), true)}
      </button>
    );
  });

  const handleKeyNavigation = e => {
    const activeIndex = dayTabs.indexOf(currentFocusedTab);
    let index;

    switch (e.nativeEvent.code) {
      case 'ArrowLeft':
        index = (activeIndex - 1 + count) % count;
        tabRefs.current[dayTabs[index]].current.focus();
        onTabFocus(dayTabs[index]);
        break;
      case 'ArrowRight':
        index = (activeIndex + 1) % count;
        tabRefs.current[dayTabs[index]].current.focus();
        onTabFocus(dayTabs[index]);
        break;
      default:
        break;
    }
  };

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
  // Data is a tuple with fixed structure: [weekStarts, days, range, options, weeksAreSame, pastDate]
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
