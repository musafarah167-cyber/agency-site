'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { offers, sectors } from '../content/growth';
import { Arrow } from './shared';

const topics = ['Website enquiry', 'Phone enquiry', 'Repeated admin', 'AI on our own equipment'];
const industries: string[] = [
  ...sectors.map((s) => s.context),
  'Restaurants',
  'Professional firms',
  'Accountants & legal firms',
];
const choices = ['Not sure yet', 'A package of services', ...offers.map((o) => o.interest)];
const interestLabel = (value: string) =>
  value === 'AI agents' ? 'AI assistants & integration' : value;
const hints: Record<string, string> = {
  'Not sure yet': 'Tell us where you lose customers or where work gets held up.',
  'A package of services': 'What are you trying to achieve, and which parts need to work together?',
  Branding: 'Where will customers see your brand, and what needs to look more consistent?',
  Websites: 'What should a customer be able to find or do on your website?',
  'AI agents':
    'Which task should AI help with, which tools do you use and where should the information stay?',
  'Admin & follow-up': 'Which enquiries, quotes or reminders are difficult to keep track of?',
  'Custom software': 'What are you trying to manage in messages or spreadsheets?',
  'Marketing & print': 'Where would you like more people to see and recognise your business?',
};
const aliases: Record<string, string> = {
  'Website & enquiries': 'Websites',
  'Marketing & branding': 'Marketing & print',
};
type Row = readonly [string, string];
type Draft = { rows: Row[]; url: string };
const fields = ['name', 'business', 'email', 'message'] as const;
type Field = (typeof fields)[number];
type Errors = Partial<Record<Field, string>>;
function issue(field: Field, input: HTMLInputElement | HTMLTextAreaElement) {
  const required = {
    name: 'Enter your name.',
    business: '',
    email: 'Enter your email address.',
    message: 'Tell us what you would like to improve.',
  };
  if (!input.value.trim()) return required[field];
  if (input.validity.typeMismatch) return 'Enter an email address such as name@business.co.uk.';
  if (input.value.length > input.maxLength)
    return 'Use ' + input.maxLength + ' characters or fewer.';
  return '';
}

function DraftForm({ initial, context }: { initial: string; context: string }) {
  const [interest, setInterest] = useState(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const heading = useRef<HTMLHeadingElement>(null),
    nameField = useRef<HTMLInputElement>(null);
  const workflow = topics.includes(context);
  const contextChoices = workflow ? topics : industries;
  function attributes(field: Field) {
    return {
      'aria-invalid': errors[field] ? true : undefined,
      'aria-describedby':
        [field === 'message' ? 'message-hint' : '', errors[field] ? 'error-' + field : '']
          .filter(Boolean)
          .join(' ') || undefined,
    };
  }
  function errorMessage(field: Field) {
    return (
      errors[field] && (
        <span id={'error-' + field} className="field-error">
          {errors[field]}
        </span>
      )
    );
  }
  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const problems: Errors = {};
    for (const field of fields) {
      const input = form.elements.namedItem(field) as HTMLInputElement | HTMLTextAreaElement;
      const message = issue(field, input);
      if (message) problems[field] = message;
    }
    setErrors(problems);
    const first = fields.find((field) => problems[field]);
    if (first) {
      const input = form.elements.namedItem(first) as HTMLElement;
      requestAnimationFrame(() => input.focus());
      return;
    }
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) || '').trim();
    const rows: Row[] = [
      ['Name', value('name')],
      ...(value('business') ? [['Business', value('business')] as const] : []),
      ['Reply to', value('email')],
      ['Service', interestLabel(interest)],
    ];
    if (value('context'))
      rows.push([workflow ? 'Enquiry topic' : 'Business type', value('context')]);
    rows.push(['What I’d like to improve', value('message')]);
    const subject =
      'ClearSign project enquiry' +
      (interest === choices[0] ? '' : ' – ' + interestLabel(interest));
    const body = rows.map(([key, val]) => key + ' — ' + val).join('\r\n\r\n');
    setDraft({
      rows,
      url:
        'mailto:sales@clearsign.uk?subject=' +
        encodeURIComponent(subject) +
        '&body=' +
        encodeURIComponent(body),
    });
    requestAnimationFrame(() => heading.current?.focus());
  }
  function edit() {
    setDraft(null);
    requestAnimationFrame(() => nameField.current?.focus());
  }
  return (
    <div className="draft-panel">
      <form
        id="enquiry-form"
        hidden={!!draft}
        onSubmit={prepare}
        noValidate
        onInput={(event) => {
          const el = event.target;
          if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return;
          const field = el.name as Field;
          if (errors[field]) setErrors((current) => ({ ...current, [field]: issue(field, el) }));
        }}
      >
        <h2>Prepare an enquiry</h2>
        <p>You’ll review your details here, then send the message from your email app.</p>
        <div className="form-pair">
          <label>
            Your name
            <input
              {...attributes('name')}
              name="name"
              autoComplete="name"
              maxLength={100}
              required
              ref={nameField}
            />
            {errorMessage('name')}
          </label>
          <label>
            Business name <small>(optional)</small>
            <input
              {...attributes('business')}
              name="business"
              autoComplete="organization"
              maxLength={150}
            />
            {errorMessage('business')}
          </label>
        </div>
        <label>
          Your email
          <input
            {...attributes('email')}
            name="email"
            autoComplete="email"
            type="email"
            maxLength={200}
            required
          />
          {errorMessage('email')}
        </label>
        <label>
          What are you interested in?
          <select name="interest" value={interest} onChange={(e) => setInterest(e.target.value)}>
            {choices.map((x) => (
              <option key={x} value={x}>
                {interestLabel(x)}
              </option>
            ))}
          </select>
        </label>
        {context && (
          <label>
            {workflow ? 'Enquiry topic' : 'Business type'} <small>(optional)</small>
            <select name="context" defaultValue={context}>
              <option value="">Not specified</option>
              {contextChoices.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        )}
        <label>
          What would you like to improve?
          <span id="message-hint" className="field-hint">
            {hints[interest]}
          </span>
          <textarea {...attributes('message')} name="message" rows={4} required maxLength={2000} />
          {errorMessage('message')}
        </label>
        <button type="submit" className="action action-dark">
          Prepare my email
          <Arrow />
        </button>
      </form>
      {draft && (
        <section id="enquiry-result">
          <h2 id="enquiry-result-heading" ref={heading} tabIndex={-1}>
            Your project email
          </h2>
          <p>Check the details, then open your email app to send them to sales@clearsign.uk.</p>
          <dl className="draft-rows">
            {draft.rows.map(([key, val]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{val}</dd>
              </div>
            ))}
          </dl>
          <div className="actions">
            <a id="send-enquiry-email" href={draft.url} className="action action-amber">
              Open email app
              <Arrow />
            </a>
            <button type="button" onClick={edit} className="quiet-link">
              Edit your details
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
export default function Enquiry() {
  const query = useSearchParams();
  const context = query.get('scenario') || '';
  const requested = query.get('interest') || '';
  const resolved =
    requested === 'AI & automation'
      ? context === 'Phone enquiry'
        ? 'AI agents'
        : 'Admin & follow-up'
      : aliases[requested] || requested;
  return (
    <DraftForm
      key={query.toString()}
      initial={choices.includes(resolved) ? resolved : choices[0]}
      context={[...topics, ...industries].includes(context) ? context : ''}
    />
  );
}
