import type { Metadata } from 'next';
import Link from 'next/link';
import { PageIntro, Action, Arrow } from '../../components/shared';
import { offers, contactLink, serviceLink } from '../../content/growth';

export const metadata: Metadata = {
  title: 'Our services',
  description:
    'Choose from branding, marketing, websites, enquiry follow-up, AI and custom software. ClearSign can do one job or combine services in one project.',
  alternates: { canonical: '/solutions/' },
};

const groups = [
  { title: 'Help customers find you', slugs: ['branding', 'marketing'] },
  { title: 'Turn enquiries into work', slugs: ['websites', 'automation'] },
  { title: 'Cut the work you do by hand', slugs: ['ai', 'software'] },
];

export default function Solutions() {
  return (
    <>
      <PageIntro
        label="Our services"
        title="What can we do for you?"
        text="Choose one service or ask us to put a few together. We’ll check what you already have before suggesting something new."
      />
      <div className="service-directory wrap">
        {groups.map((group) => (
          <section className="directory-group" key={group.title}>
            <h2>{group.title}</h2>
            <ul className="directory-links">
              {group.slugs.map((slug) => {
                const offer = offers.find((item) => item.slug === slug)!;
                return (
                  <li key={slug} id={slug}>
                    <Link prefetch={false} href={serviceLink(slug)}>
                      <span>
                        <strong id={'solution-' + slug}>{offer.name}</strong>
                        <span>{offer.line}</span>
                      </span>
                      <Arrow />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
      <section className="compact-invite">
        <div className="wrap invite-inner">
          <div>
            <h2>Need a few things to work together?</h2>
            <p>
              For a new service, we could design the brand, build the booking page and set up the
              reminders. We’ll price the parts you need in one proposal.
            </p>
          </div>
          <Action href={contactLink('A package of services')}>Discuss a package</Action>
        </div>
      </section>
    </>
  );
}
