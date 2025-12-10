/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import cx from 'classnames';
import { executeSearch } from '@digitransit-search-util/digitransit-search-util-execute-search-immidiate';
import { useCombobox } from 'downshift';
import Icon from '@digitransit-component/digitransit-component-icon';
import i18n from './utils/i18n';
import styles from './components/styles.scss';
import { getSuggestionValue, suggestionAsAriaContent } from './utils/utils';
import MobileView from './components/MobileView';
import { Input } from './components/Input';
import { Suggestions } from './components/Suggestions';

const getAriaProps = ({
  id,
  ariaLabel,
  lng,
  t,
  isMobile,
  suggestions,
  value,
  required,
}) => {
  const ariaBarId = id.replace('searchfield-', '');
  const SearchBarId =
    ariaLabel || t(ariaBarId, { lng }).replace('searchfield-', '').concat('.'); // Full stop makes screen reader speech clearer.
  const ariaRequiredText = required ? `${t('required', { lng })}.` : '';
  const ariaLabelInstructions = isMobile
    ? t('search-autosuggest-label-instructions-mobile', { lng })
    : t('search-autosuggest-label-instructions-desktop', { lng });
  const movingToDestinationFieldText =
    id === 'origin'
      ? t('search-autosuggest-label-move-to-destination', { lng })
      : '';
  const ariaLabelText = ariaLabelInstructions
    .concat(' ')
    .concat(movingToDestinationFieldText);

  const ariaSuggestionLen = t('search-autosuggest-len', {
    count: suggestions.length,
    lng,
  });

  const ariaCurrentSuggestion =
    suggestionAsAriaContent({ suggestions, t, lng }) || value
      ? t('search-current-suggestion', {
          lng,
          selection:
            suggestionAsAriaContent({ suggestions, t, lng }).toLowerCase() ||
            value,
        })
      : '';

  return {
    SearchBarId,
    ariaRequiredText,
    ariaLabelText,
    ariaSuggestionLen,
    ariaCurrentSuggestion,
  };
};

/**
 * Takes the targets and modifies them based on ownPlaces and isLocationSearch
 * @param {object} props
 * @param {string[]} props.targets
 * @param {boolean} props.isLocationSearch
 * @param {boolean} props.isMobile
 * @param {boolean} props.ownPlaces
 * @param {string[]} props.sources
 * @returns {string[]} newTargets
 */
const getNewTargets = ({
  targets,
  isLocationSearch,
  isMobile,
  ownPlaces,
  sources,
}) => {
  const useAll = !targets?.length;
  let newTargets;
  if (ownPlaces) {
    newTargets = ['Locations'];
    if (useAll || targets.includes('Stops')) {
      newTargets.push('Stops');
    }
    if (useAll || targets.includes('Stations')) {
      newTargets.push('Stations');
    }
    if (useAll || targets.includes('VehicleRentalStations')) {
      newTargets.push('VehicleRentalStations');
    }
  } else if (!useAll) {
    newTargets = [...targets];
    // in desktop, favorites are accessed via sub search
    if (
      isLocationSearch &&
      !isMobile &&
      (!sources.length || sources.includes('Favourite'))
    ) {
      newTargets.push('SelectFromOwnLocations');
    }
  }
  return newTargets;
};

