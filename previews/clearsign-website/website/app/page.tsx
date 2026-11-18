import type { Metadata } from 'next';
import Link from 'next/link';
import HeroArt from '../components/hero-art';
import PhoneJourney from '../components/phone-journey';
import TimeCheck from '../components/time-check';
import { Action, Arrow, Eyebrow } from '../components/shared';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  description:
    'ClearSign is a Birmingham team that builds websites, designs brands and makes software for small and medium-sized businesses. See our work or ask us to outline a project.',
};

export default function Home() {
  return (
    <>
      <section className="home-hero" id="hero" aria-labelledby="home-title">
        <div className="wrap studio-hero">
          <Eyebrow>For small and mid-sized businesses</Eyebrow>
          <h1 id="home-title">
            We build websites, <em>brands and software.</em>
          </h1>
          <HeroArt />
          <div className="home-intro">
            <p>
              We find where you’re losing customers or staff time. That might mean fixing a tricky
              booking page or building an AI assistant to answer calls when you’re busy.
            </p>
            <div className="actions">
              <Action href="/contact/" kind="amber">
                Request a project outline
              </Action>
              <Link prefetch={false} href="/demo/" className="quiet-link">
                Book a phone demo <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="home-chapters">
        <PhoneJourney />
        <section className="work-band" id="business-story" aria-labelledby="work-heading">
          <div className="wrap work-grid">
            <div className="work-heading">
              <h2 id="work-heading">Can I see it working?</h2>
            </div>
            <article className="work-example">
              <h3>Takeaway phone assistant</h3>
              <p>
                Try a takeaway order in a guided browser call. Change an item and see what reaches
                the kitchen. Then talk through a call your own team handles.
              </p>
              <Action href="/demo/" kind="text">
                Book a phone assistant demo
              </Action>
            </article>
            <figure className="demo-ticket">
              <figcaption>Example order change</figcaption>
              <blockquote>“Actually, make that two.”</blockquote>
              <div>
                <span>Kitchen ticket after confirmation</span>
                <strong>Qty 2</strong>
              </div>
            </figure>
          </div>
        </section>

        <section className="business-questions" id="your-business" aria-labelledby="fit-heading">
          <div className="wrap fit-grid">
            <h2 id="fit-heading">Where are you losing work or time?</h2>
            <div className="fit-list">
              <Link prefetch={false} href="/service-websites/">
                <div>
                  <h3>People find us. Why don’t they book?</h3>
                  <p>
                    Show customers your work and give them a clear way to book from their phone.
                  </p>
                </div>
                <Arrow />
              </Link>
              <Link prefetch={false} href="/service-automation/">
                <div>
                  <h3>Who’s chasing that quote or invoice?</h3>
                  <p>
                    Give each one an owner and a reminder, so follow-up carries on when the team
                    gets busy.
                  </p>
                </div>
                <Arrow />
              </Link>
              <Link prefetch={false} href="/service-software/">
                <div>
                  <h3>Why do we type the same job in twice?</h3>
                  <p>
                    We check whether your tools can share one record. Staff enter the details once
                    and check what needs their attention.
                  </p>
                </div>
                <Arrow />
              </Link>
              <Link prefetch={false} href="/service-ai/#running-ai">
                <div>
                  <h3>Can we use AI and keep client files here?</h3>
                  <p>
                    We check what can run on your own equipment, who can see the files and what it
                    costs to maintain.
                  </p>
                </div>
                <Arrow />
              </Link>
            </div>
          </div>
        </section>

        <section className="time-section" id="bottlenecks" aria-labelledby="time-heading">
          <div className="wrap time-grid">
            <div className="time-intro">
              <Eyebrow>Check your admin time</Eyebrow>
              <h2 id="time-heading">How much time goes on one repeat job?</h2>
              <p>
                Think about copying booking details or chasing a quote. Use your own numbers to see
                the time it takes. No email needed.
              </p>
            </div>
            <TimeCheck />
          </div>
        </section>

        <section className="working-band" id="business-needs" aria-labelledby="working-heading">
          <div className="wrap working-grid">
            <div>
              <h2 id="working-heading">What happens if I get in touch?</h2>
            </div>
            <div className="working-detail">
              <p>
                You speak directly to our four-person Birmingham team. We check what your existing
                tools can do, then put the proposed work, price and running costs in writing before
                you decide.
              </p>
              <p>Choose one service or put a package together.</p>
              <div className="actions">
                <Action href="/contact/">Request a project outline</Action>
                <Action href="/solutions/" kind="text">
                  Browse our services
                </Action>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
