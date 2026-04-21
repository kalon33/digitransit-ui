import React from 'react';
import { matchShape } from 'found';
import { useIntl } from 'react-intl';
import { configShape } from '../util/shapes';
import { useConfigContext } from '../configurations/ConfigContext';

const language = (lang, highlight, match, intl) => {
  const aria = highlight
    ? intl.formatMessage(
        { id: 'search-current-suggestion' },
        { selection: lang },
      )
    : intl.formatMessage({ id: 'language-selection' }, { language: lang });
  return (
    <a
      id={`lang-${lang}`}
      aria-label={aria}
      key={lang}
      href={`/${lang}${match.location.pathname}${match.location.search}`}
      className={`${(highlight && 'selected') || ''} noborder lang`}
    >
      {lang}
    </a>
  );
};

const LangSelect = ({}, { match }) => { // eslint-disable-line
  const config = useConfigContext();
  const intl = useIntl();
  return (
    <div key="lang-select" id="lang-select">
      {config.availableLanguages.map(lang =>
        language(lang, lang === config.language, match, intl),
      )}
    </div>
  );
};

LangSelect.contextTypes = {
  config: configShape.isRequired,
  match: matchShape.isRequired,
};

export default LangSelect;
