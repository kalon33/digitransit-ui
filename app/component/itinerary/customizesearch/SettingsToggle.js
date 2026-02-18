import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Toggle from '../../Toggle';

export default function SettingsToggle({
  id,
  labelId,
  toggled,
  onToggle,
  icon,
}) {
  return (
    <div className="toggle-container">
      <label htmlFor={id} className="settings-header">
        {icon}
        <FormattedMessage id={labelId} />
        <Toggle id={id} toggled={toggled} onToggle={onToggle} />
      </label>
    </div>
  );
}

SettingsToggle.propTypes = {
  id: PropTypes.string.isRequired,
  labelId: PropTypes.string.isRequired,
  toggled: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  icon: PropTypes.node,
};

SettingsToggle.defaultProps = { icon: undefined };
