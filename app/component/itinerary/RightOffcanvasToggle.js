import PropTypes from 'prop-types';
import React, { useState, useCallback, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Icon from '../Icon';
import { isKeyboardSelectionEvent } from '../../util/browser';
import { hasCustomizedSettings } from '../../util/planParamUtil';
import Popover from '../Popover';
import { getDialogState, setDialogState } from '../../store/localStorage';
import { useConfigContext } from '../../configurations/ConfigContext';

export default function RightOffcanvasToggle({
  onToggleClick,
  defaultMessage = 'Settings',
  translationId = 'settings',
}) {
  const { formatMessage } = useIntl();
  const config = useConfigContext();
  const userHasCustomizedSettings = hasCustomizedSettings(config);
  const [isSettingChangeInfoDismissed, setSettingChangeInfoDismissed] =
    useState(getDialogState('setting-change-acknowledged', config));
  const [isPersonalizationInfoDismissed, setPersonalizationInfoDismissed] =
    useState(getDialogState('personalization-acknowledged', config));
  const buttonRef = useRef(null);

  const label = userHasCustomizedSettings
    ? formatMessage({
        id: 'settings-changed-by-you',
        defaultMessage: 'Settings changed',
      })
    : formatMessage({
        id: 'settings-label-change',
        defaultMessage: 'Change settings',
      });

  const dismissTarget = isPersonalizationInfoDismissed
    ? 'setting-change-acknowledged'
    : 'personalization-acknowledged';
  const dismissPopover = useCallback(() => {
    // wait 1 second before dismissing to allow user to see the popover disappearing
    const timeoutId = setTimeout(() => {
      if (dismissTarget === 'setting-change-acknowledged') {
        setSettingChangeInfoDismissed(true);
      } else {
        setPersonalizationInfoDismissed(true);
      }
      setDialogState(dismissTarget);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="right-offcanvas-toggle">
      {!isPersonalizationInfoDismissed && config.personalization && (
        <Popover
          targetRef={buttonRef}
          onClose={dismissPopover}
          message={<FormattedMessage id="personalization-new-feature" />}
          highlight
        />
      )}
      {userHasCustomizedSettings &&
        !isSettingChangeInfoDismissed &&
        isPersonalizationInfoDismissed && (
          <Popover
            targetRef={buttonRef}
            icon={<Icon img="icon_checkmark" className="checkmark" />}
            onClose={dismissPopover}
            message={
              <FormattedMessage
                id="settings-changed-by-you"
                defaultMessage="Settings changed"
              />
            }
          />
        )}
      <div
        ref={buttonRef}
        role="button"
        tabIndex="0"
        onClick={onToggleClick}
        onKeyPress={e => isKeyboardSelectionEvent(e) && onToggleClick()}
        aria-label={label}
        title={label}
        className="noborder cursor-pointer open-advanced-settings-window-button"
      >
        <div>
          <div className="icon-holder">
            <Icon img="icon_settings" />
            {userHasCustomizedSettings && (
              <span className="customized-settings-indicator">
                <Icon img="icon_checkmark" />
              </span>
            )}
          </div>
          <span className="settings-button-text">
            <FormattedMessage
              id={translationId}
              defaultMessage={defaultMessage}
            />
          </span>
        </div>
      </div>
    </div>
  );
}

RightOffcanvasToggle.propTypes = {
  onToggleClick: PropTypes.func.isRequired,
  defaultMessage: PropTypes.string,
  translationId: PropTypes.string,
};
