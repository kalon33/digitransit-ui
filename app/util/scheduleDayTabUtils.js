/**
 * Utility functions for processing and rendering day tabs in schedules
 */

/**
 * Separate consecutive day sequences into individual groups
 * e.g., '12345' becomes ['12345'], '135' becomes ['1', '35']
 */
export const separateConsecutiveDays = multiDayString => {
  const days = multiDayString.split('');
  const groups = [];
  let currentGroup = days[0];

  for (let i = 1; i < days.length; i++) {
    const currentDay = Number(days[i]);
    const previousDay = Number(days[i - 1]);

    if (currentDay - previousDay === 1) {
      currentGroup += days[i];
    } else {
      groups.push(currentGroup);
      currentGroup = days[i];
    }
  }

  groups.push(currentGroup);
  return groups;
};

/**
 * Process day arrays into tab format
 * @param {Array<string>} dayArray - Array of day patterns
 * @returns {Array<string>|null} Sorted array of day tabs or null if invalid
 */
export const processDayTabs = dayArray => {
  if (!dayArray || (dayArray.length === 1 && dayArray[0] === '1234567')) {
    return null;
  }

  const singleDays = dayArray.filter(s => s.length === 1);
  const multiDays = dayArray.filter(s => s.length > 1);

  // Flatten multi-day sequences into separated groups
  const separatedMultiDays = multiDays.flatMap(separateConsecutiveDays);

  return [...singleDays, ...separatedMultiDays].filter(Boolean).sort();
};

/**
 * Calculate the date for a specific tab
 * @param {DateTime} baseDate - The base date to calculate from
 * @param {string} tab - The tab day pattern (e.g., '1', '12345')
 * @param {boolean} weeksAreSame - Whether current and next weeks are identical
 * @param {DateTime} firstServiceDay - First service day in the first week
 * @returns {DateTime} Calculated date for the tab
 */
export const calculateTabDate = (
  baseDate,
  tab,
  weeksAreSame,
  firstServiceDay,
) => {
  let tabDate = baseDate;
  const firstDayOfTab = Number(tab[0]);
  const calculatedDate = tabDate.plus({ days: firstDayOfTab - 1 });

  if (
    weeksAreSame &&
    firstServiceDay &&
    !tabDate.hasSame(firstServiceDay, 'day')
  ) {
    if (firstServiceDay > calculatedDate) {
      tabDate = tabDate.plus({ days: firstDayOfTab + 6 });
    } else {
      tabDate = calculatedDate;
    }
  } else {
    tabDate = calculatedDate;
  }

  return tabDate;
};

/**
 * Calculate which tab should be initially focused
 * @param {string|null} focusedTab - Currently focused tab if any
 * @param {Array<string>} dayTabs - Array of day tabs
 * @param {string} currentWeekday - Current weekday pattern
 * @param {string} firstDay - First day in the week
 * @param {boolean} isSameWeek - Whether it's the same week as today
 * @param {number} count - Total number of tabs
 * @returns {string} The tab that should be focused
 */
export const calculateFocusedTab = (
  focusedTab,
  dayTabs,
  currentWeekday,
  firstDay,
  isSameWeek,
  count,
) => {
  if (focusedTab) {
    return focusedTab;
  }

  // Find the selected tab
  const selectedTab = dayTabs.find((tab, id) => {
    const isSelectedByDay = tab.indexOf(currentWeekday) !== -1;
    const isFirstDayFallback =
      tab.indexOf(firstDay) !== -1 &&
      !isSameWeek &&
      dayTabs.indexOf(currentWeekday) === id;
    return isSelectedByDay || isFirstDayFallback || count === 1;
  });

  return selectedTab || dayTabs[0];
};
