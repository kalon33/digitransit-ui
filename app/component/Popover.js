import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, FormattedMessage } from 'react-intl';
import Icon from './Icon';
import { isKeyboardSelectionEvent } from '../util/browser';

export default function Popover(
  { onCloseClick, message, buttonText },
  { intl },
) {
  const closeLabel = intl.formatMessage({
    id: 'close',
    defaultMessage: 'Close',
  });
  return (
    <>
      <div className="popover-arrow" />
      <div className="popover">
        <Icon img="icon_checkmark" className="checkmark" />
        <div className="popover-content">
          <div className="popover-message-content">
            {message}
            <button
              type="button"
              tabIndex="0"
              onClick={() => onCloseClick(false)}
              onKeyPress={e =>
                isKeyboardSelectionEvent(e) && onCloseClick(false)
              }
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
            onClick={() => onCloseClick(true)}
            onKeyPress={e => isKeyboardSelectionEvent(e) && onCloseClick(true)}
            className="popover-acknowledge-button"
            aria-label={intl.formatMessage({
              id: 'acknowledged',
              defaultMessage: 'Understood',
            })}
          >
            {buttonText || (
              <FormattedMessage
                id="popover-button-got-it"
                defaultMessage="Got it!"
              />
            )}
          </button>
        </div>
      </div>
    </>
  );
}

Popover.propTypes = {
  onCloseClick: PropTypes.func.isRequired,
  message: PropTypes.node.isRequired,
  buttonText: PropTypes.node,
};

Popover.defaultProps = {
  buttonText: null,
};

Popover.contextTypes = {
  intl: intlShape.isRequired,
};

Popover.displayName = 'Popover';
