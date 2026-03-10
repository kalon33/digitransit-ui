import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import { useTranslationsContext } from '../util/useTranslationsContext';

/**
 * A generic snackbar that displays a success notification.
 * The caller is responsible for managing the `show` state transitions and
 * for providing a `liveRegionMessage` for screen-reader announcements.
 */
const SuccessSnackbar = ({
  show,
  messageId,
  defaultMessage,
  liveRegionMessage,
  onClose,
  iconImg,
  className,
}) => {
  const intl = useTranslationsContext();
  return (
    <>
      <div
        className={cx('success-snackbar', className, {
          hide: show === null,
          show: show === true,
          'slide-out': show === false,
        })}
        aria-hidden="true"
      >
        <Icon img={iconImg} omitViewBox />
        <span className="snackbar-text">
          <FormattedMessage id={messageId} defaultMessage={defaultMessage} />
        </span>
        <button
          type="button"
          className="close-button"
          aria-label={intl.formatMessage({
            id: 'close',
            defaultMessage: 'Close notification',
          })}
          onClick={onClose}
          tabIndex="-1"
        >
          <Icon id="close-icon" img="notification-close" omitViewBox />
        </button>
      </div>
      <div className="sr-only" aria-live="polite" role="status">
        {liveRegionMessage}
      </div>
    </>
  );
};

SuccessSnackbar.propTypes = {
  /** null = hidden, true = slide in, false = slide out */
  show: PropTypes.oneOf([null, true, false]),
  messageId: PropTypes.string.isRequired,
  defaultMessage: PropTypes.string.isRequired,
  liveRegionMessage: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  iconImg: PropTypes.string,
  className: PropTypes.string,
};

SuccessSnackbar.defaultProps = {
  show: null,
  liveRegionMessage: '',
  iconImg: 'icon_checkmark-circled',
  className: undefined,
};

export default SuccessSnackbar;
