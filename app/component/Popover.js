import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import Icon from './Icon';
import { isKeyboardSelectionEvent } from '../util/browser';

export default function Popover({
  icon,
  onClose,
  message,
  buttonText = null,
  targetRef, // element to which popover points at
  highlight = false,
}) {
  const intl = useIntl();
  const [isPopoverDismissed, setPopoverDismissed] = useState(false);

  const closeLabel = intl.formatMessage({
    id: 'close',
    defaultMessage: 'Close',
  });
  const rect = targetRef.current?.getBoundingClientRect();

  if (!rect) {
    return null;
  }
  const popoverTop = rect.bottom + 30;
  const popoverRight = Math.max(16, window.innerWidth - rect.right + 12);

  return (
    <>
      {highlight && (
        <>
          <div className="popover-overlay" />
          <div
            className="popover-highlight"
            style={{
              top: rect.top - 8,
              left: rect.left - 8,
              width: rect.width + 16,
              height: rect.height + 16,
            }}
          />
        </>
      )}
      <div
        className="popover-layer"
        style={{
          top: popoverTop,
          right: popoverRight,
          transform: 'translateX(-50%)',
        }}
      >
        <div
          className={`popover ${isPopoverDismissed ? 'fade-away' : ''}`}
          aria-live="polite"
          role="alert"
        >
          {icon}
          <div className="popover-content">
            <span className="message">{message}</span>
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
      </div>
    </>
  );
}

Popover.propTypes = {
  icon: PropTypes.node,
  onClose: PropTypes.func.isRequired,
  message: PropTypes.node.isRequired,
  buttonText: PropTypes.node,
  targetRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }).isRequired,
  highlight: PropTypes.bool,
};
