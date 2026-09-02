# Take table behaviour from TanStack Table

## Context

`DataTable` takes a `rows` array and renders every element of it. There is no
pagination class, no page-size control, no "showing 1 to 25 of 300" pattern and
no component, anywhere in 197 base classes. An invoices table in a business with
three hundred invoices renders three hundred rows.

Row selection is half built. `--kairos-row-selected` exists and
`tr[aria-selected="true"]` reads it, so a selected row highlights correctly.
There is no checkbox column, no select-all header, no selection count and no
bulk action bar.

Column filtering and column visibility do not exist either. Every app that needs
one will write it, and each will write it differently, which is the drift this
repo was created to stop.

`sortRows`, `nextSort` and `compare` are ours and are good. The three-state
cycle is better than a two-state flip, and the blanks-sort-last fix corrects a
real defect that shipped in Paykit. Those are product decisions and they are
tested.

## Decision

The registry depends on TanStack Table for table state: pagination, row
selection, sorting, filtering and column visibility.

It is headless, so `kairos-table`, `kairos-table-wrap`, `kairos-table-panel`,
`kairos-sort-header`, `kairos-record-card` and every other class stay exactly as
they are. The library supplies the row model and the state; `DataTable` supplies
every element and every class, as it does now.

It also ships a vanilla `createTable` adapter beside the React one. That does
not matter today, since the two non-React surfaces have no such screen, and it
means the engine is not the thing that would block one later.

The comparator survives. `compare` and the blanks-last behaviour are registered
as TanStack's sorting function rather than deleted, and their tests are kept
unchanged. The three-state cycle stays, implemented against the library's sort
state. Losing either would reintroduce a defect this repo already fixed once.

`Column<Row>` becomes a wrapper over `ColumnDef`. `role`, `hideOnCard` and
`sortValue` are ours and stay, because they drive the mobile card, which the
library knows nothing about. `ColumnRole` keeps deciding what the card renders.

This breaks the `columns` API for three apps that import `DataTable`. It ships
as `0.4.0` with a migration note in `docs/adoption.md`, not as a patch. Paykit,
Mailkit and Uptime move on their own schedule, since each pins a version.

Pagination is client-side first, because every current Kairos table fits in
memory and a server-side contract that no app needs yet is a guess. The
`manualPagination` path is left reachable so the first app with a large table
turns it on rather than replacing the component.

Virtualisation is out of scope. `@tanstack/react-virtual` is reached for when a
list is measurably slow, and not before.
