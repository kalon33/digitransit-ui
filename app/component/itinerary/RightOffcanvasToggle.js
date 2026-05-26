import PropTypes from 'prop-types';
import React, { useState, useCallback } from 'react';
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
  const label = userHasCustomizedSettings
    ? formatMessage({
        id: 'settings-changed-by-you',
        defaultMessage: 'Settings changed',
      })
    : formatMessage({
        id: 'settings-label-change',
        defaultMessage: 'Change settings',
      });
  const dismissPopover = useCallback(() => {
    // wait 1 second before dismissing to allow user to see the popover disappearing
    const timeoutId = setTimeout(() => {
      setSettingChangeInfoDismissed(true);
      setDialogState('setting-change-acknowledged');
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="right-offcanvas-toggle">
      {userHasCustomizedSettings && !isSettingChangeInfoDismissed && (
        <Popover
          onClose={dismissPopover}
          message={
            <FormattedMessage
              id="settings-changed-by-you"
              defaultMessage="Settings changed"
            />
          }
          buttonText={
            <FormattedMessage id="acknowledged" defaultMessage="OK" />
          }
        />
      )}
      <div
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
