# Task 1.2 check

- INTENTIONAL emptied, untouched dist (0.14 against itself): `node --test tests/product-scale.test.mjs` → 3 pass, 0 fail.
- INTENTIONAL emptied, `.kairos-field { gap }` changed by hand to `var(--kairos-space-sm)`: 2 pass, 1 fail ("kairos.css light: :: .kairos-field :: gap #0 was 6px, is 8px", same in dark). Reverted.
- INTENTIONAL in place, untouched tokens: "every 0.14 declaration resolves the same…" fails on --kairos-accent-hover (light) and the three font stacks only, as expected until task 2.1.
