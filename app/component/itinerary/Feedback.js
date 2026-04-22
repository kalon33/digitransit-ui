import cx from 'classnames';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from '../Icon';
import { useConfigContext } from '../../configurations/ConfigContext';

export default function Feedback({}) { // eslint-disable-line
  const { colors } = useConfigContext();
  const iconMap = {
    'personalisation-ask': {
      id: 'icon_star-with-circle',
      color: '#c53291',
    },
    'personalisation-liked': { id: 'icon_thumb', color: colors.primary },
    'personalisation-disliked': {
      id: 'icon_thumb-down',
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
        <Icon
          img={iconProps.id}
          color={iconProps.color}
          height={1.4}
          width={1.4}
        />
        <span>&nbsp;&nbsp;&nbsp;</span>
        <FormattedMessage id={status} />
      </div>
      {status === 'personalisation-ask' && (
        <div className="feedback-section">
          <button type="button" className="thumb-button" onClick={like}>
            <Icon
              img="icon_thumb"
              color={colors.primary}
              height={1}
              width={1}
            />
          </button>
          <button type="button" className="thumb-button" onClick={dislike}>
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
