# ADR-004: Dual Browser and ESC/POS Printing Strategy

## Status
Accepted

## Context
Thermal printing is the primary output. It needs to work across standard desktop browsers and thermal USB/network receipt printers.

## Decision
Implement HTML template printing via browser `@media print` as a baseline fallback, and binary ESC/POS buffer dispatching for network/TCP thermal printers.

## Alternatives Considered
- Exclusively ESC/POS (ruled out as browser print fallback is needed if printer drivers fail).

## Consequences
- Versatility in hardware support.
- Requires maintenance of both HTML print pages and raw character buffer generators.
