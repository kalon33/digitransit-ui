import PropTypes from 'prop-types';
import React from 'react';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import SearchSettingsDropdown, {
  getFiveStepOptions,
} from './SearchSettingsDropdown';
import Toggle from '../../Toggle';
import { findNearestOption } from '../../../util/planParamUtil';
import { settingsShape } from '../../../util/shapes';
import { useTranslationsContext } from '../../../util/useTranslationsContext';
import { useConfigContext } from '../../../configurations/ConfigContext';

export default function WalkingOptionsSection(
  { currentSettings, defaultSettings },
  { executeAction },
) {
  const intl = useTranslationsContext();
  const { defaultOptions } = useConfigContext();
  const walkReluctanceOptions = defaultOptions.walkReluctance;
  const options = getFiveStepOptions(defaultOptions.walkSpeed);
  const currentWalkSelection =
    options.find(option => option.value === currentSettings.walkSpeed) ||
    options.find(
      option =>
        option.value ===
        findNearestOption(currentSettings.walkSpeed, defaultOptions.walkSpeed),
    );
  return (
    <>
      <div className="settings-option-container">
        <SearchSettingsDropdown
          currentSelection={currentWalkSelection}
          defaultValue={defaultSettings.walkSpeed}
          onOptionSelected={value => {
            executeAction(saveRoutingSettings, {
              walkSpeed: value,
            });
            addAnalyticsEvent({
              category: 'ItinerarySettings',
              action: 'ChangeWalkingSpeed',
              name: value,
            });
          }}
          options={options}
          labelText={intl.formatMessage({ id: 'walking-speed' })}
          highlightDefaulValue
          formatOptions
          name="walkspeed"
        />
      </div>
      <div className="settings-option-container">
        <div className="toggle-container">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label
            htmlFor="settings-toggle-avoid-walking"
            className="settings-header toggle-label"
          >
            <div className="toggle-label-text">
              {intl.formatMessage({ id: 'avoid-walking' })}
            </div>
            <Toggle
              id="settings-toggle-avoid-walking"
              toggled={
                currentSettings.walkReluctance === walkReluctanceOptions.least
              }
              onToggle={() => {
                const avoid =
                  currentSettings.walkReluctance !==
                  walkReluctanceOptions.least;
                executeAction(saveRoutingSettings, {
                  walkReluctance: avoid
                    ? walkReluctanceOptions.least
                    : defaultSettings.walkReluctance,
                });
                addAnalyticsEvent({
                  category: 'ItinerarySettings',
                  action: 'ChangeAmountOfWalking',
                  name: avoid ? 'avoid' : 'default',
                });
              }}
            />
          </label>
        </div>
      </div>
    </>
  );
}

WalkingOptionsSection.propTypes = {
  defaultSettings: settingsShape.isRequired,
  currentSettings: settingsShape.isRequired,
};

WalkingOptionsSection.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};
