import { dbConnect } from "@/lib/db/mongoose";
import { Property } from "@/lib/models/Property";
import { aiSearchEmbeddingService } from "./ai-search-embedding-service";

export interface BackfillResult {
  totalFound: number;
  processed: number;
  succeeded: number;
  failed: number;
  durationMs: number;
}

export async function backfillPropertyEmbeddings(): Promise<BackfillResult> {
  await dbConnect();
  const startTime = Date.now();

  // Find all properties where descriptionVector is missing or empty
  const unvectorizedProperties = await Property.find({
    $or: [
      { descriptionVector: { $exists: false } },
      { descriptionVector: { $size: 0 } },
      { descriptionVector: null },
    ],
  }).select("_id title");

  const totalFound = unvectorizedProperties.length;
  let succeeded = 0;
  let failed = 0;

  for (const prop of unvectorizedProperties) {
    try {
      const result = await aiSearchEmbeddingService.generateAndPersistPropertyEmbedding(
        prop._id.toString()
      );
      if (result) {
        succeeded++;
      } else {
        failed++;
      }
    } catch (err) {
      console.error(`Backfill failed for property ${prop._id}:`, err);
      failed++;
    }
  }

  return {
    totalFound,
    processed: succeeded + failed,
    succeeded,
    failed,
    durationMs: Date.now() - startTime,
  };
}