/**
 * @example
 * const searchContext = {
 *   isPeliasLocationAware: false // true / false does Let Pelias suggest based on current user location
 *   minimalRegexp: undefined // used for testing min. regexp. For example: new RegExp('.{2,}'),
 *   lineRegexp: undefined //  identify searches for route numbers/labels: bus | train | metro. For example: new RegExp(
 *    //   '(^[0-9]+[a-z]?$|^[yuleapinkrtdz]$|(^m[12]?b?$))',
 *    //  'i',
 *    //  ),
 *   URL_PELIAS: '' // url for pelias searches
 *   feedIDs: ['HSL', 'HSLLautta'] // FeedId's like  [HSL, HSLLautta]
 *   geocodingSources: ['oa','osm','nlsfi']  // sources for geocoding
 *   geocodingSearchParams; {}  // Searchparmas fro geocoding
 *   getFavouriteLocations: () => ({}),    // Function that returns array of favourite locations.
 *   getFavouriteStops: () => ({}),        // Function that returns array of favourite stops.
 *   getLanguage: () => ({}),              // Function that returns current language.
 *   getFavouriteRoutes: () => ({}),       // Function that returns array of favourite routes.
 *   getPositions: () => ({}),             // Function that returns user's geolocation.
 *   getRoutesQuery: () => ({}),           // Function that returns query for fetching routes.
 *   getStopAndStationsQuery: () => ({}),  // Function that fetches favourite stops and stations from graphql API.
 *   getFavouriteRoutesQuery: () => ({}),  // Function that returns query for fetching favourite routes.
 *   getFavouriteVehicleRentalStations: () => ({}),  // Function that returns favourite bike rental station.
 *   getFavouriteVehicleRentalStationsQuery: () => ({}), // Function that returns query for fetching favourite bike rental stations.
 *   startLocationWatch: () => ({}),       // Function that locates users geolocation.
 *   saveSearch: () => ({}),               // Function that saves search to old searches store.
 *   clearOldSearches: () => ({}),         // Function that clears old searches store.
 *   getFutureRoutes: () => ({}),          // Function that return future routes
 *   saveFutureRoute: () => ({}),          // Function that saves a future route
 *   clearFutureRoutes: () => ({}),        // Function that clears future routes
 * };
 * const lang = 'fi'; // en, fi or sv
 * const onSelect = (item, id) => {
 *    // Funtionality when user selects a suggesions. No default implementation is given.
 *    return null;
 * };
 * const onClear = id => {
 *    // Called  when user clicks the clear search string button. No default implementation.
 *    return null;
 * };
 * const getAutoSuggestIcons: {
 *   // Called for every city bike station rendered as a search suggestion. Should return the icon and
 *   // color used for that station. Two icons are available, 'citybike-stop-digitransit' anditybike-stop-digitransit-secondary'.
 *   citybikes: station => {
 *      return ['citybike-stop-digitransit', '#f2b62d'];
 *   }
 * }
 * const transportMode = undefined;
 * const placeholder = "stop-near-you";
 * const targets = ['Locations', 'Stops', 'Routes']; // Defines what you are searching. Options are Locations, Stops, Stations, Routes, VehicleRentalStations, FutureRoutes, MapPosition and CurrentPosition. Leave empty to search all targets.
 * const sources = ['Favourite', 'History', 'Datasource'] // Defines where you are searching. all available are: Favourite, History (previously searched searches) and Datasource. Leave empty to use all sources.
 * return (
 *  <DTAutosuggest
 *    appElement={appElement} // Required. Root element's id. Needed for react-modal component.
 *    searchContext={searchContext}
 *    icon="origin" // Optional String for icon that is shown left of searchfield. used with Icon library
 *    id="origin" // used for style props and info for component.
 *    placeholder={placeholder} // String that is showns initally in search field
 *    value="" // e.g. user typed string that is shown in search field
 *    onSelect={onSelect}
 *    onClear={onClear}
 *    autoFocus={false} // defines that should this field be automatically focused when page is loaded.
 *    lang={lang}
 *    getAutoSuggestIcons={getAutoSuggestIcons}
 *    transportMode={transportMode} // transportmode with which we filter the routes, e.g. route-BUS
 *    geocodingSize={10} // defines how many stops and stations to fetch from geocoding. Useful if you want to filter the results and still get a reasonable amount of suggestions.
 *    filterResults={results => return results} // Optional filtering function for routes and stops
 *    handelViaPoints={() => return null } // Optional Via point handling logic. This is currently managed with DTAutosuggestpanel by default, but if DTAutosuggest is used seperatelly own implementation must be provided.
 *    focusChange={() => return null} // When suggestion is selected, handle changing focus. This is currently managed with DTAutosuggestpanel by default, but if DTAutosuggest is used seperatelly own implementation must be provided.
 *    storeRef={() => return null} // Functionality to store refs. Currenlty managed with DTAutosuggestpanel by default, but if DTAutosuggest is used seperatelly own implementation must be provided.
 *    sources={sources}
 *    targets={targets}
 *    isMobile  // Optional. Defaults to false. Whether to use mobile search.
 *    mobileLabel="Custom label" // Optional. Custom label text for autosuggest field on mobile.
 *    inputClassName="" // Optional. Custom classname applied to the input element of the component for providing CSS styles.
 *    translatedPlaceholder= // Optional. Custon translated placeholder text for autosuggest field.
 *
 * @param {object} props
 * @param {Element} props.appElement
 * @param {Object} props.searchContext
 * @param {string} props.icon
 * @param {string} props.id
 * @param {string} props.placeholder
 * @param {string} props.value
 * @param {function} props.onSelect
 * @param {function} props.onClear
 * @param {boolean} props.autoFocus
 * @param {string} props.lang
 * @param {Object} props.getAutoSuggestIcons
 * @param {string} props.transportMode
 * @param {number} props.geocodingSize
 * @param {function} props.filterResults
 * @param {function} props.handleViaPoints
 * @param {function} props.focusChange
 * @param {function} props.storeRef
 * @param {string[]} props.sources
 * @param {string[]} props.targets
 * @param {boolean} props.isMobile
 * @param {string} props.mobileLabel
 * @param {string} props.inputClassName
 * @param {string} props.translatedPlaceholder
 * @param {boolean} props.required
 * @param {string} props.color
 * @param {string} props.hoverColor
 * @param {string} props.inputId
 * @param {string} props.dialogSecondaryButtonText
 * @param {function} props.closeHandle
 * @param {string} props.accessiblePrimaryColor
 * @param {Object} props.fontWeights
 * @param {Object} props.modeIconColors
 * @param {string} props.modeSet
 * @param {Object} props.pathOpts
 * @param {Object} props.refPoint
 *
 * @returns {JSX.Element}
 */
