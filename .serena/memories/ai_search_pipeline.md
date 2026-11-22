# AI Search, Embedding & Evaluation Pipeline

## Architecture Overview
The AI search subsystem is built as a native Node.js pipeline operating within Next.js server context without requiring external Python microservices.

## Pipeline Components
1. **Query Understanding & Parsing** (`lib/services/ai-search-parser.ts`):
   - `LocalDeterministicProvider` converts natural language queries into structured `SearchIntent` objects (City, Locality, Landmark/College POI, Price range, Property Type, Occupancy, Amenities, Meals, Furnishing).
2. **Candidate Retrieval Service** (`lib/services/ai-search-service.ts`):
   - Queries MongoDB `Room` and `Property` collections under strict parameter bounds (price, location, type, occupancy). Seeds mock data on initial empty collection states.
3. **Local Embedding Service** (`lib/services/ai-search-embedding-service.ts`):
   - Uses `@huggingface/transformers` (`pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2")`).
   - Produces 384-dimensional normalized dense vectors (`validateVector` verifies length 384).
   - Generates property text representation via `buildPropertySemanticDocument` and persists to `Property.descriptionVector`.
4. **Hybrid Candidate Ranking** (`lib/services/ai-search-hybrid-ranking-service.ts`):
   - Computes deterministic score (0-100) and cosine vector similarity (0-100).
   - Calculates hybrid score using configurable weights (default 70% deterministic / 30% semantic: `HYBRID_WEIGHT_CONFIGS.CONFIG_70_30`).
   - Applies deterministic tie-breaker sorting (`hybridScore` DESC -> `deterministicScore` DESC -> `rating` DESC -> `reviewCount` DESC -> `_id` ASC).
5. **Interaction Signal Logging** (`app/api/v1/interactions/route.ts` & `lib/models/UserInteraction.ts`):
   - Non-blocking logging of `SEARCH_PERFORMED` event metadata, query text, top candidate scores, and candidate IDs.
6. **Semantic Evaluation Suite** (`lib/services/ai-search-semantic-evaluation.ts`):
   - Ground-truth evaluation framework running 25 expert relevance test cases (`SEMANTIC_BENCHMARK_FIXTURES`).
   - Measures **NDCG@3**, **NDCG@5**, **MRR**, **Pairwise Accuracy**, and **Invalid Result Rate**.

## Key Gotchas
- Property creation (`POST /api/v1/properties`) does NOT auto-generate vectors; embeddings are only generated automatically during property update (`PATCH /api/v1/properties/[id]`) or via manual backfill script (`ai-search-embedding-backfill.ts`).
