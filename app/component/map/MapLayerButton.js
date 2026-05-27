import PropTypes from 'prop-types';
import React from 'react';
import withOutsideClick from 'react-click-outside';
import Icon from '../Icon';
import { isKeyboardSelectionEvent } from '../../util/browser';

function BubbleDialog({ icon, setOpen }) {
  return (
    <div
      className="bubble-dialog-component-container"
      onClick={setOpen}
      onKeyDown={e => isKeyboardSelectionEvent(e) && setOpen()}
      role="button"
      tabIndex="0"
    >
      <Icon img={icon} viewBox="0 0 25 25" />
    </div>
  );
}

BubbleDialog.propTypes = {
  icon: PropTypes.string.isRequired,
  setOpen: PropTypes.func.isRequired,
};

export default withOutsideClick(BubbleDialog);
