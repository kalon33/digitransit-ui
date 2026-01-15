import PropTypes from 'prop-types';
import React from 'react';
import Icon from '@digitransit-component/digitransit-component-icon';
import styles from './styles.scss';

export default function NearYouButton({
  mode,
  modeSet,
  colors,
  getIconName,
  title,
  srMsg,
  withAlert,
  boxed,
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
      img: getIconName(mode, modeSet, boxed),
      color: colors[mode],
    };
  }

  if (!boxed) {
    iconProps = {
      ...iconProps,
      width: 1.4,
      height: 1.4,
    };
  }
  return (
    <>
      {srMsg && <span className={styles['sr-only']}>{srMsg}</span>}
      <span className={styles['transport-mode-icon-container']}>
        <span
          className={styles['transport-mode-icon-with-icon']}
          style={
            boxed ? {} : { '--bckColor': colors[mode], '--borderRadius': '50%' }
          }
        >
          <Icon {...iconProps} />
          {withAlert && (
            <span className={styles['transport-mode-alert-icon']}>
              <Icon img="caution" color={colors.caution} />
            </span>
          )}
        </span>
        {title}
      </span>
    </>
  );
}

NearYouButton.propTypes = {
  mode: PropTypes.string.isRequired,
  modeSet: PropTypes.string.isRequired,
  colors: PropTypes.objectOf(PropTypes.string).isRequired,
  getIconName: PropTypes.func.isRequired,
  title: PropTypes.node,
  srMsg: PropTypes.string,
  withAlert: PropTypes.bool,
  boxed: PropTypes.bool,
};

NearYouButton.defaultProps = {
  title: '',
  srMsg: undefined,
  withAlert: false,
  boxed: false,
};
