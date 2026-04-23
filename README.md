# Kelley Real Estate Professionals Website

Modernized static real estate website focused on stronger flow, cleaner UX, and better lead capture.

## What was improved

- Replaced legacy generated pages with clean, maintainable static HTML.
- Added a modern responsive layout and mobile-friendly navigation.
- Added conversion-focused UX patterns:
  - above-the-fold primary CTAs
  - short lead forms with minimal required fields
  - seller home valuation lead capture section
  - trust signals and testimonials
  - consistent contact pathways across all pages
- Added client-side form behavior (validation + success states).
- Updated links for GitHub Pages-safe routing (relative paths).

## Project structure

- `index.html` - Homepage (primary entry)
- `home.html` - Redirect compatibility page to `index.html`
- `our-agents.html` - Agent directory and matching form
- `reviews.html` - Social proof page with direct conversion CTA
- `assets/styles.css` - Shared styles
- `assets/main.js` - Shared behavior (mobile nav + form handling)
- `.github/workflows/deploy-gh-pages.yml` - GitHub Pages deployment workflow

## Local preview and functionality checks

Run a static server from repository root:

```bash
python3 -m http.server 8080
```

Open:

- `http://localhost:8080/index.html`
- `http://localhost:8080/our-agents.html`
- `http://localhost:8080/reviews.html`

Verify:

- Mobile menu opens/closes
- Forms validate required fields
- Success message appears on valid form submission
- Internal links and CTA anchors navigate correctly

## GitHub Pages setup

This repo includes a Pages workflow at:

- `.github/workflows/deploy-gh-pages.yml`

The workflow deploys on push to `main` (and can run manually via workflow_dispatch).

### One-time repository setting

1. Go to **Settings -> Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Save

After pushing to `main`, GitHub Pages deploys automatically.

## Lead form note

Forms are functional on static hosting by writing submissions to browser local storage (`siteLeads`) and showing an on-page confirmation.  
For production lead routing, connect submissions in `assets/main.js` to your CRM/backend endpoint.
