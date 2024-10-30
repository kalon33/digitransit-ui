import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import NaviMessage from './NaviMessage';

// eslint-disable-next-line no-unused-vars
const NaviStack = ({ messages, handleRemove, showSecondary }) => {
  const top = showSecondary ? '212px' : '150px'; // todo not final
  return (
    <div className={cx('info-stack', 'slide-in')} style={{ top }}>
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
  // eslint-disable-next-line
  messages: PropTypes.arrayOf(    PropTypes.shape({
      id: PropTypes.string.isRequired,
      severity: PropTypes.string.isRequired,
    }),
  ).isRequired,
  handleRemove: PropTypes.func.isRequired,
  showSecondary: PropTypes.bool,
};

NaviStack.defaultProps = {
  showSecondary: false,
};

export default NaviStack;
