import {
  aiSearchEmbeddingService,
  buildPropertySemanticDocument,
  validateVector,
} from "./ai-search-embedding-service";
import { dbConnect } from "@/lib/db/mongoose";
import { Property } from "@/lib/models/Property";

export async function runEmbeddingTests() {
  await dbConnect();

  // 1. Query Embedding Dimension & Type Check
  const queryText = "Girls PG in Koramangala under 15000 with AC";
  const queryVector = await aiSearchEmbeddingService.embedQuery(queryText);

  const isQueryVectorValid = validateVector(queryVector);
  const isQuery384Dims = queryVector.length === 384;
  const isQueryFinite = queryVector.every((v) => typeof v === "number" && !isNaN(v) && isFinite(v));

  // 2. Property Document Construction & Determinism Check
  const sampleProp = {
    title: "Koramangala Luxury Stays",
    type: "Girls PG" as const,
    preferredFor: "Female" as const,
    city: "Bangalore",
    locality: "Koramangala",
    address: "12th Main Road, 4th Block",
    nearbyLandmarks: ["Christ University", "Forum Mall"],
    amenities: ["Wi-Fi", "AC", "Power Backup"],
    foodProvided: true,
    foodType: "North Indian & South Indian",
    securityFeatures: ["CCTV", "Biometric Lock"],
    houseRules: ["No Smoking"],
    description: "Spacious premium accommodation for student females.",
  };

  const sampleRooms = [
    { occupancy: "Single" as const, price: 14000, isAvailable: true },
    { occupancy: "2 Sharing" as const, price: 10000, isAvailable: true },
  ];

  const doc1 = buildPropertySemanticDocument(sampleProp, sampleRooms);
  const doc2 = buildPropertySemanticDocument(sampleProp, sampleRooms);
  const isDocDeterministic = doc1 === doc2;

  // Verify private/auth fields do not leak into semantic doc
  const privateFieldsCheck =
    !doc1.includes("password") &&
    !doc1.includes("jwt") &&
    !doc1.includes("secret") &&
    !doc1.includes("owner");

  // 3. Property Embedding Dimension & Finite Check
  const propVector = await aiSearchEmbeddingService.embedProperty(sampleProp, sampleRooms);
  const isPropVectorValid = validateVector(propVector);

  // 4. Missing Optional Fields & Missing Rooms Robustness Check
  const sparseProp = { title: "Minimal Stay" };
  const sparsePropVector = await aiSearchEmbeddingService.embedProperty(sparseProp, []);
  const isSparseValid = validateVector(sparsePropVector);

  // 5. Empty Input Handling Check
  let emptyInputRejected = false;
  try {
    await aiSearchEmbeddingService.embedText("   ");
  } catch {
    emptyInputRejected = true;
  }

  // 6. Persistence & MongoDB Integration Test
  // Generate and persist vector for first property in DB if present
  let isPersistedValid = true;
  const firstProperty = await Property.findOne({}).lean();
  if (firstProperty) {
    const persistedVector = await aiSearchEmbeddingService.generateAndPersistPropertyEmbedding(
      firstProperty._id.toString()
    );

    if (persistedVector) {
      isPersistedValid = validateVector(persistedVector);
      // Double check in DB
      const updatedInDb = await Property.findById(firstProperty._id).lean();
      isPersistedValid =
        isPersistedValid &&
        Array.isArray(updatedInDb?.descriptionVector) &&
        updatedInDb?.descriptionVector?.length === 384;
    }
  }

  // Measure performance latency for 10 subsequent embeddings
  const startTime = Date.now();
  for (let i = 0; i < 5; i++) {
    await aiSearchEmbeddingService.embedQuery(`Query ${i} test search text`);
  }
  const avgLatencyMs = Math.round((Date.now() - startTime) / 5);

  return {
    isQueryVectorValid,
    isQuery384Dims,
    isQueryFinite,
    isDocDeterministic,
    privateFieldsCheck,
    isPropVectorValid,
    isSparseValid,
    emptyInputRejected,
    isPersistedValid,
    avgLatencyMs,
  };
}
