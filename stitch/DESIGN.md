# Design System Document

## 1. Overview & Creative North Star: "The Silent Sentinel"

This design system is engineered to transform a standard security monitor into a high-end, editorial-grade dashboard. Our Creative North Star is **"The Silent Sentinel"**: a design philosophy that prioritizes calm authority through sophisticated restraint.

In a domain often cluttered with aggressive alerts and chaotic grids, this system utilizes **Soft Minimalism** to ensure that data—not the interface—is the protagonist. We break the "template" look by using intentional white space as a structural element, asymmetrical layouts that guide the eye to critical metrics, and a typography scale that balances high-impact displays with microscopic detail. The goal is to move from a "tool" to an "intelligence experience."

## 2. Colors & Surface Logic

The palette is rooted in a sober, professional foundation of deep charcoals and clean greys, using "Deep Navy" tones only for precise informational accents.

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for defining sections. Visual boundaries must be achieved through **background color shifts** or **tonal nesting**. For example, a card should be distinguished from the page background by moving from `surface` (#f8f9fa) to `surface_container_lowest` (#ffffff).

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, physical layers of fine paper.
- **Base Layer:** `surface` (#f8f9fa).
- **Secondary Sections:** `surface_container_low` (#f3f4f5).
- **Primary Data Cards:** `surface_container_lowest` (#ffffff).
- **Interactive/Elevated Elements:** `surface_container_high` (#e7e8e9).

### The "Glass & Gradient" Rule
To add visual "soul" to the professional sobriety, use **Glassmorphism** for floating overlays or global notifications. Apply `surface_container_lowest` at 80% opacity with a `backdrop-blur` of 20px. 
For primary Action buttons or Hero data points, use a subtle linear gradient from `primary` (#0c1014) to `primary_container` (#212529) at a 135-degree angle to provide a premium, tactile depth.

## 3. Typography: Editorial Authority

We use a dual-font approach to separate "Data" from "Context." **Manrope** provides a modern, geometric feel for high-level numbers, while **Inter** ensures maximum legibility for dense reports.

- **Display Scale (Manrope):** Used for the "North Star" metrics (e.g., Time Elapsed). `display-lg` (3.5rem) should be used for the primary counter, set with tight letter spacing (-0.02em) to feel authoritative.
- **Headline Scale (Manrope):** For section headers. Use `headline-sm` (1.5rem) to introduce major data blocks like "Reporte Estadístico."
- **Body & Label Scale (Inter):** All meta-data and descriptions. Use `body-sm` (0.75rem) for secondary details to keep the interface feeling spacious.
- **Tonal Contrast:** Never use pure black for body text. Use `on_surface_variant` (#44474a) for descriptions and `primary` (#0c1014) only for primary headlines and critical numbers.

## 4. Elevation & Depth

Hierarchy is achieved through **Tonal Layering** rather than structural scaffolding.

- **The Layering Principle:** Depth is created by stacking. Place a `surface_container_lowest` card on top of a `surface_container_low` section. The contrast in brightness creates a "soft lift."
- **Ambient Shadows:** Shadows are reserved for elements that truly float (modals, dropdowns). Use a 40px blur with 4% opacity, using a tinted shadow color derived from `primary`.
- **The "Ghost Border":** If a container requires a boundary (e.g., in high-density data tables), use a 1px border with `outline_variant` (#c5c6ca) at **15% opacity**. It should be felt, not seen.
- **Roundedness:** Use the `xl` (0.75rem) radius for primary containers and `md` (0.375rem) for internal elements (chips, inputs). This creates a nested, organic flow.

## 5. Components

### Cards & Lists
- **Rule:** Forbid the use of divider lines.
- **Implementation:** Separate list items using the `spacing-4` (1rem) scale. Use a `surface_container_low` background on hover to define the item area. For cards, use vertical white space (`spacing-8`) to separate headers from content.

### Action Chips (Status Indicators)
- **Critical Status:** `error_container` (#ffdad6) background with `on_error_container` (#93000a) text.
- **Neutral/Stable:** `secondary_container` (#dde3eb) with `on_secondary_container` (#5f656c).
- **Shape:** Use the `full` (9999px) roundedness for a pill-shaped, professional look.

### Input Fields
- **Default State:** Background `surface_container_highest`, no border, `md` roundedness.
- **Focus State:** 1px "Ghost Border" at 40% opacity using `primary`.

### Progress & Metrics
- For the "Time Elapsed" monitor, use `display-lg` typography. Surround the metric with "breathable" white space (`spacing-12` or higher) to signify its importance as the primary system output.

## 6. Do's and Don'ts

### Do
- **Do** use `spacing-20` (5rem) or more for page margins to create an "editorial" feel.
- **Do** use `surface_bright` to highlight the most recent alert in a list.
- **Do** prioritize the "Time Transcurrido" using a higher font weight and the largest size in the typography scale.

### Don't
- **Don't** use 100% opaque borders to separate content; it creates "visual noise" that fatigues the operator.
- **Don't** use standard "Warning Yellow." Use the `tertiary` and `tertiary_fixed` tokens for a more sophisticated "Ambar" palette.
- **Don't** use heavy dropshadows. If a card doesn't look "elevated" enough, increase the background contrast between it and its parent container.