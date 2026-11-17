// Each service opens with an example of the work the visitor is considering.
export const serviceVisuals = {
  websites: `<figure class="service-sample sv-web">
    <div class="device-pair">
      <div class="desktop-device">
        <div class="device-bar" aria-hidden="true"><i></i><i></i><i></i></div>
        <img src="assets/images/homepage-preview.png" width="1440" height="1000" alt="ClearSign’s homepage on a desktop screen">
      </div>
      <div class="phone-device"><img src="assets/images/website-specimen-mobile.png" width="390" height="844" alt="The same homepage on a phone"></div>
    </div>
    <figcaption class="sv-web-copy"><span class="sv-caption">ClearSign’s own website, on desktop and phone.</span></figcaption>
  </figure>`,
  ai: `<figure class="service-sample">
    <div class="conversation-sample">
      <div class="sample-message"><strong>Customer</strong><p>Could someone call me about a booking?</p></div>
      <div class="sample-message agent-message"><strong>AI agent</strong><p>Of course. What’s the best number for the team to call?</p></div>
      <p class="callback-task">Team task <strong>Return the booking enquiry</strong></p>
    </div>
    <figcaption>Example conversation. A person handles the booking.</figcaption>
  </figure>`,
  automation: `<figure class="service-sample">
    <ol class="enquiry-route">
      <li><strong>Enquiry received</strong><span>The customer asks for a quote on your website.</span></li>
      <li><strong>Details saved</strong><span>The request goes into one customer record.</span></li>
      <li><strong>Follow-up assigned</strong><span>A named member of staff gets the next action.</span></li>
    </ol>
    <figcaption>Example workflow from a form to a follow-up.</figcaption>
  </figure>`,
  software: `<figure class="service-sample">
    <div class="job-record">
      <p class="job-record-heading">Workshop job sheet</p>
      <h2>Vehicle service</h2>
      <dl><div><dt>Owner</dt><dd>Workshop team</dd></div>
        <div><dt>Stage</dt><dd>Inspection complete</dd></div>
        <div><dt>Next action</dt><dd>Call the customer with the estimate</dd></div></dl>
    </div>
    <figcaption>Illustrative job record for a garage team.</figcaption>
  </figure>`,
  marketing: `<figure class="service-sample print-sample">
    <div class="print-pair">
      <div class="print-card print-back">
        <img src="assets/brand/symbol-dark.svg" width="64" height="64" alt="ClearSign symbol">
      </div>
      <div class="print-card print-front">
        <img src="assets/brand/wordmark-dark.svg" width="244" height="52" alt="ClearSign">
        <span>Tap to open<br>our website.</span>
      </div>
    </div>
    <figcaption>Front and back of the ClearSign tap-to-open card design.</figcaption>
  </figure>`
};
