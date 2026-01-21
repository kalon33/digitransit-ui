import React, { useState } from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import { configShape } from '../util/shapes';
import Icon from './Icon';
import { useDeepLink } from '../util/vehicleRentalUtils';

export default function Disclaimer(
  {
    header,
    text,
    textId,
    values,
    href,
    linkLabel,
    useLinkButton,
    closable,
    onClose, // hook e.g. for remembering closing
  },
  { config, intl },
) {
  const [showCard, setShowCard] = useState(true);

  const handleClose = () => {
    setShowCard(false);
    if (onClose) {
      onClose();
    }
  };

  const onClick = href?.startsWith('http')
    ? () => {
        window.open(href, '_blank', 'noopener,noreferrer');
      }
    : () => useDeepLink(href, window.location.href);

  if (!showCard) {
    return null;
  }
  return (
    <div className="disclaimer-container">
      <Icon className="info" img="icon_info" />
      <div className="disclaimer">
        <div className="disclaimer-header">
          {header && <h3 className="disclaimer-header-text">{header}</h3>}
          {closable && (
            <button
              className="disclaimer-close"
              aria-label={intl.formatMessage({ id: 'close' })}
              onClick={handleClose}
              type="button"
            >
              <Icon color={config.colors.primary} img="icon_close" />
            </button>
          )}
        </div>
        {text || <FormattedMessage id={textId} values={values} />}
        {href && useLinkButton && (
          <button
            type="button"
            className="external-link-button"
            onClick={e => {
              e.stopPropagation();
              onClick(e);
            }}
          >
            {linkLabel}
          </button>
        )}
        {href && !useLinkButton && (
          <a
            className="external-link"
            href={href}
            target="_blank"
            rel="noreferrer"
          >
            {linkLabel}
            <Icon className="arrow" img="icon_arrow-collapse--right" />
          </a>
        )}
      </div>
    </div>
  );
}

Disclaimer.propTypes = {
  header: PropTypes.oneOf(PropTypes.string, PropTypes.node),
  textId: PropTypes.string,
  text: PropTypes.oneOf(PropTypes.string, PropTypes.node),
  values: PropTypes.objectOf(PropTypes.string),
  href: PropTypes.string,
  linkLabel: PropTypes.oneOf(PropTypes.string, PropTypes.node),
  useLinkButton: PropTypes.bool,
  closable: PropTypes.bool,
  onClose: PropTypes.func,
};

Disclaimer.defaultProps = {
  textId: null,
  text: null,
  values: {},
  href: null,
  linkLabel: null,
  header: null,
  useLinkButton: false,
  closable: false,
  onClose: undefined,
};

Disclaimer.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};
