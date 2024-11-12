import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import NaviMessage from './NaviMessage';

const NaviStack = ({ messages, handleRemove, cardExpanded, legType }) => {
  // Card has 4 sizes: first leg collapsed, expanded
  // and in transit collapsed, expanded.
  let classPostfix = '';
  if (legType === 'in-transit' && cardExpanded) {
    classPostfix = 'expand-transit';
  } else if (legType === 'in-transit') {
    classPostfix = 'in-transit';
  } else if (cardExpanded) {
    classPostfix = 'expanded';
  }
  return (
    <div className={cx('info-stack', 'slide-in', classPostfix)}>
      {messages.map((notification, index) => (
        <NaviMessage
          key={notification.id}
          severity={notification.severity}
          index={index}
          handleRemove={handleRemove}
        >
          {notification.content}
        </NaviMessage>
      ))}
    </div>
  );
};

NaviStack.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      severity: PropTypes.string.isRequired,
    }),
  ).isRequired,
  handleRemove: PropTypes.func.isRequired,
  cardExpanded: PropTypes.bool,
  legType: PropTypes.string,
};

NaviStack.defaultProps = {
  cardExpanded: false,
  legType: '',
};

export default NaviStack;
