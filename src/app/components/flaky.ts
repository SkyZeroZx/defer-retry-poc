import { Component } from '@angular/core';

@Component({
  selector: 'app-flaky',
  template: `
    <div style="padding: 12px; border: 1px solid #2e7d32; border-radius: 6px; background: #e8f5e9;">
      <strong>FlakyCmp loaded successfully!</strong>
      <p style="margin: 8px 0 0;">
        This component was lazy-loaded via <code>&#64;defer</code>. The custom
        <code>DeferBlockRetryHandler</code> registered in <code>app.config.ts</code> made the first
        two attempts fail before letting the real chunk load on attempt #2.
      </p>
    </div>
  `,
})
export class FlakyCmp {
 
}
