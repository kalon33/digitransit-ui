import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { matchShape } from 'found';
import { configShape } from '../../util/shapes';
import { otpToLocation } from '../../util/otpStrings';
import { generateMetaData } from '../../util/metaUtils';

function ItineraryPageMeta({ match }, { config, intl }) {
  const { to, from } = match.params;
  const params = {
    from: otpToLocation(from).address,
    to: otpToLocation(to).address,
  };
  const title = intl.formatMessage(
    {
      id: 'summary-page.title',
      defaultMessage: 'Itinerary suggestions',
    },
    params,
  );
  const description = intl.formatMessage(
    {
      id: 'summary-page.description',
      defaultMessage: '{from} - {to}',
    },
    params,
  );
  const props = generateMetaData(
    {
      description,
      title,
    },
    config,
    {
      pathname: `/${encodeURIComponent(from)}/${encodeURIComponent(to)}`,
    },
  );
  return <Helmet {...props} />;
}

ItineraryPageMeta.propTypes = {
  match: matchShape.isRequired,
};

ItineraryPageMeta.contextTypes = {
  config: configShape.isRequired,
  intl: PropTypes.object.isRequired,
};

export default ItineraryPageMeta;
