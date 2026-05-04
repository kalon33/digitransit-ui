import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import SettingsToggle from './SettingsToggle';
import PrModal from './PrModal';
import Snackbar from '../../Snackbar';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import Icon from '../../Icon';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { settingsShape } from '../../../util/shapes';

export default function Personalisation(
  { currentSettings },
  { executeAction },
) {
  const intl = useIntl();
  const [modalOpen, setModalOpen] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(null);
  const [snackbarLiveRegionMessage, setSnackBarLiveRegionMessage] =
    useState('');
  const snackbarTimeout = useRef(null);

  const onToggle = () => {
    const newState = !currentSettings.personalisation;
    addAnalyticsEvent({
      category: 'ItinerarySettings',
      action: `Settings${newState ? 'Enable' : 'Disable'}Personalisation`,
      name: null,
    });
    executeAction(saveRoutingSettings, { personalisation: newState });
    if (newState) {
      setShowSnackbar(true);
      setSnackBarLiveRegionMessage(
        intl.formatMessage({ id: 'personalisation-activated' }),
      );
      snackbarTimeout.current = setTimeout(() => {
        setSnackBarLiveRegionMessage('');
        setShowSnackbar(false);
      }, 4000);
    }
  };

  const handleSnackbarClose = () => {
    clearTimeout(snackbarTimeout.current);
    setSnackBarLiveRegionMessage('');
    setShowSnackbar(false);
  };

  const linkText = intl.formatMessage({ id: 'personalisation-open-info' });
  const words = linkText.split(' ');
  const lastWord = words.pop();
  const start = words.join(' ');

  return (
    <>
      <Snackbar
        show={showSnackbar}
        messageId="personalisation-activated"
        liveRegionMessage={snackbarLiveRegionMessage}
        onClose={handleSnackbarClose}
      />
      <div className="section-header">
        <FormattedMessage id="personalisation" />
      </div>
      <SettingsToggle
        id="settings-toggle-personalisation"
        labelId="personal-itineraries"
        labelStyle="mode-label-upper"
        leftElement={
          <Icon
            img="icon_star-with-circle"
            className="selected-fav"
            height={2}
            width={2}
          />
        }
        toggled={!!currentSettings.personalisation}
        onToggle={onToggle}
      />
      <div className="toggle-info">
        <FormattedMessage id="personalisation-info" />
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            setModalOpen(true);
          }}
        >
          <span className="nobreaks">
            <span className="breakable">{start} </span>
            <span>
              {lastWord}
              <Icon className="arrow" img="icon_arrow-collapse--right" />
            </span>
          </span>
        </button>
      </div>
      {modalOpen && <PrModal closeModal={() => setModalOpen(false)} />}
    </>
  );
}

Personalisation.propTypes = {
  currentSettings: settingsShape.isRequired,
};

Personalisation.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};
