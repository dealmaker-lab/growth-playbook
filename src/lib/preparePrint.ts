/**
 * Prepare the DOM for printing / saving-to-PDF.
 *
 * The playbook uses lazy scroll-reveal (opacity:0 until IntersectionObserver
 * fires) and animated counters that start at 0. If a user clicks "Download PDF"
 * from the hero without scrolling, most of the content would print blank or
 * show "$0B"-style zeros. This helper snaps everything to its final state so
 * the PDF renders as the full article.
 *
 * Called synchronously before window.print(). Idempotent — safe to run twice.
 */
export function prepareForPrint() {
  if (typeof document === 'undefined') return;

  // 1. Snap all scroll-reveal elements to visible.
  const reveals = document.querySelectorAll(
    '.rv:not(.vis), .rv-l:not(.vis), .rv-r:not(.vis), ' +
      '.ch-enter-right:not(.vis), .ch-enter-scale:not(.vis), ' +
      '.ch-enter-left:not(.vis), .ch-enter-bottom:not(.vis)'
  );
  reveals.forEach((el) => el.classList.add('vis'));

  // 2. Jump animated counters to their final value. Preserves prefix / suffix /
  //    decimal conventions used by useAnimatedCounters.
  const counters = document.querySelectorAll<HTMLElement>('[data-count]');
  counters.forEach((el) => {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target)) return;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimal = el.dataset.decimal ? Number(el.dataset.decimal) : 0;
    const display =
      decimal > 0 ? (target / Math.pow(10, decimal)).toFixed(1) : String(Math.round(target));
    el.textContent = prefix + display + suffix;
    // Mark as counted so useAnimatedCounters won't overwrite on next intersection.
    (el as HTMLElement & { _counted?: boolean })._counted = true;
  });

  // 3. Open every <details>/<summary> disclosure (FAQs) — their answers are
  //    hidden by default and would print as questions-only otherwise.
  document.querySelectorAll<HTMLDetailsElement>('details').forEach((d) => {
    if (!d.open) {
      d.dataset.wasClosed = '1';
      d.open = true;
    }
  });

  // 4. Mark body so print-only CSS selectors can do their thing even if
  //    media="print" evaluation is slightly delayed.
  document.body.classList.add('printing');
}

/** Clean up class added by prepareForPrint. Restore <details> state. */
export function afterPrint() {
  if (typeof document === 'undefined') return;
  document.body.classList.remove('printing');
  document
    .querySelectorAll<HTMLDetailsElement>('details[data-was-closed="1"]')
    .forEach((d) => {
      d.open = false;
      delete d.dataset.wasClosed;
    });
}

/**
 * Triggers the native print dialog after forcing the page into its final,
 * printable state. Handles the browser's `afterprint` event so we can clean
 * up our temporary class.
 */
export function triggerPrint() {
  prepareForPrint();
  const cleanup = () => {
    afterPrint();
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  // Give the browser a tick to apply the .vis classes + text updates before
  // it snapshots the page for the print dialog.
  setTimeout(() => window.print(), 80);
}
