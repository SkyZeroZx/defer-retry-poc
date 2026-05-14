import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FlakyCmp } from './flaky';
 
/**
 * Demo of `@defer` paired with `@error (retry N)` and the new
 * `provideDeferBlockRetryHandler` API.
 *
 * The retry handler is registered in `app.config.ts` and synthetically rejects
 * the first two attempts so the retry path is exercised visibly without
 * needing a real network failure. On attempt #2 the handler delegates to the
 * compiler-emitted thunk, the chunk loads, and `FlakyCmp` renders.
 */
@Component({
  selector: 'app-defer-retry',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FlakyCmp],
  template: `
    <h2>&#64;defer + (retry N) demo</h2>
    <p>Open the devtools console, then press <strong>Trigger</strong>.</p>
    <p>Disable network connectivity to see the retry mechanism in action with real failures.</p>
    <button type="button" (click)="show.set(true)">Trigger</button>

    @if (show()) {
      @defer (on immediate) {
        <app-flaky />
      } @loading (minimum 200ms) {
        <p>Loading… (the handler will fail) </p>
      } @error (retry 3) {
        <p style="color: #c62828;">All retries exhausted — load failed.</p>
      }
      (retry 3)
    }
  `,
})
export default class DeferRetryCmp {
  protected readonly show = signal(false);
}
