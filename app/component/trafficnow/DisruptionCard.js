import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useConfigContext } from '../../configurations/ConfigContext';
import { AlertSeverityLevelType } from '../../constants';
import { alertShape } from '../../util/shapes';
import { getFormattedTimeDate } from '../../util/timeUtils';
import Card from '../Card';
import DisruptionBadge from './DisruptionBadge';
import Icon from '../Icon';
import RouteBadges from './RouteBadges';

const DATE_FORMAT = 'd.L.yyyy';

export default function DisruptionCard({ alert, onClick = () => {} }) {
  const {
    id,
    alertSeverityLevel,
    alertEffect,
    alertHeaderText,
    entities,
    effectiveStartDate,
    effectiveEndDate,
  } = alert;
  const { colors } = useConfigContext();

  const now = Date.now();
  const isValid =
    now > effectiveStartDate * 1000 && now < effectiveEndDate * 1000;

  const startDate = `${getFormattedTimeDate(
    effectiveStartDate * 1000,
    DATE_FORMAT,
  )}`;
  const endDate = `${getFormattedTimeDate(
    effectiveEndDate * 1000,
    DATE_FORMAT,
  )}`;

  return (
    <Card
      className="disruption-card clickable"
      onClick={() => {
        onClick(id);
      }}
    >
      <header>
        <DisruptionBadge
          showIcon
          variant={alertSeverityLevel}
          label={alertEffect}
        />
        <button type="button">
          <Icon
            img="icon_arrow-collapse--right"
            color={colors.primary}
            className="disruption-card__icon"
          />
        </button>
      </header>
      {entities && <RouteBadges entities={entities} />}
      <h2 className="cta-small">{alertHeaderText}</h2>
      <div className="disruption-card__body-row">
        <div className="disruption-card__body-row-validity text-xs">
          <div className="disruption-card__body-row-validity-icon">
            {isValid ? (
              <>
                <Icon img="icon_status" />
                <FormattedMessage id="valid" default="Active" />
              </>
            ) : (
              <>
                <Icon img="icon_calendar" />
                <FormattedMessage id="upcoming" default="Upcoming" />
              </>
            )}
          </div>
          {alertSeverityLevel !== AlertSeverityLevelType.Info && (
            <>
              <div className="separator vertical" />
              {startDate}
              {startDate !== endDate && ` - ${endDate}`}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

DisruptionCard.propTypes = {
  alert: alertShape.isRequired,
  onClick: PropTypes.func,
};
