# MyGG portfolio page

The `/mygg` page loads active student portfolios from the MyGG placement-profile API. Set these
server-side variables in `apps/frontend/.env` (or the deployment environment):

```env
NEXT_PUBLIC_BACKEND_URL=https://your-tpo-backend.example
MYGG_BACKEND_URL=https://your-mygg-backend.example
MYGG_ADMIN_TOKEN=your-admin-session-token
```

The token must belong to an `ADMIN` with `EXPORT_STUDENT_PROFILES` permission. It is sent only by
the Next.js server proxy and must not be exposed as a `NEXT_PUBLIC_` variable. The frontend batch
selector's year is sent as the API's `passoutYear` filter. MyGG profile images, resumes, certificates
and achievement files use the API's pre-signed S3 URLs; those links expire, so reload the page to
fetch fresh ones. Requests to the proxy also validate the existing TPO portal access token before
returning profile data, so `NEXT_PUBLIC_BACKEND_URL` must point to the TPO backend as usual.