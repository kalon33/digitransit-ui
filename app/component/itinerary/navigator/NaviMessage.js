import React, { useState } from 'react';
import { intlShape } from 'react-intl';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { configShape } from '../../../util/shapes';

import Icon from '../../Icon';

function NaviMessage(
  { severity, children, index, handleRemove, hideClose, cardAnimation },
  { config },
) {
  const [removingIndex, setRemovingIndex] = useState(null);

  const handleRemoveClick = () => {
    setRemovingIndex(index);
  };

  const handleAnimationEnd = ({ target }) => {
    if (target.classList.contains('slide-out-right')) {
      handleRemove(index);
    }
  };

  let iconId;
  let color;
  switch (severity) {
    case 'INFO':
      iconId = 'notification-bell';
      color = '#0074BF';
      break;
    case 'WARNING':
      iconId = 'icon-icon_attention';
      color = '#FED100';
      break;
    case 'ALERT':
      iconId = 'icon-icon_caution_white_exclamation';
      color = '#DC0451';
      break;
    default:
      iconId = 'notification-bell';
      color = '#0074BF';
  }
  return (
    <div
      className={cx(
        'info-stack-item',
        removingIndex === index ? 'slide-out-right' : cardAnimation,
        `${severity.toLowerCase()}`,
      )}
      onAnimationEnd={handleAnimationEnd}
    >
      <Icon img={iconId} height={1.4} width={1.4} color={color} />
      {children}
      {!hideClose && (
        <button
          type="button"
          className="info-close"
          onClick={() => handleRemoveClick()}
        >
          <Icon
            img="notification-close"
            className="notification-close"
            color={config.colors.primary}
          />
        </button>
      )}
    </div>
  );
}

NaviMessage.propTypes = {
  severity: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  index: PropTypes.number.isRequired,
  handleRemove: PropTypes.func.isRequired,
  hideClose: PropTypes.bool,
  cardAnimation: PropTypes.string.isRequired,
};

NaviMessage.defaultProps = {
  hideClose: false,
};

NaviMessage.contextTypes = {
  intl: intlShape.isRequired,
  config: configShape.isRequired,
};

export default NaviMessage;
