## ADDED Requirements

### Requirement: An idle loadable button runs no animation
A button that can show a busy state SHALL keep its spinner still while it is not busy. `kairos.css` SHALL set `animation: none` on the `.kairos-spin` inside `.kairos-button-pending` of any `.kairos-button` that does not carry `aria-busy="true"`, so the hidden ring of an idle button costs no animation frames. A busy button keeps its turning ring.

#### Scenario: Rule
- **WHEN** the `kairos.css` rules are read
- **THEN** a rule with the selector `.kairos-button:not([aria-busy='true']) .kairos-button-pending .kairos-spin` sets `animation: none`, and `.kairos-spin` still sets `animation: kairos-spin 0.8s linear infinite`
- **CHECK** `tests/contract.test.mjs` › "a loadable button's spinner turns only while busy"

#### Scenario: Idle and busy in the workshop
- **WHEN** the Brand "Buttons" story renders a primary button with `loading` false beside one with `loading` true
- **THEN** the idle button's `.kairos-spin` reports `animation-name: none`, and the busy button's reports `kairos-spin`
- **CHECK** `npm run test-stories`: `stories/brand/Actions.stories.tsx` › "Buttons" passes
