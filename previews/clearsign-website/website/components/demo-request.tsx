'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { demoProfileFor } from '../content/growth';
import { Arrow } from './shared';
import Accordion from './ui/accordion';

type Profile = ReturnType<typeof demoProfileFor>;

function requestEmail(firm: string, preferredTime: string, profile?: Profile) {
  const body = [
    'Hello ClearSign,',
    'I’d like to book a guided demo of your AI phone assistant.',
    ...(profile
      ? ['I work at ' + profile.firm + ' and would like to discuss ' + profile.topic + '.']
      : []),
    ...(firm.trim() ? ['Firm — ' + firm.trim()] : []),
    preferredTime.trim()
      ? 'My preferred day and time (UK time) — ' + preferredTime.trim()
      : 'Please let me know which times are available.',
  ].join('\r\n\r\n');
  return (
    'mailto:sales@clearsign.uk?subject=' +
    encodeURIComponent('Book a ClearSign phone assistant demo') +
    '&body=' +
    encodeURIComponent(body)
  );
}

function RequestCard({ profile, editable = false }: { profile?: Profile; editable?: boolean }) {
  const [firm, setFirm] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  return (
    <section className="demo-request" aria-labelledby="demo-request-heading">
      <h2 id="demo-request-heading">Arrange a time.</h2>
      <p>
        {profile
          ? 'After the voice demo, we’ll look at ' + profile.topic + '.'
          : 'We’ll email you to agree a time.'}
      </p>
      {editable && (
        <Accordion
          className="demo-options"
          panels={[
            {
              id: 'demo-preferences',
              title: 'Add a time or firm name',
              content: (
                <div className="demo-fields">
                  <label htmlFor="demo-firm">
                    Your firm <small>(optional)</small>
                  </label>
                  <input
                    id="demo-firm"
                    autoComplete="organization"
                    maxLength={140}
                    value={firm}
                    onChange={(event) => setFirm(event.target.value)}
                  />
                  <label htmlFor="demo-time">
                    Preferred day and time <small>(optional)</small>
                  </label>
                  <input
                    id="demo-time"
                    aria-describedby="demo-time-help"
                    maxLength={160}
                    value={preferredTime}
                    onChange={(event) => setPreferredTime(event.target.value)}
                  />
                  <p id="demo-time-help">For example, Thursday morning, UK time.</p>
                </div>
              ),
            },
          ]}
        />
      )}
      <a
        className="action action-dark"
        id="demo-email"
        href={requestEmail(firm, preferredTime, profile)}
      >
        Request demo by email <Arrow />
      </a>
      <p className="demo-send-note">
        Opens an email to <a href="mailto:sales@clearsign.uk">sales@clearsign.uk</a> for you to
        send.{profile && ' We’ll reply to confirm a time.'}
      </p>
    </section>
  );
}

function RequestForFirm() {
  const sector = useSearchParams().get('sector');
  return <RequestCard profile={demoProfileFor(sector)} editable />;
}

export default function DemoRequest() {
  return (
    <Suspense fallback={<RequestCard />}>
      <RequestForFirm />
    </Suspense>
  );
}
