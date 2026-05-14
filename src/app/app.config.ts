import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideDeferBlockRetryHandler,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideDeferBlockRetryHandler(async (load, ctx) => {
      if (ctx.attempt === 0) {
        return load();
      }
      // Delay added just to make the retry attempts visible
      await new Promise((resolve) => setTimeout(resolve, 2_000));
      // `ctx.retry()` re-issues the chunk download with cache-busting applied,
      // so you don't have to parse import URLs yourself.
      return ctx.retry();
    }),
  ],
};
