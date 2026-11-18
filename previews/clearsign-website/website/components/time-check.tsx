'use client';

import { useState } from 'react';
import { Action, Arrow } from './shared';
import { contactLink } from '../content/growth';

const numberFormat = new Intl.NumberFormat('en-GB');

function duration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const hourText = `${numberFormat.format(hours)} ${hours === 1 ? 'hour' : 'hours'}`;
  const minuteText = `${numberFormat.format(rest)} ${rest === 1 ? 'minute' : 'minutes'}`;
  if (!hours) return minuteText;
  return rest ? `${hourText} ${minuteText}` : hourText;
}

function wholeNumber(text: string) {
  if (!/^\d+$/.test(text)) return null;
  const value = Number(text);
  return Number.isSafeInteger(value) ? value : null;
}

export default function TimeCheck() {
  const [minutes, setMinutes] = useState('10');
  const [times, setTimes] = useState('12');
  const [edited, setEdited] = useState(false);
  const perTask = wholeNumber(minutes);
  const repeats = wholeNumber(times);
  const weekly = perTask === null || repeats === null ? null : perTask * repeats;
  const valid = weekly !== null && Number.isSafeInteger(weekly * 4);
  const message =
    valid && edited
      ? `Hello ClearSign,\r\n\r\nOne task takes our team ${perTask} minutes each time, ${repeats} times a week. That adds up to ${duration(weekly)} a week. Could we discuss how to reduce that work?\r\n\r\nThe task is: `
      : '';
  return (
    <div className="time-sheet">
      <noscript>
        <style>{'.time-fields { display: none; }'}</style>
        <p>
          Multiply minutes per task by times per week. For example, 10 minutes × 12 jobs is 120
          minutes a week.
        </p>
      </noscript>
      <fieldset className="time-fields">
        <legend className="visually-hidden">Calculate weekly time spent on a task</legend>
        <label htmlFor="minutes-per-task">
          Whole minutes per task
          <input
            id="minutes-per-task"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            aria-invalid={perTask === null || undefined}
            value={minutes}
            onChange={(e) => {
              setEdited(true);
              setMinutes(e.target.value);
            }}
          />
        </label>
        <label htmlFor="tasks-per-week">
          Times per week
          <input
            id="tasks-per-week"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            aria-invalid={repeats === null || undefined}
            value={times}
            onChange={(e) => {
              setEdited(true);
              setTimes(e.target.value);
            }}
          />
        </label>
      </fieldset>
      <div className="time-result" role="status" aria-atomic="true">
        <span className="result-label">
          {edited ? 'Time spent on this task' : 'Example calculation'}
        </span>
        {valid ? (
          <>
            <strong>{duration(weekly)} a week</strong>
            <span>{duration(weekly * 4)} over four similar weeks.</span>
          </>
        ) : (
          <p>
            {perTask === null || repeats === null
              ? 'Use a whole number of zero or more in each field.'
              : 'These numbers are too large to calculate reliably.'}
          </p>
        )}
      </div>
      {message ? (
        <a
          className="action action-text"
          href={
            'mailto:sales@clearsign.uk?subject=Discuss%20a%20repeated%20task&body=' +
            encodeURIComponent(message)
          }
        >
          Email us this estimate <Arrow />
        </a>
      ) : (
        <Action href={contactLink('Admin & follow-up', 'Repeated admin')} kind="text">
          Talk about this task
        </Action>
      )}
    </div>
  );
}
