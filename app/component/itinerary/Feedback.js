import PropTypes from 'prop-types';
import cx from 'classnames';
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Icon from '../Icon';
import { useConfigContext } from '../../configurations/ConfigContext';

export default function Feedback({ recommended }) {
  const intl = useIntl();
  const { colors } = useConfigContext();
  const favIcon = recommended
    ? 'icon_star-with-circle'
    : 'icon_star-unselected';
  const iconMap = {
    'personalisation-ask': {
      img: favIcon,
      className: cx('favourite', { selected: recommended }),
      fill: recommended ? '#c53291' : '#FFF',
    },
    'personalisation-liked': { img: 'icon_thumb', color: colors.primary },
    'personalisation-disliked': {
      img: 'icon_thumb-down',
      color: colors.primary,
    },
  };

  // status: ask, liked, disliked
  const [status, setStatus] = useState('personalisation-ask');

  const like = () => {
    setStatus('personalisation-liked');
  };

  const dislike = () => {
    setStatus('personalisation-disliked');
  };

  const iconProps = iconMap[status];

  return (
    <div className="feedback-container">
      <div
        className={cx('feedback-section', {
          'feedback-text-posted': status !== 'personalisation-ask',
        })}
      >
        <Icon {...iconProps} height={1.4} width={1.4} />
        <span>&nbsp;&nbsp;&nbsp;</span>
        <FormattedMessage id={status} />
      </div>
      {status === 'personalisation-ask' && (
        <div className="feedback-section">
          <button
            type="button"
            className="thumb-button"
            onClick={like}
            aria-label={intl.formatMessage({ id: 'personalisation-aria-like' })}
          >
            <Icon
              img="icon_thumb"
              color={colors.primary}
              height={1}
              width={1}
            />
          </button>
          <button
            type="button"
            className="thumb-button"
            onClick={dislike}
            aria-label={intl.formatMessage({
              id: 'personalisation-aria-dislike',
            })}
          >
            <Icon
              img="icon_thumb-down"
              color={colors.primary}
              height={1}
              width={1}
            />
          </button>
        </div>
      )}
    </div>
  );
}

Feedback.propTypes = {
  recommended: PropTypes.bool,
  // setFeedback: PropTypes.func.isRequired,
};
