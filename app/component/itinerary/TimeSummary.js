import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import Icon from '../Icon';
import { durationToString, timeStr } from '../../util/timeUtils';

export default function TimeSummary(props) {
  const duration = durationToString(props.duration * 1000);
  const startTime = timeStr(props.startTime);
  const endTime = timeStr(props.endTime);
  const futureText = props.futureText
    ? props.futureText.charAt(0).toUpperCase() + props.futureText.slice(1)
    : '';

  const departureTime = futureText ? `${futureText}, ${startTime}` : startTime;
  return (
    <span className={cx(props.className)}>
      <span className="sr-only">
        <FormattedMessage
          id="aria-itinerary-summary"
          values={{
            duration,
            inFuture: futureText,
            departureTime,
            arrivalTime: endTime,
          }}
        />{' '}
      </span>
      <Icon img="icon-icon_clock" className="clock" />
      <span className="duration" aria-hidden>
        {duration}
        {props.futureText !== '' && props.multiRow && (
          <span data-text={futureText} />
        )}
        <span
          data-text={
            props.multiRow && props.futureText !== ''
              ? `${startTime} - ${endTime}`
              : `${futureText} ${startTime} - ${endTime}`
          }
        />
      </span>
    </span>
  );
}

TimeSummary.propTypes = {
  duration: PropTypes.number.isRequired,
  className: PropTypes.string,
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
  futureText: PropTypes.string,
  multiRow: PropTypes.bool,
};

TimeSummary.defaultProps = {
  className: '',
  futureText: '',
  multiRow: false,
};
