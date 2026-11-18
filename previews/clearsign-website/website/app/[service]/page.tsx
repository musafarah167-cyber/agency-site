import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ServiceExample from '../../components/service-example';
import { services } from '../../content/services.mjs';
import { offers, contactLink, serviceLink } from '../../content/growth';
import { Action, Arrow, CloseSection } from '../../components/shared';

export const dynamicParams = false;
export function generateStaticParams() {
  return offers.map((o) => ({ service: 'service-' + o.slug }));
}
type Props = { params: Promise<{ service: string }> };
function getService(route: string) {
  const offer = offers.find((o) => 'service-' + o.slug === route);
  const detail = services.find((s) => s.slug === offer?.slug);
  if (!offer || !detail) notFound();
  return { offer, detail };
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { offer } = getService((await params).service);
  return {
    title: offer.name,
    description: offer.line,
    alternates: { canonical: serviceLink(offer.slug) },
  };
}
export default async function Service({ params }: Props) {
  const { offer, detail } = getService((await params).service);
  return (
    <>
      <header className="service-intro wrap">
        <Link prefetch={false} href="/solutions/" className="back-link">
          ← All services
        </Link>
        <div className="project-service-lead">
          <div>
            <h1>{offer.name}</h1>
            <p className="intro-text">{offer.line}</p>
            <div className="actions service-actions">
              <Action href={contactLink(offer.interest)}>Discuss this service</Action>
              {offer.slug === 'ai' ? (
                <Action href="/demo/" kind="text">
                  Book a demo
                </Action>
              ) : (
                <Action href={serviceLink(offer.slug) + '#included'} kind="text">
                  See what’s included
                </Action>
              )}
            </div>
          </div>
          <div id="example" className="service-specimen">
            <ServiceExample slug={offer.slug} />
            <details className="example-notes">
              <summary>
                How this could work for you
                <span className="toggle" aria-hidden="true" />
              </summary>
              <h2>{detail.example.business}</h2>
              <p>{detail.example.trigger}</p>
              <ol>
                {detail.example.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </details>
          </div>
        </div>
      </header>
      <section className="scope-section" id="included">
        <div className="wrap scope-grid">
          <div>
            <h2>What we can do.</h2>
            <p>{detail.benefit}</p>
            {offer.slug === 'ai' && (
              <Action href="/service-ai/#running-ai" kind="text">
                Compare ways to run AI
              </Action>
            )}
          </div>
          <div className="detail-disclosures">
            {detail.included.map((item) => (
              <details key={item.title}>
                <summary>
                  <h3>{item.title}</h3>
                  <span className="toggle" aria-hidden="true" />
                </summary>
                <p>{item.description}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      {offer.slug === 'ai' && (
        <section className="scope-section scope-light" id="running-ai">
          <div className="wrap scope-grid">
            <div>
              <h2>Where would the AI run?</h2>
              <p>
                We check which information can leave your business and compare the cost of the
                options.
              </p>
              <Action href={contactLink(offer.interest, 'AI on our own equipment')} kind="text">
                Discuss private AI
              </Action>
            </div>
            <div className="detail-disclosures">
              <details>
                <summary>
                  <h3>In a tool you already pay for</h3>
                  <span className="toggle" aria-hidden="true" />
                </summary>
                <p>
                  Your software might already summarise emails or draft replies. We check the
                  licence, where the information goes and whether staff find the result useful.
                </p>
              </details>
              <details>
                <summary>
                  <h3>Connected to your existing software</h3>
                  <span className="toggle" aria-hidden="true" />
                </summary>
                <p>
                  An online AI service could draft a job record from an enquiry. We test the
                  connection, agree what it can read and leave approval with your team.
                </p>
              </details>
              <details>
                <summary>
                  <h3>On your own computer or server</h3>
                  <span className="toggle" aria-hidden="true" />
                </summary>
                <p>
                  If files need to stay on site, we can trial a document assistant on your
                  equipment. We check access, backups and external connections. Some software has no
                  licence fee. Equipment, power, updates and support still have a cost.
                </p>
              </details>
            </div>
          </div>
        </section>
      )}
      <section className="scope-section scope-light" id="questions">
        <div className="wrap scope-grid">
          <div>
            <h2>Before you decide.</h2>
            <p>We agree the scope and how you’ll check the result.</p>
          </div>
          <div className="detail-disclosures">
            <details id="results">
              <summary>
                <h3>How can we tell if it helped?</h3>
                <span className="toggle" aria-hidden="true" />
              </summary>
              <p>{detail.measureIntro}</p>
              <ul>
                {detail.measures.map((m) => (
                  <li key={m.title}>
                    <strong>{m.title}. </strong>
                    {m.description}
                  </li>
                ))}
              </ul>
            </details>
            <details>
              <summary>
                <h3>What will we agree before starting?</h3>
                <span className="toggle" aria-hidden="true" />
              </summary>
              <ul>
                {detail.boundaries.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </details>
            {detail.faqs.map((f) => (
              <details key={f.question}>
                <summary>
                  <h3>{f.question}</h3>
                  <span className="toggle" aria-hidden="true" />
                </summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <nav className="wrap related" aria-label="Related services">
        <h2>Related services</h2>
        {detail.related.map((slug) => (
          <Link prefetch={false} key={slug} href={serviceLink(slug)}>
            {offers.find((o) => o.slug === slug)?.name}
            <Arrow />
          </Link>
        ))}
      </nav>
      <CloseSection />
    </>
  );
}
