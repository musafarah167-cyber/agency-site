import type { Metadata } from 'next';
import Link from 'next/link';
import { PageIntro, Action, CloseSection } from '../../components/shared';
import IndustryList from '../../components/industry-list';
import { sectors, offers, contactLink, serviceLink, demoProfileFor } from '../../content/growth';

export const metadata: Metadata = {
  title: 'Who we help',
  description:
    'Explore possible improvements for transport, professional services, hospitality, salons and trades. Pick your industry to see an example.',
  alternates: { canonical: '/industries/' },
};

export default function Industries() {
  return (
    <>
      <PageIntro
        label="Who we help"
        title="What might change in your business?"
        text="Pick an industry to see a job we could help with. These examples are starting points for a conversation with your team."
      />
      <section className="wrap industry-directory" aria-label="Industry examples">
        <IndustryList>
          {sectors.map((sector) => {
            const offer = offers.find((item) => item.slug === sector.service)!;
            const demo = demoProfileFor(sector.id);
            return (
              <details key={sector.id} name="industry-examples">
                <summary>
                  <h2>{sector.name}</h2>
                  <span className="toggle" aria-hidden="true" />
                </summary>
                <div id={sector.id} className="industry-detail">
                  <p id={sector.id === 'accountancy' ? 'professional' : undefined}>
                    {sector.issue}
                  </p>
                  <p>{sector.change}</p>
                  <p className="measure">
                    <strong>What to track</strong>
                    {sector.measure}
                  </p>
                  <div className="actions">
                    <Action href={contactLink(offer.interest, sector.context)}>
                      Discuss my business
                    </Action>
                    {demo ? (
                      <Link
                        className="quiet-link"
                        prefetch={false}
                        href={'/demo/?sector=' + sector.id}
                      >
                        {demo.action}
                      </Link>
                    ) : (
                      <Link
                        className="quiet-link"
                        prefetch={false}
                        href={serviceLink(sector.service)}
                      >
                        {offer.name} ↗
                      </Link>
                    )}
                  </div>
                </div>
              </details>
            );
          })}
        </IndustryList>
      </section>
      <CloseSection />
    </>
  );
}
