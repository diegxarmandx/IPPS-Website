# IPPS Website

Modern 3-page responsive website for IPPS (Puerto Rico), including:
- Landing page with industrial messaging, brands, and image carousel
- Searchable/filterable catalog page
- Contact + quote page with two distinct validated forms

## Project structure

```text
.
├── index.html
├── catalog.html
├── contact.html
├── assets
│   ├── css/styles.css
│   ├── js/main.js
│   ├── js/landing.js
│   ├── js/catalog.js
│   └── js/forms.js
├── assets/images
├── data/catalog.json
├── scripts/parse-catalog-from-pdf.mjs
└── catalog/source
```

## Run locally

```bash
npm run serve
```

Then open `http://localhost:8080`.

## Replace catalog data from PDF

1. Copy the product PDF into `catalog/source/catalog.pdf`.
2. Run:

```bash
npm run parse:catalog
```

3. Review `data/catalog.json` and adjust fields if needed.

## Notes

- `data/catalog.json` currently contains seed data because no PDF was found in this workspace.
- The parser is heuristic and should be reviewed against the source PDF before launch.
- Form submissions are configured to send automatically via FormSubmit to `ippspr@gmail.com` in `assets/js/forms.js` (first-time FormSubmit activation email may be required).
- Landing page client carousel entries are in `data/clients.json` and can be replaced with real company names/logos.
