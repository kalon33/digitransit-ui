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
 * @param {boolean} isMerged - Whether data has been merged
 * @param {string} pastDate - Past date in DATE_FORMAT
 * @returns {DateTime} Calculated date for the tab
 */
export const calculateTabDate = (baseDate, tab, isMerged, pastDate) => {
  let tabDate = baseDate;
  const firstDayOfTab = Number(tab[0]);

  if (isMerged && pastDate && tabDate.toFormat('yyyyMMdd') !== pastDate) {
    const calculatedDate = tabDate.plus({ days: firstDayOfTab - 1 });
    if (pastDate > calculatedDate.toFormat('yyyyMMdd')) {
      tabDate = tabDate.plus({ days: firstDayOfTab + 6 });
    } else {
      tabDate = calculatedDate;
    }
  } else {
    tabDate = tabDate.plus({ days: firstDayOfTab - 1 });
  }

  return tabDate;
};
