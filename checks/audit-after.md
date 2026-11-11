# npm audit after the change (task 4.2)

Final lockfile, after `npm ci` (task 4.1).

## `npm audit --json`: exit 0, `metadata.vulnerabilities`

| Severity | Count |
| --- | --- |
| critical | 0 |
| high | 0 |
| moderate | 0 |
| low | 0 |
| info | 0 |
| total | 0 |

`vulnerabilities` object: {} (no package listed).

**Remaining advisories: none.** `@joshwooding/vite-plugin-react-docgen-typescript` is no longer listed (it was moderate, via glob, before; see `checks/audit-before.txt`), so the planner decision in task 4.2 is not needed.

## `node checks/scripts/advisory-scan.mjs`: exit 0

```
advisory-scan: package-lock.json
  storybook (vulnerable >=10.0.0 <10.6.2): node_modules/storybook@10.6.7
  @storybook/addon-vitest (vulnerable >=10.0.0 <10.6.2): node_modules/@storybook/addon-vitest@10.6.7
  vite (vulnerable >=7.0.0 <=7.3.6): node_modules/vite@8.3.8
  brace-expansion (vulnerable >=4.0.0 <5.0.12): node_modules/brace-expansion@5.0.13
  source-map-js (vulnerable >=1.0.0 <1.2.2): node_modules/source-map-js@1.2.2
  @vitest/mocker (vulnerable >=2.1.0-beta.7 <4.1.12): node_modules/@vitest/mocker@5.1.0
  glob (vulnerable >=9.0.0 <=14.0.1): node_modules/glob@14.0.4
  minimatch (vulnerable >=7.0.0 <11.0.1): node_modules/minimatch@11.0.8

OK: no lockfile entry in a vulnerable range
```
