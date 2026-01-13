import PropTypes from 'prop-types';
import React from 'react';
import Icon from '@digitransit-component/digitransit-component-icon';
import styles from './styles.scss';

export default function VerticalButton({
  mode,
  modeSet,
  colors,
  withAlert,
  getIconName,
  title,
}) {
  return (
    <span className={styles['transport-mode-icon-container']}>
      <span
        className={styles['transport-mode-icon-with-icon']}
        style={{
          '--bckColor': colors[mode],
          '--borderRadius': '50%',
        }}
      >
        <Icon
          img={getIconName(mode, modeSet, false)}
          width={1.4}
          height={1.4}
        />
        {withAlert && (
          <span className={styles['transport-mode-alert-icon']}>
            <Icon img="caution" color={colors.caution} />
          </span>
        )}
      </span>
      {title}
    </span>
  );
}

VerticalButton.propTypes = {
  mode: PropTypes.string.isRequired,
  modeSet: PropTypes.string.isRequired,
  colors: PropTypes.objectOf(PropTypes.string).isRequired,
  withAlert: PropTypes.bool.isRequired,
  getIconName: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
};
