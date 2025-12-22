import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import { configShape } from '../../util/shapes';
import Icon from '../Icon';
import {
  getIndoorTranslationId,
  getVerticalTransportationUseIconId,
} from '../../util/indoorUtils';
import {
  IndoorLegType,
  IndoorStepType,
  VerticalDirection,
} from '../../constants';
import ItineraryMapAction from './ItineraryMapAction';

function IndoorStep({
  focusAction,
  type,
  verticalDirection,
  toLevelName,
  isLastPlace,
  onlyOneStep,
  indoorLegType,
}) {
  const [defaultBackgroundImageUrl, setDefaultBackgroundImageUrl] = useState();
  const [indoorBackgroundImageUrl, setIndoorBackgroundImageUrl] = useState();
  useEffect(() => {
    Promise.all([
      import(
        /* webpackChunkName: "dotted-line" */ `../../configurations/images/default/dotted-line.svg`
      ),
      import(
        /* webpackChunkName: "indoor-dotted-line" */ `../../configurations/images/default/indoor-dotted-line.svg`
      ),
    ]).then(([defaultImageUrl, insideImageUrl]) => {
      setDefaultBackgroundImageUrl(`url(${defaultImageUrl.default})`);
      setIndoorBackgroundImageUrl(`url(${insideImageUrl.default})`);
    });
  }, []);

  const indoorTranslationId = getIndoorTranslationId(
    type,
    verticalDirection,
    toLevelName,
  );

  return (
    <div
      style={{ width: '100%', position: 'relative' }}
      className="row itinerary-row"
    >
      <div className="small-offset-2 leg-before indoor-step">
        <div
          className={cx('leg-before-circle', 'circle-fill', 'indoor-step', {
            'only-one-step': onlyOneStep,
          })}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28}>
            <circle
              className="indoor-step-marker"
              width={28}
              cx={11}
              cy={18}
              r={6}
              strokeWidth={4}
            />
          </svg>
        </div>
        <div
          style={{
            backgroundImage:
              isLastPlace &&
              indoorLegType === IndoorLegType.StepsBeforeEntranceInside
                ? defaultBackgroundImageUrl
                : indoorBackgroundImageUrl,
          }}
          className={cx('leg-before-line', 'indoor-step', {
            'only-one-step': onlyOneStep,
          })}
        />
      </div>
      <div className="small-9 columns itinerary-instruction-column intermediate indoor-step">
        <div
          className={cx('itinerary-leg-row-intermediate-indoor-step', {
            'only-one-step': onlyOneStep,
          })}
        >
          <Icon
            img={getVerticalTransportationUseIconId(
              verticalDirection,
              type,
              false,
            )}
            className="itinerary-intermediate-indoor-icon"
          />
          <div className="itinerary-intermediate-indoor-step-info">
            <FormattedMessage
              id={indoorTranslationId}
              defaultMessage="Indoor step"
              values={{ toLevelName }}
            />
          </div>
          <ItineraryMapAction target="" focusAction={focusAction} />
        </div>
      </div>
    </div>
  );
}

IndoorStep.propTypes = {
  focusAction: PropTypes.func.isRequired,
  type: PropTypes.oneOf(Object.values(IndoorStepType)).isRequired,
  verticalDirection: PropTypes.oneOf(Object.values(VerticalDirection)),
  toLevelName: PropTypes.string,
  isLastPlace: PropTypes.bool,
  onlyOneStep: PropTypes.bool,
  indoorLegType: PropTypes.oneOf(Object.values(IndoorLegType)),
};

IndoorStep.defaultProps = {
  verticalDirection: undefined,
  toLevelName: undefined,
  isLastPlace: false,
  onlyOneStep: false,
  indoorLegType: IndoorLegType.NoStepsInside,
};

IndoorStep.contextTypes = {
  config: configShape.isRequired,
};

export default IndoorStep;
