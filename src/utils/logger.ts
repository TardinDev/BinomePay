/**
 * Lightweight dev-guarded logger for BinomePay.
 *
 * Rationale: the project convention (see CLAUDE.md) is to keep diagnostic logs
 * out of production. ESLint's `no-console` rule only allows `console.warn` and
 * `console.error`, so informational logs route through `console.warn` but only
 * when `__DEV__` is true. `warn`/`error` are always forwarded (they're allowed
 * by lint and useful in production crash logs).
 */

type LogArgs = unknown[]

export const logger = {
  /** Verbose dev-only diagnostic log (no-op in production). */
  debug(...args: LogArgs): void {
    if (__DEV__) console.warn(...args)
  },
  /** Informational dev-only log (no-op in production). */
  info(...args: LogArgs): void {
    if (__DEV__) console.warn(...args)
  },
  /** Warning log — always emitted. */
  warn(...args: LogArgs): void {
    console.warn(...args)
  },
  /** Error log — always emitted. */
  error(...args: LogArgs): void {
    console.error(...args)
  },
}

export default logger
