import type { Metadata } from 'next';
import { Action, Eyebrow } from '../../components/shared';
import DemoRequest from '../../components/demo-request';

export const metadata: Metadata = {
  title: 'Book a phone assistant demo',
  description:
    'Hear ClearSign’s working AI phone assistant take a request, follow a change and pass the details to the team. Arrange a guided demo by email.',
  alternates: { canonical: '/demo/' },
};

export default function Demo() {
  return (
    <>
      <div className="wrap demo-layout">
        <header className="demo-intro">
          <Eyebrow>Guided AI receptionist demo</Eyebrow>
          <h1>
            Book a <em>phone demo.</em>
          </h1>
          <p className="intro-text">
            Try our takeaway voice assistant, then talk through a typical call to your business.
          </p>
        </header>
        <DemoRequest />
        <section className="demo-steps">
          <h2>What you can try</h2>
          <ul className="demo-agenda">
            <li>
              <strong>Ask in your own words.</strong> Place an order and ask a question about the
              menu.
            </li>
            <li>
              <strong>Change a detail.</strong> Adjust an item before confirming. Hear the assistant
              check the updated order with you.
            </li>
            <li>
              <strong>See the handover.</strong> Watch the confirmed order arrive on the team’s
              screen. Then we’ll talk through what your own team would need from a call.
            </li>
          </ul>
        </section>
      </div>
      <section className="compact-section">
        <div className="wrap split">
          <div className="section-lead">
            <Eyebrow>For your business</Eyebrow>
            <h2>Bring a call your team gets every week.</h2>
          </div>
          <div className="prose">
            <p>
              It could be someone asking about a booking, a delivery or a first appointment.
              Together we’ll work out what the assistant should ask, what it can answer and when a
              person should take over.
            </p>
            <Action href="/industries/#accountancy" kind="text">
              Read the accountancy example
            </Action>
          </div>
        </div>
      </section>
    </>
  );
}
