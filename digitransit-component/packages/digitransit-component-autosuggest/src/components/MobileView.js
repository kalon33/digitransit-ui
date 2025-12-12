import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import DialogModal from '@digitransit-component/digitransit-component-dialog-modal';
import Icon from '@digitransit-component/digitransit-component-icon';
import hooks from '@hsl-fi/hooks';
import { useTranslation } from 'react-i18next';
import { useCombobox } from 'downshift';
import mobileStyles from './MobileSearch.scss';
import mobileNoScrollStyles from './MobileNoScroll.scss';
import { Suggestions } from './Suggestions';
import { Input } from './Input';

const isKeyboardSelectionEvent = event => {
  const space = [13, ' ', 'Spacebar'];
  const enter = [32, 'Enter'];
  const key = (event && (event.key || event.which || event.keyCode)) || '';

  if (!key || !space.concat(enter).includes(key)) {
    return false;
  }
  event.preventDefault();
  return true;
};

/**
 * @typedef MobileViewProps
 * @property {string} appElement
 * @property {string} id
 * @property {string} placeholder
 * @property {function} closeHandle
 * @property {function} clearInput
 * @property {array} suggestions
 * @property {function} onSelectedItemChange
 * @property {object} fontWeights
 * @property {function} clearOldSearches
 * @property {object} itemProps
 * @property {string} color
 * @property {string} accessiblePrimaryColor
 * @property {string} hoverColor
 * @property {string} lng
 * @property {object} ariaProps
 * @property {boolean} renderMobile
 * @property {string} clearButtonColor
 * @property {string} inputValue
 * @property {function} setInputValue
 * @property {string} inputClassName
 * @property {boolean} required
 * @property {string} [mobileLabel]
 * @property {boolean} [showScroll]
 *
 * @param {MobileViewProps} props
 * @returns {JSX.Element}
 */
