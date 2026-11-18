export const offers = [
  {
    slug: 'branding',
    name: 'Branding & visual identity',
    interest: 'Branding',
    line: 'A logo, colours and files your team can use on screen and in print.',
  },
  {
    slug: 'marketing',
    name: 'Marketing, video & print',
    interest: 'Marketing & print',
    line: 'Show your work with video, branded clothing, vehicle graphics or tap-to-share cards.',
  },
  {
    slug: 'websites',
    name: 'Websites & booking',
    interest: 'Websites',
    line: 'Help customers see your work, ask for a quote or book on their phone.',
  },
  {
    slug: 'ai',
    name: 'AI assistants',
    interest: 'AI agents',
    line: 'Help with calls, emails or documents, using your current software or your own equipment.',
  },
  {
    slug: 'automation',
    name: 'Customer records & follow-up',
    interest: 'Admin & follow-up',
    line: 'Put enquiries and quotes in one list so everyone knows who owes a reply.',
  },
  {
    slug: 'software',
    name: 'Custom business software',
    interest: 'Custom software',
    line: 'Give staff one place to manage jobs, vehicles or customer updates.',
  },
] as const;

export const sectors = [
  {
    id: 'logistics',
    name: 'Transport & logistics',
    context: 'Transport & logistics',
    issue:
      'A customer asks for a delivery update. The office checks a spreadsheet and rings the depot because the job record is out of date.',
    change:
      'Connect the dispatch record to a shared status view. Staff can see the last confirmed update and who handles an exception.',
    measure: 'Calls chasing updates, missing job details and time to answer customers.',
    service: 'software',
  },
  {
    id: 'accountancy',
    name: 'Accountancy practices',
    context: 'Accountancy practices',
    issue:
      'A prospective client rings about switching accountants while the team is with clients. A voicemail gives the partner little to prepare for.',
    change:
      'We brief an assistant on the services you take on. It can ask about bookkeeping or payroll, check the best callback time and send a short note to the new-client team.',
    measure: 'Callbacks completed, first meetings booked and enquiries that become clients.',
    service: 'ai',
  },
  {
    id: 'legal',
    name: 'Law firms',
    context: 'Law firms',
    issue:
      'A caller asks about buying and selling a home. Reception needs to find the right solicitor while handling the next call.',
    change:
      'We set up intake questions the firm approves and route a short callback note to conveyancing. Your solicitor handles advice, checks, fees and decisions about taking on the client.',
    measure:
      'Enquiries routed correctly, solicitor time spent on intake and initial appointments arranged.',
    service: 'ai',
  },
  {
    id: 'car-hire',
    name: 'Car hire',
    context: 'Car hire',
    issue:
      'A customer rings for a vehicle while staff are out on a handover. Waiting for a call back gives another firm time to quote.',
    change:
      'Collect the dates and vehicle request, assign the enquiry to a person and prompt them to follow up. Your team confirms price and availability.',
    measure: 'Time to quote and enquiries that become hires.',
    service: 'automation',
  },
  {
    id: 'salons',
    name: 'Salons & barbers',
    context: 'Salons & barbers',
    issue:
      'Someone sees your work online but cannot find the price, location or booking link on their phone.',
    change:
      'Bring services, photos and your existing booking link together. Give staff a way to pick up questions that need a personal reply.',
    measure: 'Completed bookings and time spent answering routine questions.',
    service: 'websites',
  },
  {
    id: 'restaurants',
    name: 'Restaurants & takeaways',
    context: 'Restaurants & takeaways',
    issue:
      'The phone rings during the rush. Staff have to choose between the counter and the caller.',
    change:
      'Trial a phone assistant for agreed questions and callback details. Route allergies, changes and order confirmations to staff.',
    measure: 'Calls picked up, accuracy and handovers completed.',
    service: 'ai',
  },
  {
    id: 'trades',
    name: 'Trades & garages',
    context: 'Trades & garages',
    issue:
      'A quote request arrives while everyone is on a job. Details get split between a phone, messages and a notebook.',
    change:
      'Collect job details in one place, put a name against each quote and flag the ones that need another call.',
    measure: 'Quotes followed up, jobs won and time spent chasing details.',
    service: 'automation',
  },
];

export const contactRoles = [
  { title: 'New projects', address: 'sales' },
  { title: 'General questions', address: 'info' },
  { title: 'Existing clients', address: 'support' },
  { title: 'Invoices & payments', address: 'accounts' },
];

export function contactLink(interest?: string, scenario?: string) {
  const params = new URLSearchParams();
  if (interest) params.set('interest', interest);
  if (scenario) params.set('scenario', scenario);
  return '/contact/' + (params.size ? '?' + params.toString() : '');
}

export function serviceLink(slug: string) {
  return '/service-' + slug + '/';
}

const demoProfiles = {
  accountancy: {
    action: 'Book a demo for my practice',
    firm: 'an accountancy practice',
    topic: 'how to capture a bookkeeping or payroll enquiry and arrange a callback',
  },
  legal: {
    action: 'Book a demo for my law firm',
    firm: 'a law firm',
    topic: 'how to route a new enquiry to the right solicitor for a callback',
  },
} as const;

export function demoProfileFor(sector: string | null) {
  if (sector === 'accountancy' || sector === 'legal') return demoProfiles[sector];
  return undefined;
}
