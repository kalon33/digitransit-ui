import { useTranslationsContext } from './useTranslationsContext';
import { useConfigContext } from '../configurations/ConfigContext';

export const favouriteTypes = [
  'stop',
  'station',
  'bikeStation',
  'place',
  'route',
];

/**
 * Generates a favourite save or delete error message
 * that can be stored in MessageStore.
 *
 * @param {string} type the type of the favourite (stop|station|citybike-station|route|place)
 * @param {boolean} isSave if message is generated for failed save, alternatively it's for failed deletion
 * @returns error message that can be added to MessageStore
 */
export function failedFavouriteMessage(type, isSave) {
  const { language } = useConfigContext();
  const intl = useTranslationsContext();

  const content = {};
  const favouriteType = favouriteTypes.includes(type)
    ? type
    : favouriteTypes[0];
  content[language] = [];

  const headingKey = isSave
    ? `add-favourite-${favouriteType}-failed-heading`
    : 'delete-favourite-failed-heading';
  content[language].push({
    type: 'heading',
    content: intl.formatMessage({ id: headingKey }),
  });

  const textKey = 'favourite-failed-text';
  content[language].push({
    type: 'text',
    content: intl.formatMessage({ id: textKey }),
  });

  return {
    id: isSave
      ? `failedFavouriteSave-${favouriteType}`
      : 'failedFavouriteDeletion',
    persistence: 'repeat',
    priority: 4,
    icon: 'caution_white_exclamation',
    iconColor: '#dc0451',
    backgroundColor: '#fdf0f5',
    type: 'error',
    content,
  };
}