const MobileView = ({
  appElement,
  id,
  placeholder,
  closeHandle,
  clearInput,
  suggestions,
  onSelectedItemChange,
  fontWeights,
  clearOldSearches,
  itemProps,
  color,
  accessiblePrimaryColor,
  hoverColor,
  showScroll,
  lng,
  ariaProps,
  mobileLabel,
  renderMobile,
  clearButtonColor,
  inputValue,
  setInputValue,
  inputClassName,
  required,
}) => {
  const [t] = useTranslation();
  const { lock, unlock } = hooks.useScrollLock();
  const styles = showScroll ? mobileStyles : mobileNoScrollStyles;
  const inputId = `${id}-input`;
  const labelId = `${id}-label`;
  const [isDialogOpen, setDialogOpen] = useState(false);
  const inputRef = React.useRef();

  useEffect(() => {
    ReactModal.setAppElement(appElement);
  }, []);

  useEffect(() => {
    if (renderMobile) {
      lock();
    } else {
      unlock();
    }
  }, [renderMobile]);

  /**
   * independent hooks in mobile view.
   * inputValue and suggestion states are kept in the parent
   */
  const {
    highlightedIndex,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getItemProps,
  } = useCombobox({
    items: suggestions,
    inputValue,
    onInputValueChange: ({ inputValue: newValue }) => setInputValue(newValue),
    onSelectedItemChange,
    defaultHighlightedIndex: -1,
  });
  // call to suppress ref errors from downshift, might need better solution
  getLabelProps({}, { suppressRefError: true });
  getMenuProps({}, { suppressRefError: true });
  getInputProps({}, { suppressRefError: true });
  getItemProps({ index: 0 }, { suppressRefError: true });

  const isOriginDestinationOrViapoint =
    id === 'origin' ||
    id === 'destination' ||
    id === 'via-point' ||
    id === 'origin-stop-near-you';

  const { ariaRequiredText, SearchBarId, ariaCurrentSuggestion } = ariaProps;
  const ariaLabel = ariaRequiredText
    .concat(' ')
    .concat(SearchBarId)
    .concat(' ')
    .concat(ariaCurrentSuggestion);
  return (
    <ReactModal
      isOpen={renderMobile}
      className={styles['mobile-modal']}
      overlayClassName={styles['mobile-modal-overlay']}
      onAfterClose={closeHandle}
      shouldCloseOnEsc
    >
      <div
        className={styles['mobile-modal-content']}
        style={{
          '--color': color,
          '--accessible-primary-color': accessiblePrimaryColor,
          '--hover-color': hoverColor,
          '--font-weight-medium': fontWeights.medium,
        }}
      >
        <div className={styles['combobox-container']} htmlFor={inputId}>
          <button
            type="button"
            className={styles['combobox-icon']}
            onClick={closeHandle}
            onKeyDown={e => isKeyboardSelectionEvent(e) && closeHandle()}
            aria-label={t('cancel', { lng })}
            tabIndex={0}
          >
            <Icon img="arrow" />
          </button>
          <span className={styles['right-column']}>
            <span
              className={styles['combobox-label']}
              id={labelId}
              {...getLabelProps()}
            >
              {mobileLabel}
            </span>
            <Input
              placeholder={
                isOriginDestinationOrViapoint
                  ? t('address-place-or-business', { lng })
                  : placeholder
              }
              id={id}
              lng={lng}
              value={inputValue}
              getInputProps={getInputProps}
              getLabelProps={getLabelProps}
              clearInput={() => clearInput(inputRef)}
              ariaLabel={ariaLabel}
              inputRef={inputRef}
              styles={styles}
              renderLabel={false}
              clearButtonColor={clearButtonColor}
              autoFocus
              inputClassName={inputClassName}
              required={required}
              isMobile
            />
            <Suggestions
              suggestions={suggestions}
              getMenuProps={getMenuProps}
              getItemProps={getItemProps}
              itemProps={itemProps}
              highlightedIndex={highlightedIndex}
              isOpen // when mobile view is open we always want to show suggestions
              hidden={false}
              lng={lng}
              styles={styles}
              renderClearHistoryButton
              handleClearHistory={() => setDialogOpen(true)}
            />
          </span>
        </div>
        <DialogModal
          appElement={appElement}
          isModalOpen={isDialogOpen}
          handleClose={() => setDialogOpen(false)}
          headerText={t('delete-old-searches-header', { lng })}
          primaryButtonText={t('delete', { lng })}
          secondaryButtonText={t('cancel', { lng })}
          primaryButtonOnClick={() => {
            clearOldSearches();
            setDialogOpen(false);
          }}
          secondaryButtonOnClick={() => setDialogOpen(false)}
          color={color}
          hoverColor={hoverColor}
          fontWeights={fontWeights}
          lang={lng}
        />
      </div>
    </ReactModal>
  );
};

MobileView.propTypes = {
  appElement: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  clearInput: PropTypes.func.isRequired,
  clearOldSearches: PropTypes.func.isRequired,
  closeHandle: PropTypes.func.isRequired,
  onSelectedItemChange: PropTypes.func.isRequired,
  inputValue: PropTypes.string.isRequired,
  setInputValue: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired,
  accessiblePrimaryColor: PropTypes.string.isRequired,
  clearButtonColor: PropTypes.string.isRequired,
  hoverColor: PropTypes.string.isRequired,
  fontWeights: PropTypes.shape({
    medium: PropTypes.number.isRequired,
  }).isRequired,
  itemProps: PropTypes.shape({}).isRequired,
  suggestions: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  ariaProps: PropTypes.shape({
    ariaRequiredText: PropTypes.string.isRequired,
    SearchBarId: PropTypes.string.isRequired,
    ariaCurrentSuggestion: PropTypes.string.isRequired,
  }).isRequired,
  inputClassName: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  mobileLabel: PropTypes.string.isRequired,
  required: PropTypes.bool.isRequired,
  renderMobile: PropTypes.bool.isRequired,
  showScroll: PropTypes.bool.isRequired,
  lng: PropTypes.string.isRequired,
};

export default MobileView;