function DTAutosuggest({
  appElement,
  searchContext,
  icon,
  id,
  placeholder,
  value: valueIn,
  onSelect,
  onClear,
  lang: lng,
  getAutoSuggestIcons,
  transportMode,
  geocodingSize,
  filterResults,
  handleViaPoints,
  focusChange,
  storeRef,
  targets,
  isMobile,
  mobileLabel,
  inputClassName,
  translatedPlaceholder,
  required,
  color,
  hoverColor,
  ariaLabel,
  accessiblePrimaryColor,
  fontWeights,
  modeIconColors,
  modeSet,
  pathOpts,
  refPoint,
  showScroll,
  ...props
}) {
  const [t] = useTranslation();
  const [shouldRenderMobile, setShouldRenderMobile] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [valid] = useState(true);
  const [isLoading, setLoading] = useState(false);
  const [sources, setSources] = useState(props.sources);
  const [ownPlaces, setOwnPlaces] = useState(false);
  const [pendingSelection, setPendingSelection] = useState(null);

  const enterPressedRef = useRef(null);

  // create and store input ref in the parent if storeRef is provided
  const inputRef = React.useRef(id);
  useEffect(() => {
    if (storeRef) {
      storeRef(inputRef.current);
    }
  }, [inputRef.current]);

  const selectSuggestion = useCallback((suggestion, index) => {
    if (!suggestion) {
      return;
    }
    if (handleViaPoints) {
      handleViaPoints(suggestion, index);
    }
    onSelect(suggestion, id);

    if (focusChange) {
      focusChange();
    }
    if (isMobile) {
      setShouldRenderMobile(false);
    }
  });

  const onSelectedItemChange = changes =>
    selectSuggestion(changes.selectedItem, changes.highlightedIndex);

  const {
    inputValue,
    isOpen,
    highlightedIndex,
    setInputValue,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getItemProps,
    selectItem,
    openMenu,
  } = useCombobox({
    inputId: id,
    defaultHighlightedIndex: 0,
    stateReducer: useCallback(
      (state, { type, changes }) => {
        switch (type) {
          case useCombobox.stateChangeTypes.ItemClick:
          case useCombobox.stateChangeTypes.InputKeyDownEnter: {
            // keep enterPressedRef to make selection when suggestions have loaded
            if (isLoading) {
              enterPressedRef.current = true;
              const { selectedItem, ...changesWitoutSelection } = changes;
              return {
                ...changesWitoutSelection,
                inputValue: state.inputValue,
              };
            }
            // if selecting from own locations, keep menu open and keep old state
            if (changes.selectedItem.type === 'SelectFromOwnLocations') {
              setSources(['Favourite', 'Back']);
              setOwnPlaces(true);
              setPendingSelection(changes.selectedItem.type);
              return { ...state, isOpen: true };
            }
            if (changes.selectedItem.type === 'back') {
              setSources(props.sources);
              setOwnPlaces(false);
              setPendingSelection(null);
              return { ...state, isOpen: true };
            }
            return changes;
          }
          case useCombobox.stateChangeTypes.InputClick: {
            return {
              ...changes,
              isOpen: true,
            };
          }
          case useCombobox.stateChangeTypes.InputBlur: {
            setPendingSelection(null);
            setOwnPlaces(false);
            if (changes.selectedItem !== undefined) {
              const { selectedItem, ...changesWitoutSelection } = changes;
              return changesWitoutSelection;
            }
            return changes;
          }
          default: {
            return changes;
          }
        }
      },
      [isLoading],
    ),
    items: suggestions,
    itemToString(suggestion) {
      return suggestion ? getSuggestionValue(suggestion) : '';
    },
    onSelectedItemChange,
  });

  const clearInput = ref => {
    if (onClear) {
      onClear(id);
    }
    if (ref.current) {
      ref.current.focus();
    }
    setInputValue('');
    openMenu();
  };

  const fetchSuggestions = useCallback(
    input => {
      const useAll = !targets?.length;
      const isLocationSearch = useAll || targets.includes('Locations');

      const newTargets = getNewTargets({
        targets,
        isLocationSearch,
        isMobile,
        ownPlaces,
        sources,
      });
      // remove  location favourites in desktop search (collection item replaces it in target array)
      const newSources = sources
        ? sources.filter(
            s =>
              !(
                isLocationSearch &&
                s === 'Favourite' &&
                !ownPlaces &&
                !isMobile
              ),
          )
        : sources;
      executeSearch(
        newTargets,
        newSources,
        transportMode,
        searchContext,
        filterResults,
        geocodingSize,
        {
          input: input || '',
        },
        searchResult => {
          if (searchResult == null) {
            setLoading(true);
            return;
          }

          const newSuggestions = (searchResult.results || [])
            .filter(
              suggestion =>
                suggestion.type !== 'FutureRoute' ||
                (suggestion.type === 'FutureRoute' &&
                  suggestion.properties.time > Date.now() / 1000),
            )
            .map(suggestion => {
              if (
                suggestion.type === 'CurrentLocation' ||
                suggestion.type === 'SelectFromMap' ||
                suggestion.type === 'SelectFromOwnLocations' ||
                suggestion.type === 'back'
              ) {
                const translatedSuggestion = { ...suggestion };
                translatedSuggestion.properties.labelId = t(
                  suggestion.properties.labelId,
                  { lng },
                );
                return translatedSuggestion;
              }
              return suggestion;
            });
          setSuggestions(newSuggestions);
          setLoading(false);
        },
        pathOpts,
        refPoint,
      );
    },
    [
      targets,
      sources,
      transportMode,
      searchContext,
      filterResults,
      geocodingSize,
      ownPlaces,
      isMobile,
      lng,
      pathOpts,
      refPoint,
      id,
      t,
    ],
  );

  // when menu is closed, return to prop given value
  useEffect(() => {
    if (!isOpen && !enterPressedRef.current) {
      setInputValue(valueIn || '');
    }
  }, [valueIn, isOpen, setInputValue]);

  // Fetch suggestions
  useEffect(() => {
    if (isOpen) {
      fetchSuggestions(inputValue);
    }
  }, [isOpen, inputValue, fetchSuggestions]);

  useEffect(() => {
    if (enterPressedRef.current && !isLoading) {
      selectSuggestion(suggestions[0], 0);
      enterPressedRef.current = false;
    }
  }, [isLoading]);

  const baseItemProps = {
    loading: valid,
    isMobile,
    ariaFavouriteString: t('favourite', { lng }),
    color,
    accessiblePrimaryColor,
    fontWeights,
    getAutoSuggestIcons,
    modeIconColors,
    modeSet,
  };

  const {
    ariaCurrentSuggestion,
    ariaRequiredText,
    SearchBarId,
    ariaLabelText,
  } = getAriaProps({
    id,
    lng,
    t,
    isMobile,
    ariaLabel,
    suggestions,
    inputValue,
    required,
  });

  const mobileClearOldSearches = () => {
    const { context, clearOldSearches, clearFutureRoutes } = searchContext;
    if (context && clearOldSearches) {
      clearOldSearches(context);
      if (clearFutureRoutes) {
        clearFutureRoutes(context);
      }
      fetchSuggestions(inputValue);
    }
  };

  useEffect(() => {
    if (isMobile && isOpen) {
      setShouldRenderMobile(true);
    }
  }, [isMobile, isOpen]);

  const closeHandle = () => {
    setShouldRenderMobile(false);
    setInputValue(valueIn);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const checkPendingSelection = () => {
    if (
      pendingSelection === 'SelectFromOwnLocations' ||
      pendingSelection === 'back'
    ) {
      setInputValue('');
      openMenu();
    }
  };

  useEffect(() => {
    checkPendingSelection();
  }, [pendingSelection]);

  return (
    <>
      {isMobile && (
        <MobileView
          placeholder={placeholder}
          renderMobile={shouldRenderMobile}
          fontWeights={fontWeights}
          clearOldSearches={mobileClearOldSearches}
          closeHandle={closeHandle}
          appElement={appElement}
          mobileLabel={mobileLabel}
          ariaProps={{
            ariaCurrentSuggestion,
            SearchBarId,
            ariaRequiredText,
          }}
          id={id}
          lng={lng}
          onSelectedItemChange={onSelectedItemChange}
          inputValue={inputValue}
          setInputValue={setInputValue}
          clearInput={clearInput}
          suggestions={suggestions}
          itemProps={baseItemProps}
          showScroll={showScroll}
          clearButtonColor={color}
          accessiblePrimaryColor={accessiblePrimaryColor}
          inputClassName={inputClassName}
          required={required}
        />
      )}

      <div
        className={cx([
          styles['autosuggest-input-container'],
          styles[id],
          shouldRenderMobile && 'hidden',
        ])}
        style={{
          '--color': color,
          '--hover-color': hoverColor,
        }}
      >
        {icon && (
          <div
            className={cx([
              styles['autosuggest-input-icon'],
              styles[id],
              inputClassName && styles[`${inputClassName}-input-icon`],
            ])}
            aria-label={ariaRequiredText
              .concat(' ')
              .concat(SearchBarId)
              .concat(' ')
              .concat(t('search-autosuggest-label', { lng }))}
          >
            <Icon img={`${icon}`} />
          </div>
        )}
        <Input
          inputClassName={inputClassName}
          ariaLabel={ariaCurrentSuggestion
            .concat(' ')
            .concat(ariaRequiredText)
            .concat(' ')
            .concat(SearchBarId)
            .concat(' ')
            .concat(ariaLabelText)}
          id={id}
          lng={lng}
          getInputProps={getInputProps}
          getLabelProps={getLabelProps}
          selectItem={selectItem}
          value={inputValue}
          clearInput={clearInput}
          inputRef={inputRef}
          styles={styles}
          clearButtonColor={color}
          placeholder={translatedPlaceholder || t(placeholder, { lng })}
          required={required}
          transportMode={transportMode}
          isMobile={isMobile}
        />

        <Suggestions
          hidden={!isOpen}
          highlightedIndex={highlightedIndex}
          getItemProps={getItemProps}
          getMenuProps={getMenuProps}
          suggestions={suggestions}
          itemProps={baseItemProps}
          lng={lng}
          styles={styles}
        />
      </div>
    </>
  );
}

DTAutosuggest.propTypes = {
  appElement: PropTypes.string.isRequired,
  icon: PropTypes.string,
  id: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  translatedPlaceholder: PropTypes.string,
  value: PropTypes.string,
  searchContext: PropTypes.shape({
    URL_PELIAS: PropTypes.string,
    // eslint-disable-next-line
    context: PropTypes.object,
    clearOldSearches: PropTypes.func,
    clearFutureRoutes: PropTypes.func,
  }).isRequired,
  ariaLabel: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  transportMode: PropTypes.string,
  filterResults: PropTypes.func,
  geocodingSize: PropTypes.number,
  onClear: PropTypes.func,
  storeRef: PropTypes.func,
  handleViaPoints: PropTypes.func,
  focusChange: PropTypes.func,
  lang: PropTypes.string,
  sources: PropTypes.arrayOf(PropTypes.string),
  targets: PropTypes.arrayOf(PropTypes.string),
  isMobile: PropTypes.bool,
  color: PropTypes.string,
  hoverColor: PropTypes.string,
  accessiblePrimaryColor: PropTypes.string,
  pathOpts: PropTypes.shape({
    routesPrefix: PropTypes.string,
    stopsPrefix: PropTypes.string,
  }),
  mobileLabel: PropTypes.string,
  refPoint: PropTypes.shape({
    address: PropTypes.string,
    lat: PropTypes.number,
    lon: PropTypes.number,
  }),
  inputClassName: PropTypes.string,
  fontWeights: PropTypes.shape({
    medium: PropTypes.number,
  }),
  modeIconColors: PropTypes.objectOf(PropTypes.string),
  getAutoSuggestIcons: PropTypes.objectOf(PropTypes.func),
  required: PropTypes.bool,
  modeSet: PropTypes.string,
  // showScroll: PropTypes.bool,
  // isEmbedded: PropTypes.bool,
  showScroll: PropTypes.bool,
};

DTAutosuggest.defaultProps = {
  icon: undefined,
  value: '',
  transportMode: undefined,
  filterResults: undefined,
  onClear: undefined,
  lang: 'fi',
  storeRef: undefined,
  handleViaPoints: undefined,
  focusChange: undefined,
  getAutoSuggestIcons: undefined,
  sources: [],
  targets: undefined,
  isMobile: false,
  // isEmbedded: false,
  geocodingSize: undefined,
  color: '#007ac9',
  hoverColor: '#0062a1',
  accessiblePrimaryColor: '#0074be',
  pathOpts: {
    routesPrefix: 'linjat',
    stopsPrefix: 'pysakit',
  },
  ariaLabel: undefined,
  mobileLabel: undefined,
  inputClassName: '',
  translatedPlaceholder: undefined,
  fontWeights: {
    medium: 500,
  },
  modeIconColors: undefined,
  required: false,
  modeSet: undefined,
  showScroll: false,
  refPoint: {},
};

export default props => {
  return (
    <I18nextProvider i18n={i18n}>
      <DTAutosuggest {...props} />
    </I18nextProvider>
  );
};
