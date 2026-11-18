import { Action, PageIntro } from '../components/shared';
export default function NotFound() {
  return (
    <PageIntro
      label="Page not found"
      title="Let’s get you back on track."
      text="This address doesn’t lead to a page. You can find all of our services on the solutions page."
    >
      <Action href="/solutions/">See our solutions</Action>
    </PageIntro>
  );
}
