# Greenline Activations ROI Calculator

## Original Problem Statement
Create a fire landing page for an ROI calculator. Update title to "Greenline Activations ROI Calculator" and remove "Plift x" from the Heading.

## User Choices
- Design Style: Nature/organic aesthetic with earth tones, greenery theme
- Layout: Calculator front and center (no hero section)
- Brand Colors: #659f20 (green) and #ff725e (coral accent)
- Content: Keep comparison table and callout section

## Architecture
- **Frontend**: React with Tailwind CSS
- **Styling**: Custom CSS with CSS variables for brand colors
- **Fonts**: Fraunces (serif headings) + Plus Jakarta Sans (body)
- **Calculations**: All done client-side in React useState/useCallback

## Core Requirements (Static)
1. Interactive ROI calculator with 5 adjustable parameters
2. Real-time calculation updates
3. Sprint economics breakdown
4. Activation-by-activation revenue visualization
5. Comparison table (Greenline vs competitors)
6. Mobile responsive design

## What's Been Implemented (Jan 2026)
- [x] Header with "Greenline Activations ROI Calculator" title
- [x] Sprint Parameters card with 5 interactive sliders
- [x] Dynamic sprint cost pricing ($225/act base, $216/act at 30)
- [x] Metrics grid (Sprint Cost, Consumers Reached, Units Moved, Revenue)
- [x] Sprint Economics breakdown
- [x] ROI grid (Sprint ROI %, Cost per Buyer, Break-even Units)
- [x] Activation-by-activation ramp bars with profit indicators
- [x] Comparison table with Greenline vs alternatives
- [x] Coral callout section
- [x] **Download PDF Report button** - generates shareable PDF of current calculations
- [x] Responsive design (desktop, tablet, mobile)
- [x] Nature/organic background with floating leaf accents

## Tech Stack
- React 19
- Tailwind CSS
- Lucide React (icons)
- **html2pdf.js** (PDF generation)
- Custom CSS with CSS variables

## Backlog / Future Enhancements
- P2: Save/share calculator configurations via URL params
- P2: Add email capture for lead generation
- P3: Add animation on number changes
