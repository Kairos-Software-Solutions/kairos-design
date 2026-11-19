## MODIFIED Requirements

### Requirement: Surfaces follow the brief at Brand Scale
At Brand Scale the surface shadow tokens (`--kairos-shadow`, `--kairos-shadow-card`, `--kairos-shadow-lg`) SHALL resolve to the brief's soft card shadow, the pressed shadow (`--kairos-shadow-pressed`) to no shadow, and panels to the 2px radius. The stamp tokens (`--kairos-shadow-stamp`, `--kairos-shadow-stamp-hover`, since 0.19.0) carry only the rank-1 button stamp, read through the button knobs.

#### Scenario: Soft shadows replace the stamp
- **WHEN** the Brand "Cards And Bands" story renders a `kairos-card--soft` and a `kairos-panel`
- **THEN** both shadows are the soft card shadow (`0px 14px 30px -20px` in the soft shadow colour) and the panel radius is 2px
- **CHECK** `npm run test-stories`: `stories/brand/Surfaces.stories.tsx` › "Cards And Bands" passes
