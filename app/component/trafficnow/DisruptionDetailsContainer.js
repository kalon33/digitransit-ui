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

  const content = (
    <>
      <div className="disruption-details__content">
        <div className="disruption-details__header">
          <DisruptionBadge
            showIcon
            variant={alertSeverityLevel}
            label={alertEffect}
          />
        </div>

        {entities && (
          <div className="disruption-details__routes">
            <RouteBadges entities={entities} />
          </div>
        )}

        <h2 className="heading-xs">{alertHeaderText}</h2>

        <p className="text-m">{alertDescriptionText}</p>
      </div>
      <div className="disruption-details__footer">
        <div className="disruption-details__validity text-xs">
          <div className="disruption-details__validity-icon">
            {isValid ? (
              <>
                <Icon img="icon_status" />
                <span className="routes-s-bold">
                  {intl.formatMessage({
                    id: 'valid',
                    defaultMessage: 'active',
                  })}
                </span>
              </>
            ) : (
              <>
                <Icon img="icon_calendar" />
                <span className="routes-s-bold">
                  {intl.formatMessage({
                    id: 'upcoming',
                    defaultMessage: 'Upcoming',
                  })}
                </span>
              </>
            )}
            {alertSeverityLevel !== AlertSeverityLevelType.Info && (
              <>
                <div className="separator vertical" />
                {startDate}
                {startDate !== endDate && ` - ${endDate}`}
              </>
            )}
          </div>
        </div>
        {alertUrl && (
          <div className="disruption-details__link">
            <ButtonLink
              size="s"
              href={alertUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
            >
              {intl.formatMessage({
                id: 'extra-info',
                defaultMessage: 'Details',
              })}
            </ButtonLink>
          </div>
        )}
      </div>
    </>
  );

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
          {isMobile && <div />}
        </Link>
      </div>

      <div className="disruption-details__container">
        {isMobile ? content : <Card>{content}</Card>}
      </div>
    </>
  );
};

DisruptionDetailsContainer.propTypes = {
  alertId: PropTypes.string.isRequired,
  isMobile: PropTypes.bool,
};

export default DisruptionDetailsContainer;
