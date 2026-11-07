# API overview

Base path: `/api/v1`

All protected routes require `Authorization: Bearer <JWT>`.

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | No | Health check |
| POST | `/auth/register` | No | Register |
| POST | `/auth/login` | No | Login |
| GET | `/auth/me` | Yes | Current user |
| POST | `/analyses` | Yes | Submit and analyze |
| GET | `/analyses` | Yes | Paginated history |
| GET | `/analyses/:id` | Yes | Get report |
| GET | `/analyses/:id/status` | Yes | Get status |
| DELETE | `/analyses/:id` | Yes | Delete report |
| GET | `/dashboard/overview` | Yes | Dashboard statistics |
| GET | `/dashboard/activity` | Yes | Activity data |
| GET/PUT | `/users/me` | Yes | Profile |
| GET | `/admin/dashboard` | Admin | Platform statistics |
| GET | `/admin/users` | Admin | User listing |
| GET/POST | `/admin/sources` | Admin | Source registry |
| PUT/DELETE | `/admin/sources/:id` | Admin | Update/delete source |

Analysis request:
```json
{ "submissionType": "CLAIM", "text": "A factual claim to verify" }
```
For URL submission:
```json
{ "submissionType": "URL", "url": "https://example.org/article" }
```
