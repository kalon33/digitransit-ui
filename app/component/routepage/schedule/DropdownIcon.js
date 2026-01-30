import React from 'react';
import PropTypes from 'prop-types';
import Icon from '@digitransit-component/digitransit-component-icon';
import { useConfigContext } from '../../../configurations/ConfigContext';
import { truncateLabel } from '../../../util/stringUtils';

/**
 * DropdownIcon - Renders icon for dropdown display
 * Reusable component for consistent dropdown icon rendering
 */
const DropdownIcon = ({ text }) => {
  const config = useConfigContext();

  return (
    <>
      <span>{truncateLabel(text)}</span>
      <Icon
        img="arrow-dropdown"
        height={0.625}
        width={0.625}
        color={config.colors.primary}
      />
    </>
  );
};

DropdownIcon.propTypes = {
  text: PropTypes.string.isRequired,
};

export default DropdownIcon;
