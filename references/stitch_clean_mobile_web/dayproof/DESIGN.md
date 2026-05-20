---
name: DayProof
colors:
  surface: '#141313'
  surface-dim: '#141313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353434'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#ffb59c'
  on-secondary: '#5c1900'
  secondary-container: '#fa5c1c'
  on-secondary-container: '#511500'
  tertiary: '#ffffff'
  on-tertiary: '#303030'
  tertiary-container: '#e2e2e2'
  on-tertiary-container: '#646464'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#ffdbcf'
  secondary-fixed-dim: '#ffb59c'
  on-secondary-fixed: '#390c00'
  on-secondary-fixed-variant: '#832700'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#141313'
  on-background: '#e5e2e1'
  surface-variant: '#353434'
  safety-orange: '#FF5F1F'
  electric-blue: '#007AFF'
  success-green: '#00FF41'
  failure-red: '#FF0000'
  surface-gray: '#121212'
typography:
  headline-xl:
    fontFamily: JetBrains Mono
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: JetBrains Mono
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
  stats-display:
    fontFamily: JetBrains Mono
    fontSize: 64px
    fontWeight: '800'
    lineHeight: 64px
spacing:
  base: 4px
  container-padding: 20px
  stack-gap: 12px
  section-gap: 32px
  touch-target-min: 48px
---

## Brand & Style

The design system is built on the philosophy of **Brutalist Minimalism**. It prioritizes "Proof" over "Performance," creating a high-stakes, high-contrast environment that reflects the mental grit required for 75 Hard. There is no room for decoration—every element serves as a functional witness to the user's discipline.

### Brand Personality
- **Raw Honesty:** Unfiltered, unedited, and stark. Like a physical logbook or a timestamped evidence photo.
- **Utilitarian Discipline:** Functional, fast, and no-nonsense. Large touch targets and clear binary states (Done/Not Done).
- **Stark Contrast:** Using pure black and white to represent the binary nature of the challenge (Success or Failure).

### Design Style
The system utilizes a **High-Contrast / Bold** approach with **Brutalist** undertones:
- Heavy, solid borders for interactive elements.
- No gradients or soft shadows; depth is achieved through layering and hard offsets.
- Monospaced elements for data/timestamps to evoke a "system log" feel.
- Large, aggressive typography that demands accountability.

## Colors

This design system defaults to **Dark Mode** to reduce eye strain during early morning or late-night logging and to emphasize the "stark" aesthetic.

### Palette Usage
- **Primary (White):** Used for primary text, critical icons, and high-emphasis borders.
- **Secondary (Safety Orange):** Reserved for actions that require focus, "Start" buttons, and the active streak indicator. It represents the "Proof" element.
- **Background (Black):** Pure black (#000000) for the main canvas to ensure maximum OLED efficiency and focus.
- **Surface Gray:** Used for card backgrounds and secondary containers to provide subtle separation without losing the dark aesthetic.

### Semantic Colors
- **Success:** Matrix-style green (#00FF41) for completed tasks and successful days.
- **Failure:** Pure red (#FF0000) for missed days and "Restart Challenge" warnings.

## Typography

The typography strategy pairs the systematic, technical feel of **JetBrains Mono** with the clean, neutral readability of **Inter**.

- **JetBrains Mono** is used for all headlines, data points, and labels. It reinforces the "Log" and "Proof" concept.
- **Inter** is used for body text, journal entries, and instructions to ensure long-form reading remains comfortable.
- **Case Usage:** Labels and navigation items should use uppercase with tracking (letter-spacing) to create a sense of institutional authority.
- **Scale:** High contrast between headline sizes and body text is encouraged to create a clear hierarchy on small mobile screens.

## Layout & Spacing

The layout is **Mobile-First and Fluid**, designed for single-handed use during physical activity or on the go.

### Grid & Margins
- Use a **single-column fluid layout** with 20px side margins.
- No multi-column structures on mobile; all data is stacked vertically to maintain focus.
- **Generous Whitespace:** Vertical gaps between major sections should be 32px or more to allow the design to breathe and emphasize each "Proof" item.

### Spacing Rhythm
- All spacing must be a multiple of 4px.
- Interactive elements (Checklist items, buttons) must have a minimum height of 56px to accommodate large touch targets, especially when the user is tired or post-workout.

## Elevation & Depth

This design system rejects traditional shadows and blurs in favor of **Structural Stacking**.

- **Flat Tiers:** Differentiation is achieved through background color shifts (Black vs. Surface Gray) and high-contrast borders.
- **Hard Offsets:** If depth is required for a button or card, use a 4px solid black/white offset border rather than a soft shadow. This mimics a "printed" or "stamped" feel.
- **Borders as Depth:** A 2px solid white border is the primary way to define a container or interactive zone.
- **Zero Transparency:** Use solid colors only. Avoid backdrop blurs or glassmorphism to maintain the raw, utilitarian aesthetic.

## Shapes

The shape language is **Sharp (0px)**. 

- **Hard Edges:** All buttons, input fields, and photo containers must have 90-degree corners. This evokes a sense of rigidity, structure, and discipline.
- **The Photo Frame:** Progress photos should be displayed in a strict 1:1 square ratio with a thick solid border, emphasizing the "mugshot" or "evidence" style of progress tracking.

## Components

### Buttons
- **Primary:** Solid White background, Black JetBrains Mono text, All-Caps. High-intensity.
- **Secondary:** Transparent background, 2px White border, White text.
- **Destructive (Restart):** Solid Red background, White text.
- **Interaction:** Buttons should "invert" (Black to White) on tap/active states to provide immediate tactile feedback.

### Checklist Items
- Large, full-width rows with a 1px White bottom border.
- Custom checkboxes: Large square boxes (24x24px). When checked, they fill with Success Green or Safety Orange and the text is struck through.

### Input Fields (Journal & Metrics)
- Minimalist line-based inputs. No background color, just a 2px bottom border that turns Safety Orange on focus.
- Placeholder text should be low-contrast gray, using JetBrains Mono.

### Cards (Day Detail / Recap)
- Use "Surface Gray" backgrounds with 0px rounding.
- Headers within cards should use the `label-caps` typography style.

### Photo Upload Area
- An empty state showing a large "+" icon and the text "UPLOAD PROOF". 
- Once uploaded, the photo fills the container entirely. No padding within the frame.

### Daily Recap Card (Shareable)
- A high-contrast image generation template.
- Black background, white bold text, and the safety orange accent for the Day Number.
- Includes a "watermark" style timestamp to prove the time of completion.