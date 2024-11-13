import { matchShape } from 'found';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { setLatestNavigatorItinerary } from '../../store/localStorage';
import { configShape, itineraryShape } from '../../util/shapes';
import Icon from '../Icon';

const StartNavi = ({ setNavigation, itinerary }, context) => {
  const { config, intl, match } = context;

  const color =
    config.colors?.accessiblePrimary || config.colors?.primary || 'black';

  const handleClick = () => {
    setNavigation(true);
    setLatestNavigatorItinerary({
      itinerary,
      params: {
        from: match.params.from,
        to: match.params.to,
        arriveBy: match.location.query.arriveBy,
        time: match.location.query.time,
        index: match.params.secondHash ?? match.params.hash,
      },
    });
  };

  return (
    <div className="navi-start-container">
      <button type="button" onClick={handleClick}>
        <Icon img="icon-icon_navigation" color={color} height={2} width={2} />
        <div className="content">
          <FormattedMessage tagName="div" id="new-feature" />
          <FormattedMessage tagName="h3" id="navigation-description" />
        </div>
        <Icon
          img="icon-icon_arrow-collapse--right"
          title={intl.formatMessage({ id: 'continue' })}
          color={color}
          height={1}
          width={1}
        />
      </button>
    </div>
  );
};

StartNavi.propTypes = {
  setNavigation: PropTypes.func.isRequired,
  itinerary: itineraryShape.isRequired,
};

StartNavi.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
  match: matchShape.isRequired,
};

export default StartNavi;
