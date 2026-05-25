# polygon-business-extractor

Monorepo for extracting and exploring business data from map polygons.

## What it does

Draw a polygon on a map → extract all businesses inside → filter by sector → save searches → export for AI processing.

## Architecture

```
polygon-business-extractor/
├── packages/
│   ├── frontend/          # Next.js · map UI, search tabs, export
│   └── extractor-api/     # FastAPI · multi-provider aggregator
└── ...                    # (future) packages/ai-agent/
```

### Data providers (extractor-api)
- OpenStreetMap / Overpass (free, no key)
- Google Places API
- Foursquare Places
- Yelp Fusion

### Stack
| Layer    | Tech                              |
|----------|-----------------------------------|
| Frontend | Next.js 14, TypeScript, Tailwind  |
| Map      | Leaflet + Leaflet Draw            |
| Backend  | FastAPI, Python 3.12              |
| Database | Supabase (PostgreSQL + Auth)      |
| Monorepo | pnpm workspaces + Turborepo       |

## Getting started

```bash
# Install dependencies
pnpm install

# Start all packages in dev mode
pnpm dev
```

### Environment variables

Copy `.env.example` files in each package and fill in your keys:

```
packages/frontend/.env.local
packages/extractor-api/.env
```

## Future modules

- `packages/ai-agent/` — multi-agent AI pipeline for processing exported business lists
