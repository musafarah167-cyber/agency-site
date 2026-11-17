const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

export const storyMarkup = `
<section class="business-story" id="business-story" aria-labelledby="story-heading">
  <div class="container">
    <div class="story-heading">
      <h2 id="story-heading">A weekend hire, from enquiry to reply.</h2>
      <p>A customer wants a car from Friday to Sunday. See how a website, a shared record and a reminder could help the hire team handle the request.</p>
    </div>
    <div class="story-layout">
      <ol class="story-steps">
        <li class="story-step" data-story-step="0">
          <span class="story-step-label">Capture</span>
          <h3>An enquiry arrives.</h3>
          <p>A customer asks about hiring a car. Your website collects the vehicle, dates and contact details, so your team has something useful to work with.</p>
          <div class="story-mobile-example"><span>Example enquiry</span><strong>Executive saloon · Friday–Sunday</strong><p>“Is this available, and what would it cost?”</p></div>
        </li>
        <li class="story-step" data-story-step="1">
          <span class="story-step-label">Organise</span>
          <h3>The details stay together.</h3>
          <p>The enquiry goes into one customer record. The hire team can see what was requested, who is handling it and what needs checking.</p>
          <div class="story-mobile-example"><span>Example customer record</span><strong>Assigned to the hire team</strong><p>Next step: check availability and prepare a quote.</p></div>
        </li>
        <li class="story-step" data-story-step="2">
          <span class="story-step-label">Follow up</span>
          <h3>Your team knows who needs a reply.</h3>
          <p>Once a quote is sent, a reminder keeps the enquiry on the team’s radar. Someone can follow up while the customer is still deciding.</p>
          <div class="story-mobile-example"><span>Example reminder</span><strong>Follow up on the quote</strong><p>Check whether the customer needs anything else to decide.</p></div>
        </li>
      </ol>
      <div class="story-preview-wrap">
        <div class="story-preview">
          <div class="story-preview-heading"><span class="story-example-dot" aria-hidden="true"></span><span>Car hire enquiry · Example</span></div>
          <div class="story-controls" role="group" aria-label="Explore the enquiry journey" hidden>
            <button type="button" data-story-select="0" aria-pressed="true" aria-controls="story-panel-0">Capture</button>
            <button type="button" data-story-select="1" aria-pressed="false" aria-controls="story-panel-1">Organise</button>
            <button type="button" data-story-select="2" aria-pressed="false" aria-controls="story-panel-2">Follow up</button>
          </div>
          <div class="story-progress" aria-hidden="true"><span></span></div>
          <div class="story-panels">
            <div class="story-panel" id="story-panel-0" data-story-panel="0" hidden>
              <div class="story-record-top"><span>Website enquiry</span><span class="story-state">Received</span></div>
              <h3>Weekend hire request</h3>
              <dl class="story-record-details"><div><dt>Vehicle</dt><dd>Executive saloon</dd></div><div><dt>Dates</dt><dd>Friday–Sunday</dd></div><div><dt>Request</dt><dd>Availability and a quote</dd></div></dl>
              <blockquote>“Is this available, and what would it cost?”</blockquote>
            </div>
            <div class="story-panel" id="story-panel-1" data-story-panel="1" hidden>
              <div class="story-record-top"><span>Customer record</span><span class="story-state">Assigned</span></div>
              <h3>Assigned to the hire team</h3>
              <dl class="story-record-details"><div><dt>Enquiry</dt><dd>Executive saloon · Friday–Sunday</dd></div><div><dt>Assigned to</dt><dd>Hire team</dd></div><div><dt>Next action</dt><dd>Check availability</dd></div></dl>
              <div class="story-task"><span class="story-task-mark" aria-hidden="true"></span><div><strong>Prepare a quote</strong><p>The team checks the details before replying.</p></div></div>
            </div>
            <div class="story-panel" id="story-panel-2" data-story-panel="2" hidden>
              <div class="story-record-top"><span>Team reminder</span><span class="story-state">To follow up</span></div>
              <h3>Quote ready for follow-up</h3>
              <dl class="story-record-details"><div><dt>Enquiry</dt><dd>Executive saloon · Friday–Sunday</dd></div><div><dt>Stage</dt><dd>Quote sent</dd></div><div><dt>Next action</dt><dd>Follow up with the customer</dd></div></dl>
              <div class="story-task"><span class="story-task-mark" aria-hidden="true"></span><div><strong>Any questions about the quote?</strong><p>A useful prompt for a personal reply.</p></div></div>
            </div>
            <div class="story-summary">
              <h3>One enquiry. A clear path forward.</h3>
              <dl class="story-record-details"><div><dt>Request</dt><dd>Executive saloon · Friday–Sunday</dd></div><div><dt>Owner</dt><dd>Hire team</dd></div><div><dt>First action</dt><dd>Check availability and prepare a quote</dd></div><div><dt>Then</dt><dd>A reminder to follow up after the quote</dd></div></dl>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="story-close"><a class="text-link" href="industries.html#car-hire">More ideas for car hire ${arrow}</a><a class="text-link section-contact" href="contact.html">Discuss a similar setup ${arrow}</a></div>
  </div>
</section>`;
