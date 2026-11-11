# Holds

One package is below its registry `latest`: TypeScript, by plan. Every other direct development dependency reached its target in `design.md` › Versions (`checks/versions.txt`). The hold rule for failing checks (Vite 7.3.8, Vitest 4.1.12, TypeScript 5.9.3, previous React types / Radix / TanStack lines) was **not** used: `npm test`, `npm run typecheck`, `npm run build-storybook` and `npm run test-stories` all pass on the targets (`checks/ci-commands.md`).

## typescript: kept 6.0.3 (registry `latest` 7.0.2): planned hold (design.md › Holds)

- **Version kept:** `typescript@6.0.3` (`package.json` `^6.0.3`; `npm ls typescript --depth=0` → `typescript@6.0.3`). 6.0.3 is the newest 6.x (`npm view typescript@6 version`).
- **Why (not a failing check; the plan holds it):**
  1. The package ships `.ts`/`.tsx` source that consumers compile with their own TypeScript. Their compiler line is 6.0.3, so `npm run typecheck` on 6.0.3 is the proof that matters for them.
  2. TypeScript 7.0.2 exports no compiler API at `"."`. Read again on 11 Nov 2026 with `npm view typescript@7.0.2 exports`: `".": "./lib/version.cjs"`, with the API under `./unstable/*`. The newest docgen plugin excludes 7.0 by name. `npm view @joshwooding/vite-plugin-react-docgen-typescript@0.9.1 peerDependencies` → `"typescript": ">=4.3.0 <7 || >=7.1.0-0 <8"`.
- **Command and output on the target:** not run. `design.md` › Holds says whether `tsc` 7.0.2 passes is "Not checked … (not needed for the decision)". So no failing 7.0.2 output exists to quote.
- **Advisory fix the kept version carries:** none needed. No advisory on the 11 Nov 2026 list names `typescript`, and `npm audit` reports 0 on 6.0.3 (`checks/audit-after.md`).
- **Revisit:** when the consumers move to TypeScript 7 (design.md).
