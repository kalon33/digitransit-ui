/**
 * Components using react-intl need an intl context.
 * - shallowWithIntl: injects a real intl object directly into the legacy context
 *   (no wrapping component needed — more reliable with enzyme shallow renders)
 * - mountWithIntl: wraps with IntlProvider + IntlBridge for full mount tests
 */
import React from 'react';
import PropTypes from 'prop-types';
import { mount, shallow } from 'enzyme';
import { createIntl, createIntlCache, IntlProvider } from 'react-intl';
import translations from '../../../app/intl/en';
import IntlBridge from '../../../app/util/IntlBridge';

const getMessages = locale => translations[locale] || {};

const intlCache = createIntlCache();

export const shallowWithIntl = (
  node,
  {
    context = {},
    locale = 'en',
    messages = getMessages(locale),
    ...additionalOptions
  } = {},
) => {
  const intl = createIntl({ locale, messages }, intlCache);
  return shallow(node, {
    context: { intl, ...context },
    ...additionalOptions,
  });
};

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
    intl: PropTypes.object,
    config: PropTypes.object,
    ...childContextTypes,
  };

  return mount(
    <IntlProvider locale={locale} messages={messages}>
      <IntlBridge>{node}</IntlBridge>
    </IntlProvider>,
    {
      context: {
        ...context,
      },
      childContextTypes: fullChildContextTypes,
      ...additionalOptions,
    },
  );
};
