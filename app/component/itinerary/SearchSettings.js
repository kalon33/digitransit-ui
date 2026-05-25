import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

import RightOffcanvasToggle from './RightOffcanvasToggle';
import DatetimepickerContainer from '../DatetimepickerContainer';
import { useConfigContext } from '../../configurations/ConfigContext';

export default function SearchSettings({ toggleSettings }) {
  const config = useConfigContext();

  return (
    <div className={cx(['searchsettings-container'])}>
      <div className="datetimepicker-container">
        <DatetimepickerContainer
          realtime={false}
          embedWhenClosed={
            !config.hideItinerarySettings && (
              <div className="open-advanced-settings">
                <RightOffcanvasToggle onToggleClick={toggleSettings} />
              </div>
            )
          }
          embedWhenOpen={
            <div className="open-embed-container">
              <div className="open-advanced-settings open-embed">
                {!config.hideItinerarySettings && (
                  <RightOffcanvasToggle onToggleClick={toggleSettings} />
                )}
              </div>
            </div>
          }
          color={config.colors.primary}
        />
      </div>
    </div>
  );
}

SearchSettings.propTypes = {
  toggleSettings: PropTypes.func.isRequired,
};
