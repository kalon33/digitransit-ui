import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { IntlProvider, injectIntl } from 'react-intl';

const IntlContext = createContext(null);

export const useTranslationsContext = () => {
  const intl = useContext(IntlContext);
  if (!intl) {
    throw new Error(
      'useTranslationsContext must be used within AppIntlProvider.',
    );
  }
  return intl;
};

const IntlBridge = injectIntl(({ intl, children }) => (
  <IntlContext.Provider value={intl}>{children}</IntlContext.Provider>
));

IntlBridge.propTypes = {
  children: PropTypes.node.isRequired,
};

export function AppIntlProvider({ locale, messages, children }) {
  return (
    <IntlProvider locale={locale} messages={messages}>
      <IntlBridge>{children}</IntlBridge>
    </IntlProvider>
  );
}

AppIntlProvider.propTypes = {
  locale: PropTypes.string.isRequired,
  messages: PropTypes.objectOf(PropTypes.string).isRequired,
  children: PropTypes.node.isRequired,
};
