import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { intlShape } from 'react-intl';
import { configShape } from '../../../../util/shapes';
import NavigatorModal from '../NavigatorModal';
import NavigatorIntro from './NavigatorIntro';

const NavigatorIntroModal = ({ onPrimaryClick, onClose }, context) => {
  const { config } = context;
  const [logo, setLogo] = useState();

  useEffect(() => {
    if (!config.navigationLogo) {
      return;
    }

    const loadLogo = async () => {
      try {
        const importedLogo = await import(
          /* webpackChunkName: "main" */ `../../../../configurations/images/${config.navigationLogo}`
        );
        setLogo(importedLogo.default);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading logo:', error);
      }
    };

    loadLogo();
  }, []);

  return (
    <NavigatorModal isOpen withBackdrop>
      <NavigatorIntro
        logo={logo}
        onPrimaryClick={onPrimaryClick}
        onClose={onClose}
      />
    </NavigatorModal>
  );
};

NavigatorIntroModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onPrimaryClick: PropTypes.func,
};

NavigatorIntroModal.defaultProps = {
  onPrimaryClick: undefined,
};

NavigatorIntroModal.contextTypes = {
  intl: intlShape.isRequired,
  config: configShape.isRequired,
};

export default NavigatorIntroModal;
