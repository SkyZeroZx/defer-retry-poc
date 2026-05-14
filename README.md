> [!IMPORTANT]
> This is a proof of concept for a potential Angular feature.


#### Automatically retry failed loads with `@error (retry N)`

Network blips, an evicted CDN edge, or a transient 5xx can leave your users staring at an `@error` block when the underlying problem already resolved itself. To recover from these transient failures, pass a `retry` parameter to `@error`:

```html
@defer {
  <large-component />
} @error (retry 3) {
  <p>We couldn't load this section. Please refresh.</p>
}
```

`N` must be a non-negative integer literal. Angular makes up to `N` additional load attempts before surfacing the `@error` block, for a total of up to `N + 1` attempts. Retries are sequential; each one waits for the previous attempt to fail before starting.

Cache-busting works out of the box. The HTML specification mandates that browsers permanently cache failed dynamic `import()` requests against their original URL, so a naive retry would always reproduce the original failure. Angular sidesteps this by appending a `?ngRetry=N` query parameter to the chunk URL on each retry — no configuration required.

`@error (retry N)` composes with every other `@defer` feature, including `@loading`, all `on` and `when` triggers, prefetching, and incremental hydration. During hydration, the retry sequence is transparent: only the final outcome (success or exhaustion) is observed by the hydration runtime.

#### What renders during a retry?

While retries are in flight, the block stays in its loading state — the `@loading` block (if you have one) keeps showing for the entire retry sequence. The `@error` block only renders after the **final** attempt fails.

For example, with `@error (retry 3)` and a network that fails twice before succeeding on the third attempt:

| Phase                | Block shown   |
| -------------------- | ------------- |
| Initial attempt      | `@loading`    |
| Retry 1 (after fail) | `@loading`    |
| Retry 2 (after fail) | `@loading`    |
| Retry 3 succeeds     | Main `@defer` |

If all four attempts had failed, the user would see `@loading` throughout, then `@error` once retries were exhausted. This means a `@loading` block with a `minimum` duration applies to the loading state as a whole, not to each individual attempt.

##### Customizing retry behavior

You can customize how Angular retries a failed `@defer` chunk download by providing your own `DeferBlockRetryHandler` and registering it with `provideDeferBlockRetryHandler` in your application's providers. This is useful for telemetry, exponential backoff, CDN failover.

```ts
import {provideDeferBlockRetryHandler} from '@angular/core';

bootstrapApplication(App, {
  providers: [
    provideDeferBlockRetryHandler(async (load, ctx) => {
      if (ctx.attempt === 0) {
        return load();
      }
      // Exponential backoff before each retry.
      await new Promise((resolve) => setTimeout(resolve, 2 ** ctx.attempt * 100));
      // `ctx.retry()` re-issues the chunk download with cache-busting applied,
      // so you don't have to parse import URLs yourself.
      return ctx.retry();
    }),
  ],
});
```

The handler receives the compiler-generated `load` thunk and a `context` carrying `attempt` (zero-based) and `retry()` (cache-busted reload). When you provide your own handler, always use `ctx.retry()` on attempts after the first — calling `load()` again would hit the browser's failed-import cache and reproduce the original failure.
