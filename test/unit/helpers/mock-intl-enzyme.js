/**
 * Components using react-intl need an intl context.
 * AppIntlProvider already provides that, so tests can wrap with it directly.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { mount, shallow } from 'enzyme';
import { intlShape } from 'react-intl';
import translations from '../../../app/intl/en';
import { AppIntlProvider } from '../../../app/util/useTranslationsContext';
import { initFailedFavouriteMessages } from '../../../app/util/messageUtils';

initFailedFavouriteMessages(translations.en, 'en');

const getMessages = locale => translations[locale] || {};

export const shallowWithIntl = (
  node,
  {
    context = {},
    locale = 'en',
    messages = getMessages(locale),
    ...additionalOptions
  } = {},
) =>
  shallow(node, {
    context,
    wrappingComponent: AppIntlProvider,
    wrappingComponentProps: { locale, messages },
    ...additionalOptions,
  });

export const mountWithIntl = (
  node,
  {
    context = {},
    childContextTypes = {},
    locale = 'en',
    messages = getMessages(locale),
    ...additionalOptions
  } = {},
) => {
  const fullChildContextTypes = {
    intl: intlShape,
    config: PropTypes.object, // 👈 important
    ...childContextTypes,
  };

  return mount(
    <AppIntlProvider locale={locale} messages={messages}>
      {node}
    </AppIntlProvider>,
    {
      context: {
        ...context,
      },
      childContextTypes: fullChildContextTypes,
      ...additionalOptions,
    },
  );
};
