import React from 'react';
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { legShape, configShape } from '../../util/shapes';
import TransitLeg from './TransitLeg';
import CallAgencyDisclaimer from './CallAgencyDisclaimer';

const CallAgencyLeg = (
  { leg, currentLanguage, ...props },
  { intl, config },
) => {
  const modeClassName = 'call';
  const { route } = leg;

  const notification =
    config.showRouteDescNotification && route.desc?.length
      ? { content: route.desc, link: route.url }
      : {
          content: 'warning-call-agency',
          link: '',
        };
  const key = `callAgencyNotification-${route.gtfsId}`;
  return (
    <TransitLeg mode={modeClassName} leg={leg} omitDivider {...props}>
      <CallAgencyDisclaimer
        key={key}
        text={notification.content}
        href={notification.link}
        linkText={intl.formatMessage({ id: 'extra-info' })}
        header={intl.formatMessage({ id: 'on-demand-service' })}
      />
    </TransitLeg>
  );
};

CallAgencyLeg.propTypes = {
  leg: legShape.isRequired,
  index: PropTypes.number.isRequired,
  showRouteDescNotification: PropTypes.bool,
  currentLanguage: PropTypes.string.isRequired,
};

CallAgencyLeg.defaultProps = {
  showRouteDescNotification: false,
};

CallAgencyLeg.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};

const connectedComponent = connectToStores(
  CallAgencyLeg,
  ['PreferencesStore'],
  context => ({
    currentLanguage: context.getStore('PreferencesStore').getLanguage(),
  }),
);

export { CallAgencyLeg as Component, connectedComponent as default };
