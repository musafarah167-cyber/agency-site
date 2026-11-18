import { Suspense } from 'react';
import type { Metadata } from 'next';
import Enquiry from '../../components/enquiry';
import { PageIntro, Eyebrow, Action } from '../../components/shared';
import { contactRoles } from '../../content/growth';
export const metadata: Metadata = {
  title: 'Talk to ClearSign',
  description:
    'Tell our Birmingham team where your business is losing enquiries or time. Contact ClearSign for projects, general questions, support and accounts.',
  alternates: { canonical: '/contact/' },
};
export default function Contact() {
  return (
    <>
      <PageIntro
        label="Get in touch"
        title="Request a project outline."
        text="Tell us what’s costing you time or customers. We’ll talk it through and, if we can help, set out the work, price and running costs in writing."
      >
        <Action href="#project-enquiry">Start my enquiry</Action>
      </PageIntro>
      <section className="contact-section">
        <div className="wrap contact-grid">
          <aside>
            <Eyebrow>Get to the right person</Eyebrow>
            <h2>Email us directly.</h2>
            <dl className="roles">
              {contactRoles.map((r) => (
                <div key={r.address}>
                  <dt>{r.title}</dt>
                  <dd>
                    <a href={'mailto:' + r.address + '@clearsign.uk'}>
                      {r.address}@clearsign.uk <span aria-hidden="true">↗</span>
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
          <div id="project-enquiry">
            <Suspense
              fallback={
                <div className="draft-panel">
                  <h2>Project enquiries</h2>
                  <p>Send your question straight to our team.</p>
                  <a className="action action-dark" href="mailto:sales@clearsign.uk">
                    Email the project team <span aria-hidden="true">↗</span>
                  </a>
                </div>
              }
            >
              <Enquiry />
            </Suspense>
          </div>
        </div>
      </section>
      <section className="compact-section">
        <div className="wrap split">
          <div className="section-lead">
            <Eyebrow>First conversation</Eyebrow>
            <h2>What happens next?</h2>
          </div>
          <div className="prose">
            <p>
              We’ll ask what happens on a typical day, who does the job and which tools you already
              use.
            </p>
            <p>You can review the outline with your team and choose whether to go ahead.</p>
            <Action href="/demo/" kind="text">
              Book a phone assistant demo
            </Action>
          </div>
        </div>
      </section>
    </>
  );
}
