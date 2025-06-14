/* eslint-disable jsx-a11y/label-has-associated-control */
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';

import cx from 'classnames';
import { configShape } from '../../../util/shapes';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import Toggle from '../../Toggle';
import Icon from '../../Icon';
import {
  getTransitModes,
  getModes,
  toggleTransportMode,
} from '../../../util/modeUtils';
import { getModeIconColor } from '../../../util/colorUtils';

const TransportModesSection = ({ config }, { executeAction }) => {
  const alternativeNames = config.useAlternativeNameForModes || [];
  const transitModes = getTransitModes(config);
  const selectedModes = getModes(config);

  return (
    <fieldset>
      <legend className="transport-mode-subheader settings-header">
        <FormattedMessage
          id="pick-mode"
          defaultMessage="Transportation modes"
        />
      </legend>
      <div className="transport-modes-container">
        {transitModes.map(mode => {
          const lowerCaseMode = mode.toLowerCase();
          return (
            <div
              className="mode-option-container"
              key={`mode-option-${lowerCaseMode}`}
            >
              <label
                htmlFor={`settings-toggle-${mode}`}
                className={cx(
                  [`mode-option-block`, 'toggle-label'],
                  lowerCaseMode,
                  {
                    disabled: !selectedModes.includes(mode),
                  },
                )}
              >
                <div className="mode-icon">
                  <Icon
                    className={`${mode}-icon`}
                    img={`icon-icon_${lowerCaseMode}`}
                    color={getModeIconColor(config, mode)}
                  />
                </div>
                <div className="mode-name">
                  <FormattedMessage
                    id={
                      alternativeNames.includes(lowerCaseMode)
                        ? `settings-alternative-name-${lowerCaseMode}`
                        : lowerCaseMode
                    }
                    defaultMessage={lowerCaseMode}
                  />
                </div>
                <Toggle
                  id={`settings-toggle-${mode}`}
                  toggled={selectedModes.includes(mode)}
                  onToggle={() =>
                    executeAction(saveRoutingSettings, {
                      modes: toggleTransportMode(mode, config),
                    })
                  }
                />
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
};

TransportModesSection.propTypes = {
  config: configShape.isRequired,
};

TransportModesSection.contextTypes = {
  intl: intlShape.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default TransportModesSection;
