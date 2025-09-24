import { FormattedMessage } from 'react-intl';
import React from 'react';

export default function TrafficNow() {
  return (
    <div className="trafficnow-main">
      <div className="tn-centered">
        <div className="trafficnow-header">
          <h1>
            <FormattedMessage id="trafficnow" />
          </h1>
          <FormattedMessage id="trafficnow-description" />
        </div>
        <div className="trafficnow-bottom">
          <div className="trafficnow-filters">filter</div>
          <div className="trafficnow-content">content</div>
        </div>
      </div>
    </div>
  );
}

TrafficNow.propTypes = {};

TrafficNow.defaultProps = {};
