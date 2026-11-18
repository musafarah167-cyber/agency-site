'use client';

// Adapted from shadcn/ui's Radix accordion. Licence and upstream revision are in the website README.
import * as Radix from '@radix-ui/react-accordion';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

type Panel = { id: string; title: string; content: ReactNode };
type Props = { className: string; panels: Panel[]; defaultOpen?: string };

export default function Accordion({ className, panels, defaultOpen = '' }: Props) {
  const group = useId();
  const nativeList = useRef<HTMLDivElement>(null);
  const enhancedList = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef('');
  const [interactive, setInteractive] = useState(false);
  const [selected, setSelected] = useState(defaultOpen);
  useEffect(() => {
    // Honour a disclosure that someone opened before the interactive code arrived.
    const expanded = nativeList.current?.querySelector<HTMLDetailsElement>('details[open]');
    const focused = document.activeElement;
    if (focused?.tagName === 'SUMMARY' && nativeList.current?.contains(focused)) {
      restoreFocus.current = focused.closest('details')?.id || '';
    }
    setSelected(expanded?.id || '');
    setInteractive(true);
  }, []);
  useEffect(() => {
    if (!interactive || !restoreFocus.current) return;
    enhancedList.current
      ?.querySelector<HTMLButtonElement>('#' + CSS.escape(restoreFocus.current) + ' button')
      ?.focus({ preventScroll: true });
    restoreFocus.current = '';
  }, [interactive]);

  if (!interactive)
    return (
      <div className={className} ref={nativeList}>
        {panels.map((p) => (
          <details
            key={p.id}
            name={group}
            id={p.id}
            open={p.id === defaultOpen}
            data-slot="accordion-item"
          >
            <summary data-slot="accordion-trigger">
              {p.title}
              <span className="toggle" aria-hidden="true" />
            </summary>
            {p.content}
          </details>
        ))}
      </div>
    );

  return (
    <Radix.Root
      ref={enhancedList}
      type="single"
      collapsible
      value={selected}
      onValueChange={setSelected}
      className={className}
      data-slot="accordion"
    >
      {panels.map((p) => (
        <Radix.Item key={p.id} value={p.id} id={p.id} data-slot="accordion-item">
          <Radix.Header asChild>
            <h3 className="disclosure-heading">
              <Radix.Trigger data-slot="accordion-trigger">
                {p.title}
                <span className="toggle" aria-hidden="true" />
              </Radix.Trigger>
            </h3>
          </Radix.Header>
          <Radix.Content data-slot="accordion-content">{p.content}</Radix.Content>
        </Radix.Item>
      ))}
    </Radix.Root>
  );
}
