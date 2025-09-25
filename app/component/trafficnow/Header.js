import { FormattedMessage } from 'react-intl';
import React from 'react';

export default function Header() {
  return (
    <div className="trafficnow-header">
      <span className="tn-breadcrumb">
        <FormattedMessage id="trafficnow-bread" />{' '}
        <FormattedMessage id="trafficnow" />
      </span>
      <h2>
        <FormattedMessage id="trafficnow" />
      </h2>
      <span className="tn-description">
        <FormattedMessage id="trafficnow-description" />
      </span>
    </div>
  );
}

Header.propTypes = {};
Header.defaultProps = {};
