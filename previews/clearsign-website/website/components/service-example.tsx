export default function ServiceExample({ slug }: { slug: string }) {
  if (slug === 'branding')
    return (
      <figure className="sample">
        <div className="identity-specimen">
          <img
            src="/assets/brand/symbol-dark.svg"
            alt="ClearSign’s C symbol"
            width="84"
            height="84"
          />
          <img
            src="/assets/brand/wordmark-light.svg"
            alt="ClearSign wordmark"
            width="240"
            height="51"
          />
        </div>
        <figcaption>
          Our symbol fits a profile picture. The full name has room on a website or shop sign.
        </figcaption>
      </figure>
    );
  if (slug === 'websites')
    return (
      <figure className="sample sample-web">
        <div className="devices">
          <picture className="screen-wide">
            <source srcSet="/assets/images/website-desktop.webp" />
            <img
              src="/assets/images/homepage-preview.png"
              alt="ClearSign’s homepage at desktop width"
              width="1000"
              height="639"
              loading="lazy"
            />
          </picture>
          <picture className="screen-small">
            <source srcSet="/assets/images/website-phone.webp" />
            <img
              src="/assets/images/website-specimen-mobile.png"
              alt="The same homepage at phone width"
              width="390"
              height="844"
              loading="lazy"
            />
          </picture>
        </div>
        <figcaption>Our own website on desktop and phone.</figcaption>
      </figure>
    );
  if (slug === 'ai')
    return (
      <figure className="sample">
        <div className="sample-note">
          <p>
            <small>Caller</small>“We’re buying a house. We need help selling ours as well.”
          </p>
          <p>
            <small>Phone assistant</small>“Shall I ask the conveyancing team to call you about both
            the purchase and the sale?”
          </p>
        </div>
        <figcaption>Example of an assistant following a change in a caller’s request.</figcaption>
      </figure>
    );
  if (slug === 'automation')
    return (
      <figure className="sample">
        <dl className="sample-record">
          <div>
            <dt>New enquiry</dt>
            <dd>Bookkeeping and payroll</dd>
          </div>
          <div>
            <dt>Assigned to</dt>
            <dd>New-client team</dd>
          </div>
          <div>
            <dt>Next action</dt>
            <dd>Call on Thursday morning</dd>
          </div>
        </dl>
        <figcaption>Example entry in a shared enquiry list.</figcaption>
      </figure>
    );
  if (slug === 'software')
    return (
      <figure className="sample">
        <dl className="sample-record">
          <div>
            <dt>Workshop job</dt>
            <dd>Vehicle service</dd>
          </div>
          <div>
            <dt>Stage</dt>
            <dd>Inspection complete</dd>
          </div>
          <div>
            <dt>Next action</dt>
            <dd>Call the customer with the estimate</dd>
          </div>
        </dl>
        <figcaption>Example job sheet for a garage team.</figcaption>
      </figure>
    );
  return (
    <figure className="sample sample-print">
      <div className="tap-card">
        <img src="/assets/brand/wordmark-dark.svg" width="155" height="33" alt="ClearSign" />
        <span>
          Tap to open
          <br />
          our website.
        </span>
      </div>
      <figcaption>ClearSign’s own tap-to-share card design.</figcaption>
    </figure>
  );
}
