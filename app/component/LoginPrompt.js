import PropTypes from 'prop-types';
import React from 'react';
import { useIntl } from 'react-intl';
import DialogModal from '@digitransit-component/digitransit-component-dialog-modal';
import { useConfigContext } from '../configurations/ConfigContext';
import { addAnalyticsEvent } from '../util/analyticsUtils';

export default function LoginPrompt({
  isModalOpen,
  onClose,
  onPrimaryClick,
  onSecondaryClick,
}) {
  const intl = useIntl();
  const config = useConfigContext();

  const login = intl.formatMessage({
    id: 'login',
    defaultMessage: 'Log in',
  });

  const cancel = intl.formatMessage({
    id: 'cancel',
    defaultMessage: 'cancel',
  });

  const headerText = intl.formatMessage({
    id: 'login-header',
    defaultMessage: 'Log in first',
  });

  const dialogContent = intl.formatMessage({
    id: 'login-content',
    defaultMessage: 'Log in first',
  });

  const handlePrimaryClick = () => {
    addAnalyticsEvent({
      category: 'Favourite',
      action: 'login',
      name: null,
    });
    onPrimaryClick?.();
  };

  const handleSecondaryClick = () => {
    addAnalyticsEvent({
      category: 'Favourite',
      action: 'login cancelled',
      name: null,
    });
    onSecondaryClick?.();
  };

  return (
    <DialogModal
      appElement="#app"
      headerText={headerText}
      dialogContent={dialogContent}
      handleClose={onClose}
      lang={config.language}
      isModalOpen={isModalOpen}
      primaryButtonText={login}
      href="/login"
      primaryButtonOnClick={handlePrimaryClick}
      secondaryButtonText={cancel}
      secondaryButtonOnClick={handleSecondaryClick}
      colors={config.colors}
    />
  );
}

LoginPrompt.propTypes = {
  isModalOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onPrimaryClick: PropTypes.func,
  onSecondaryClick: PropTypes.func,
};
