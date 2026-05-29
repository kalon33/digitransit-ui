import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { ButtonLink } from '@hsl-fi/layout-primitives';
import cx from 'classnames';
import Link from 'found/Link';
import { useLazyLoadQuery } from 'react-relay/hooks';
import { useConfigContext } from '../../configurations/ConfigContext';
import { getFormattedTimeDate } from '../../util/timeUtils';
import { AlertSeverityLevelType } from '../../constants';
import Card from '../Card';
import DisruptionBadge from './DisruptionBadge';
import RouteBadges from './RouteBadges';
import Icon from '../Icon';
import AlertsQuery from './queries/AlertsQuery';

const DATE_FORMAT = 'd.L.yyyy';

const DisruptionDetailsContainer = ({ alertId, isMobile = false }) => {
  const config = useConfigContext();
  const intl = useIntl();
  const { alerts } = useLazyLoadQuery(AlertsQuery, {
    feedIds: config.feedIds,
  });

  const alert = alerts?.find(a => a.id === alertId);

  if (!alert) {
    return (
      <>
        <div
          className={cx('detail-view__cta-container', {
            'detail-view__cta-container--mobile': isMobile,
          })}
        >
          <Link to="/liikenne" className="cta-small">
            <Icon img="icon_chevron-left" />
            <FormattedMessage id="traffic-now_go-back" />
          </Link>
        </div>
        <div className="disruption-details__empty">
          <FormattedMessage
            id="disruption-not-found"
            defaultMessage="Disruption not found"
          />
        </div>
      </>
    );
  }

  const {
    alertSeverityLevel,
    alertEffect,
    alertHeaderText,
    alertDescriptionText,
    effectiveStartDate,
    effectiveEndDate,
    alertUrl,
    entities,
  } = alert;

  const now = Date.now();
  const isValid =
    now > effectiveStartDate * 1000 && now < effectiveEndDate * 1000;

  const startDate = getFormattedTimeDate(
    effectiveStartDate * 1000,
    DATE_FORMAT,
  );
  const endDate = getFormattedTimeDate(effectiveEndDate * 1000, DATE_FORMAT);

  const checkedUrl =
    alertUrl &&
    (alertUrl.match(/^[a-zA-Z]+:\/\//) ? alertUrl : `http://${alertUrl}`);

  const validity = (
    <span className="disruption-details__validity">
      {isMobile && <div className="separator vertical" />}
      <Icon img={isValid ? 'icon_status' : 'icon_calendar'} />
      <span className={isMobile ? 'routes-m-bold' : 'text-xs-bold'}>
        {intl.formatMessage({
          id: isValid ? 'valid' : 'upcoming',
          defaultMessage: isValid ? 'Active' : 'Upcoming',
        })}
      </span>
      {alertSeverityLevel !== AlertSeverityLevelType.Info && !isMobile && (
        <>
          <div className="separator vertical" />
          <span>
            {startDate}
            {startDate !== endDate && ` - ${endDate}`}
          </span>
        </>
      )}
    </span>
  );

  const content = (
    <>
      <div className="disruption-details__header">
        <DisruptionBadge
          showIcon
          variant={alertSeverityLevel}
          label={alertEffect}
        />
        {validity}
      </div>
      <div className="disruption-details__content">
        {entities && (
          <div className="disruption-details__routes">
            <RouteBadges entities={entities} />
          </div>
        )}
        <h2 className="disruption-details__title">{alertHeaderText}</h2>
        <p className="disruption-details__description">
          {alertDescriptionText}
        </p>
        {checkedUrl && (
          <div className="disruption-details__link">
            <ButtonLink
              size="s"
              href={checkedUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              style={{
                minWidth: isMobile ? '100%' : 'none',
              }}
            >
              {intl.formatMessage({
                id: 'extra-info',
                defaultMessage: 'More info',
              })}
            </ButtonLink>
          </div>
        )}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <div className="detail-view__cta-container detail-view__cta-container--mobile">
          <Link to="/liikenne" className="cta-small">
            <Icon img="icon_chevron-left" />
            <FormattedMessage id="traffic-now_go-back" />
            <div />
          </Link>
        </div>
        <div className="disruption-details disruption-details--mobile">
          {content}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="detail-view__cta-container">
        <Link to="/liikenne" className="cta-small">
          <Icon img="icon_chevron-left" />
          <FormattedMessage id="traffic-now_go-back" />
        </Link>
      </div>
      <div className="disruption-details__container">
        <Card>{content}</Card>
      </div>
    </>
  );
};

DisruptionDetailsContainer.propTypes = {
  alertId: PropTypes.string.isRequired,
  isMobile: PropTypes.bool,
};

export default DisruptionDetailsContainer;
