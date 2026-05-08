import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import cx from 'classnames';
import Modal from '@hsl-fi/modal';
import Icon from '../Icon';
import routeCompare from '../../util/route-compare';
import withBreakpoint from '../../util/withBreakpoint';
import { isKeyboardSelectionEvent } from '../../util/browser';
import { getRouteMode } from '../../util/modeUtils';
import { stopShape } from '../../util/shapes';

function FilterTimeTableModal({
  stop,
  setRoutes,
  showFilterModal,
  showRoutesList,
  breakpoint,
}) {
  const intl = useIntl();

  const [showRoutes, setShowRoutes] = useState(showRoutesList);
  const [allRoutes, setAllRoutes] = useState(showRoutesList.length === 0);

  const updateParent = newOptions => {
    setRoutes({
      showRoutes: newOptions.showRoutes,
    });
  };

  const toggleAllRoutes = () => {
    if (allRoutes) {
      setAllRoutes(false);
      setShowRoutes([]);
      updateParent({ showRoutes: [] });
    } else {
      setAllRoutes(true);
      setShowRoutes([]);
      updateParent({ showRoutes: [] });
    }
  };

  const handleCheckbox = routesToAdd => {
    const chosenRoutes = showRoutes.length > 0 ? showRoutes.slice() : [];

    // concat when handling React state based array to avoid array length being assigned as a value
    const newChosenRoutes =
      chosenRoutes.indexOf(routesToAdd) < 0
        ? chosenRoutes.concat([routesToAdd])
        : chosenRoutes.filter(o => o !== routesToAdd);

    if (newChosenRoutes.length === 0) {
      updateParent({ showRoutes: newChosenRoutes, allRoutes: true });
      setShowRoutes(newChosenRoutes);
      setAllRoutes(true);
    } else {
      updateParent({ showRoutes: newChosenRoutes });
      setShowRoutes(newChosenRoutes);
      setAllRoutes(false);
    }
  };

  const closeModal = () => {
    showFilterModal(false);
  };

  const routeDivs = [];
  const LONG_LINE_NAME = 5;

  // Find out which departures are ARRIVING to their final stop,
  // not real departures, then remove them
  const routesWithStopTimes = stop.stoptimesForServiceDate
    .map(
      o =>
        o.stoptimes.length > 0 &&
        o.stoptimes[0].pickupType !== 'NONE' && {
          code: o.pattern.code,
          headsign: o.pattern.headsign,
          shortName: o.pattern.route.shortName,
          mode: o.pattern.route.mode,
          type: o.pattern.route.type,
          agency: o.pattern.route.agency.name,
        },
    )
    .filter(o => o)
    .sort(routeCompare)
    // deduplicate patterns with same code
    .filter(
      (pattern, index, self) =>
        self.map(itm => itm.code).indexOf(pattern.code) === index,
    );

  routesWithStopTimes.forEach(o => {
    const mode = getRouteMode(o);
    const checked = showRoutes.includes(o.code);

    routeDivs.push(
      <div key={o.code} className="route-row">
        <div className="checkbox-container">
          <input
            type="checkbox"
            aria-label={intl.formatMessage(
              {
                id: 'select-route',
                defaultMessage: 'Select {mode} route {shortName} to {headsign}',
              },
              {
                mode: intl.formatMessage({ id: mode }),
                shortName: o.shortName,
                headsign: o.headsign,
              },
            )}
            checked={checked}
            aria-checked={checked}
            id={`input-${o.code}`}
            onChange={() => handleCheckbox(o.code)}
            onKeyDown={e => {
              if (isKeyboardSelectionEvent(e)) {
                handleCheckbox(o.code);
              }
            }}
          />
          <label
            htmlFor={`input-${o.code}`}
            className={checked ? 'checked' : ''}
          >
            {checked && (
              <Icon img="icon_box-checked" className="checkbox-icon" />
            )}
          </label>
        </div>
        <div className="route-mode">
          <Icon className={mode} img={`icon_${mode}`} />
        </div>
        <div
          className={`route-number ${mode} ${cx({
            'overflow-fade':
              (o.shortName ? o.shortName : o.agency) &&
              (o.shortName ? o.shortName : o.agency).length > LONG_LINE_NAME,
          })}`}
        >
          {o.shortName ? o.shortName : o.agency}
        </div>
        <div className="route-headsign">{o.headsign}</div>
      </div>,
    );
  });

  return (
    <Modal
      appElement="#app"
      contentLabel=""
      closeButtonLabel={intl.formatMessage({ id: 'close' })}
      isOpen
      onCrossClick={closeModal}
      className="filter-stop-modal"
      overlayClassName={
        breakpoint === 'large'
          ? 'filter-stop-modal-overlay'
          : 'mobile mobile-filter-stop-modal-overlay stop-scroll-container'
      }
    >
      <h2 className="filter-stop-modal-header">
        <FormattedMessage id="show-routes" defaultMessage="Show Lines" />
      </h2>

      <div className="all-routes-header">
        <div className="checkbox-container">
          <input
            type="checkbox"
            id="input-all-routes"
            aria-label={intl.formatMessage({
              id: 'select-all-routes',
              defaultMessage: 'Select all routes',
            })}
            checked={allRoutes}
            aria-checked={allRoutes}
            onClick={e => allRoutes === true && e.preventDefault()}
            onKeyDown={e => {
              if (isKeyboardSelectionEvent(e)) {
                toggleAllRoutes(e);
              }
            }}
            onChange={() => {
              toggleAllRoutes();
            }}
          />
          <label
            htmlFor="input-all-routes"
            className={allRoutes ? 'checked' : ''}
          >
            {allRoutes ? (
              <Icon img="icon_box-checked" className="checkbox-icon" />
            ) : null}
          </label>
        </div>
        <div className="all-routes-header-title">
          <FormattedMessage id="all-routes" defaultMessage="All lines" />
        </div>
      </div>

      <div className="routes-container">
        {routeDivs.length > 0 ? routeDivs : null}
      </div>
    </Modal>
  );
}

FilterTimeTableModal.propTypes = {
  stop: stopShape.isRequired,
  setRoutes: PropTypes.func.isRequired,
  showFilterModal: PropTypes.func.isRequired,
  showRoutesList: PropTypes.arrayOf(PropTypes.string).isRequired,
  breakpoint: PropTypes.string.isRequired,
};

export default withBreakpoint(FilterTimeTableModal);
