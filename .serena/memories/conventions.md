# Codebase Conventions & Standards

## Database Operations
- Always await `dbConnect()` before querying Mongoose models in API route handlers or services.
- Define Mongoose schemas with strict indexing (2dsphere on GeoJSON locations, text indexes on title/description).
- Ensure models export existing `mongoose.models[ModelName]` or initialize a new model to avoid hot-reload compilation errors.

## API Route Design (`app/api/v1/*`)
- Validate input request bodies using Zod schemas (`safeParse`).
- Return explicit JSON responses with standard HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Error`).
- Non-blocking background operations (e.g. vector embedding generation or interaction logging) must use `.catch()` handlers so API responses are never delayed or failed by background background operations.

## Type Safety
- Maintain strict TypeScript interface definitions in `lib/models/` and `lib/validators/`.
- Do not bypass Zod schema parsing for complex query payloads.
