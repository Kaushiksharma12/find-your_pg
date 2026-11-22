import { dbConnect } from "@/lib/db/mongoose";
import { Property, IProperty } from "@/lib/models/Property";
import { Room, IRoom } from "@/lib/models/Room";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let extractorPromise: Promise<any> | null = null;

async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      const { pipeline } = await import("@huggingface/transformers");
      return await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    })();
  }
  return extractorPromise;
}

export function validateVector(vector: number[]): boolean {
  if (!Array.isArray(vector)) return false;
  if (vector.length !== 384) return false;
  return vector.every((val) => typeof val === "number" && !isNaN(val) && Number.isFinite(val));
}

export function buildPropertySemanticDocument(
  property: Partial<IProperty>,
  rooms: Partial<IRoom>[] = []
): string {
  const roomSummaries = (rooms || [])
    .map((r) => {
      const occ = r.occupancy || "Room";
      const price = r.price ? `₹${r.price.toLocaleString()}/mo` : "";
      const avail = r.isAvailable !== false ? "Available" : "Occupied";
      return `${occ} (${price}, ${avail})`;
    })
    .filter(Boolean)
    .join("; ");

  const landmarks = (property.nearbyLandmarks || []).join(", ");
  const amenities = (property.amenities || []).join(", ");
  const security = (property.securityFeatures || []).join(", ");
  const rules = (property.houseRules || []).join(", ");

  const doc = [
    `Title: ${property.title || ""}`,
    `Type: ${property.type || "PG"} for ${property.preferredFor || "Anyone"}`,
    `Locality: ${property.locality || ""}, City: ${property.city || ""}`,
    property.address ? `Address: ${property.address}` : "",
    landmarks ? `Landmarks: ${landmarks}` : "",
    property.distanceFromCollege ? `Distance: ${property.distanceFromCollege}` : "",
    amenities ? `Amenities: ${amenities}` : "",
    property.foodProvided
      ? `Food: ${property.foodType || "Meals provided"}`
      : "Food: Self-catering",
    security ? `Security: ${security}` : "",
    rules ? `Rules: ${rules}` : "",
    roomSummaries ? `Rooms: ${roomSummaries}` : "",
    property.description ? `Description: ${property.description}` : "",
  ]
    .filter(Boolean)
    .join(". ");

  return doc.trim();
}

export class AISearchEmbeddingService {
  async embedText(text: string): Promise<number[]> {
    const sanitized = (text || "").trim();
    if (!sanitized) {
      throw new Error("Text input for embedding cannot be empty");
    }

    try {
      const extractor = await getExtractor();
      const output = await extractor(sanitized, { pooling: "mean", normalize: true });
      const vector = Array.from(output.data) as number[];

      if (!validateVector(vector)) {
        throw new Error("Generated embedding vector failed validation checks");
      }

      return vector;
    } catch (err) {
      console.error("Embedding generation error:", err);
      throw err;
    }
  }

  async embedQuery(queryText: string): Promise<number[]> {
    return this.embedText(queryText);
  }

  async embedProperty(
    property: Partial<IProperty>,
    rooms: Partial<IRoom>[] = []
  ): Promise<number[]> {
    const doc = buildPropertySemanticDocument(property, rooms);
    return this.embedText(doc);
  }

  async generateAndPersistPropertyEmbedding(propertyId: string): Promise<number[] | null> {
    try {
      await dbConnect();

      const property = await Property.findById(propertyId);
      if (!property) {
        console.warn(`[EmbeddingService] Property ${propertyId} not found`);
        return null;
      }

      const rooms = await Room.find({ property: property._id }).lean();
      const vector = await this.embedProperty(property, rooms);

      await Property.findByIdAndUpdate(propertyId, {
        descriptionVector: vector,
      });

      return vector;
    } catch (err) {
      console.error(`[EmbeddingService] Failed to generate/persist vector for property ${propertyId}:`, err);
      return null;
    }
  }
}

export const aiSearchEmbeddingService = new AISearchEmbeddingService();
