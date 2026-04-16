const messages = {};

export const favouriteTypes = [
  'stop',
  'station',
  'bikeStation',
  'place',
  'route',
];

/**
 * Generates favourite save or delete error messages
 * that can be stored in MessageStore.
 */
export function initFailedFavouriteMessages(translations, language) {
  const isSave = [false, true];
  favouriteTypes.forEach(type => {
    isSave.forEach(save => {
      const content = {};
      content[language] = [];
      const key = save
        ? `add-favourite-${type}-failed-heading`
        : 'delete-favourite-failed-heading';
      content[language].push({
        type: 'heading',
        content: translations[key],
      });
      content[language].push({
        type: 'text',
        content: translations['favourite-failed-text'],
      });
      messages[key] = {
        id: key,
        persistence: 'repeat',
        priority: 4,
        icon: 'caution_white_exclamation',
        iconColor: '#dc0451',
        backgroundColor: '#fdf0f5',
        type: 'error',
        content,
      };
    });
  });
}

/**
 * Get favourite save or delete error messages
 * @param {string} type the type of the favourite (stop|station|citybike-station|route|place)
 * @param {boolean} isSave if message is generated for failed save, alternatively it's for failed deletion
 * @returns error message that can be added to MessageStore
 */

export function failedFavouriteMessage(type, isSave) {
  const t = favouriteTypes.includes(type) ? type : favouriteTypes[0];
  const key = isSave
    ? `add-favourite-${t}-failed-heading`
    : 'delete-favourite-failed-heading';
  return messages[key];
}
