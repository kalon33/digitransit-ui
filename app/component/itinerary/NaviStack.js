import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import NaviMessage from './NaviMessage';

const NaviStack = ({ messages, handleRemove, classPostfix }) => {
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
  classPostfix: PropTypes.string,
};

NaviStack.defaultProps = {
  classPostfix: '',
};

export default NaviStack;
