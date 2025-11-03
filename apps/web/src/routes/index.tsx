import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

import { SimpleTokenDemo } from '../components/simple-token-demo';

export default component$(() => {
  return (
    <>
      <h1>Hi 👋</h1>
      <div>
        Welcome to n00plicate Design Token Pipeline Demo!
        <br />
        Below you can see our design tokens in action with Qwik City.
      </div>

      <SimpleTokenDemo />
    </>
  );
});

export const head: DocumentHead = {
  title: 'n00plicate Design Token Pipeline - Qwik Demo',
  meta: [
    {
      name: 'description',
      content: 'Demo of n00plicate design tokens integration with Qwik City and Vanilla Extract',
    },
  ],
};
