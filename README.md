# Join Lina Health

Standalone pharmacy and GLP-1 provider website, extracted from `Wordeu/lina-website` at commit `00dcbce`.

## Local development

Use Node.js 24, then run:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. The homepage, `/p`, and `/partners/pharmacy` serve the pharmacy site.

```sh
npm run typecheck
npm run build
```

## Working together

Each person should clone this repository and work on their own branch. Open a pull request into `main` so the other person can review the changes and the Vercel preview before merging. Never commit `.env` files or credentials.

The page lives in `src/app/partners/pharmacy/page.tsx`; its demos and calculator live in `src/app/partners/pharmacy/care`. Metadata is in `src/app/partners/pharmacy/metadata.ts`. Images are in `public/partners/pharmacy`.

## Deployment

The separate Vercel project is `johnny-wordsworths-projects/joinlinahealth`, running at https://joinlinahealth.vercel.app. It uses the Next.js preset and Node.js 24. The custom domain has not yet been moved from the original project.

Automatic deployments are not connected yet: Vercel could not access the new private GitHub repository. Authorise the Vercel GitHub app for `Wordeu/joinlinahealth`, then connect it under the Vercel project's Git settings with `main` as the production branch. Pull requests and pushes to `main` already run a GitHub Actions build check.

Until the Git connection is enabled, an authorised Vercel user can deploy from a clean checkout with `vercel link --project joinlinahealth --scope johnny-wordsworths-projects` and `vercel deploy --prod`. Verify the separate deployment before moving the custom domain.

The canonical URL is currently `https://joinlinahealth.com`. If a different public domain is chosen, update `SITE_URL` in the metadata and the displayed address in `social-card/route.tsx` together.

No environment secrets are required. `/api/newsletter` forwards validated signup requests to the existing public `https://findlina.com/api/newsletter` endpoint. The original site remains responsible for saving those submissions. This project does not have direct database access. Existing booking links, email contact, Google Analytics ID, cookie banner, and no-index metadata are preserved.

This repository does not include the consumer app website, admin pages, scheduled jobs, or their credentials.
