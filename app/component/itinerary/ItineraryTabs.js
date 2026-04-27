import PropTypes from 'prop-types';
import React from 'react';
import ItineraryDetails from './ItineraryDetails';
import SwipeableTabs from '../SwipeableTabs';
import { planEdgeShape } from '../../util/shapes';

/* eslint-disable react/no-array-index-key */

function ItineraryTabs({
  planEdges,
  tabIndex,
  recommendedIndex,
  isMobile,
  changeHash,
  ...rest
}) {
  const itineraryTabs = planEdges.map((edge, i) => {
    return (
      <div
        className={`swipeable-tab ${tabIndex !== i && 'inactive'}`}
        key={`itinerary-${i}`}
        aria-hidden={tabIndex !== i}
      >
        <ItineraryDetails
          itinerary={edge.node}
          hideTitle={!isMobile}
          changeHash={isMobile ? changeHash : undefined}
          isMobile={isMobile}
          tabIndex={i}
          recommended={i === recommendedIndex}
          {...rest}
        />
      </div>
    );
  });

  return (
    <SwipeableTabs
      tabs={itineraryTabs}
      tabIndex={tabIndex}
      onSwipe={changeHash}
      classname={isMobile ? 'swipe-mobile-divider' : 'swipe-desktop-view'}
      ariaRole="swipe-summary-page-tab"
    />
  );
}

ItineraryTabs.propTypes = {
  tabIndex: PropTypes.number.isRequired,
  recommendedIndex: PropTypes.number,
  isMobile: PropTypes.bool.isRequired,
  planEdges: PropTypes.arrayOf(planEdgeShape).isRequired,
  changeHash: PropTypes.func,
};

export default ItineraryTabs;
