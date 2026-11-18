import type { Metadata } from 'next';
import { PageIntro, Action, CloseSection } from '../../components/shared';

export const metadata: Metadata = {
  title: 'About our Birmingham team',
  description:
    'ClearSign is a four-person team in Birmingham covering design, marketing, websites and software. Here is what working with us involves.',
  alternates: { canonical: '/about/' },
};
export default function About() {
  return (
    <>
      <PageIntro
        label="About ClearSign"
        title="A four-person team in Birmingham."
        text="Two of us work on marketing and sales. Two build websites, AI assistants and software. You speak to the people designing and building the work."
      />
      <section className="scope-section" id="our-goal">
        <div className="wrap scope-grid">
          <div>
            <h2>How we work with you.</h2>
            <p>
              Show us a missed enquiry, a slow handover or something customers find hard to do. We
              start there.
            </p>
          </div>
          <ol className="journey" id="business-measures">
            <li>
              <h3>Use what you already have</h3>
              <p>We look at the tools your team pays for and where the job gets stuck.</p>
            </li>
            <li>
              <h3>Know the cost before you start</h3>
              <p>
                We explain what we would change, who would use it and what it would cost to build
                and run.
              </p>
            </li>
            <li>
              <h3>Check whether it helped</h3>
              <p>
                We agree one measure with you, such as time spent on admin or quotes that become
                paid work.
              </p>
            </li>
          </ol>
        </div>
      </section>
      <section className="wrap about-work">
        <h2>Try the voice assistant with us.</h2>
        <div className="actions">
          <Action href="/demo/">Book a phone assistant demo</Action>
        </div>
      </section>
      <CloseSection />
    </>
  );
}
