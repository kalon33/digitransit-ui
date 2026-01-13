import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@hsl-fi/modal';

export default function AllModesModal({
  appElement,
  modalOpen,
  closeModal,
  isMobile,
  language,
  children,
}) {
  const [t] = useTranslation();

  return (
    <Modal
      appElement={appElement}
      closeButtonLabel={(t('close'), { lng: language })}
      variant={isMobile ? 'large' : 'small'}
      isOpen={modalOpen}
      onCrossClick={closeModal}
    >
      {children}
    </Modal>
  );
}

AllModesModal.propTypes = {
  appElement: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  modalOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};
