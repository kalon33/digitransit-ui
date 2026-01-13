import PropTypes from 'prop-types';
import React from 'react';
import Icon from '@digitransit-component/digitransit-component-icon';
import styles from './styles.scss';

export default function HorizontalButton({
  mode,
  modeSet,
  colors,
  withAlert,
  srMsg,
  getIconName,
}) {
  let iconProps;

  if (mode === 'favorite') {
    iconProps = { img: 'star' };
  } else if (mode === 'more') {
    iconProps = {
      img: 'arrow',
      color: colors.primary,
      width: 1.2,
      height: 1.2,
    };
  } else {
    iconProps = {
      img: getIconName(mode, modeSet, true),
      color: colors[mode],
    };
  }

  return (
    <>
      <span className={styles['sr-only']}>{srMsg}</span>
      <span className={styles['transport-mode-icon-container']}>
        <span className={styles['transport-mode-icon-with-icon']}>
          <Icon {...iconProps} />
          {withAlert && (
            <span className={styles['transport-mode-alert-icon']}>
              <Icon img="caution" color={colors.caution} />
            </span>
          )}
        </span>
      </span>
    </>
  );
}

HorizontalButton.propTypes = {
  mode: PropTypes.string.isRequired,
  modeSet: PropTypes.string.isRequired,
  colors: PropTypes.objectOf(PropTypes.string).isRequired,
  srMsg: PropTypes.string.isRequired,
  withAlert: PropTypes.bool.isRequired,
  getIconName: PropTypes.func.isRequired,
};
