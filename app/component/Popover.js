import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import Icon from './Icon';
import { isKeyboardSelectionEvent } from '../util/browser';

export default function Popover({ onClose, message, buttonText = null }) {
  const intl = useIntl();
  const [isPopoverDismissed, setPopoverDismissed] = useState(false);

  const closeLabel = intl.formatMessage({
    id: 'close',
    defaultMessage: 'Close',
  });
  return (
    <div
      className={`popover ${isPopoverDismissed ? 'fade-away' : ''}`}
      aria-live="polite"
      role="alert"
    >
      <Icon img="icon_checkmark" className="checkmark" />
      <div className="popover-content">
        <div className="popover-message-content">
          {message}
          <button
            type="button"
            tabIndex="0"
            onClick={e => {
              e.stopPropagation();
              setPopoverDismissed(true);
              onClose();
            }}
            onKeyDown={e => {
              if (isKeyboardSelectionEvent(e)) {
                e.stopPropagation();
                setPopoverDismissed(true);
                onClose();
              }
            }}
            aria-label={closeLabel}
            title={closeLabel}
            className="noborder cursor-pointer popover-close-button"
          >
            <Icon img="icon_close" />
          </button>
        </div>
        <button
          type="button"
          tabIndex="0"
          onClick={e => {
            e.stopPropagation();
            setPopoverDismissed(true);
            onClose();
          }}
          onKeyDown={e => {
            if (isKeyboardSelectionEvent(e)) {
              e.stopPropagation();
              setPopoverDismissed(true);
              onClose();
            }
          }}
          className="popover-acknowledge-button"
          aria-label={intl.formatMessage({
            id: 'acknowledged',
            defaultMessage: 'Understood',
          })}
        >
          {buttonText || (
            <FormattedMessage id="acknowledged" defaultMessage="Got it!" />
          )}
        </button>
      </div>
    </div>
  );
}

Popover.propTypes = {
  onClose: PropTypes.func.isRequired,
  message: PropTypes.node.isRequired,
  buttonText: PropTypes.node,
};
