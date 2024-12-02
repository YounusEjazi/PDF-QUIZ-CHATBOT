import { getPineconeIndex } from "./db";

/**
 * Upsert embeddings into Pinecone.
 * @param namespace - The namespace for the embeddings.
 * @param embeddings - Array of embeddings with metadata.
 */
export async function upsertEmbeddings(
  namespace: string,
  embeddings: { id: string; values: number[]; metadata: any }[]
) {
  try {
    const index = await getPineconeIndex(process.env.PINECONE_INDEX_NAME!);
    await index.namespace(namespace).upsert(embeddings);
    console.log("Embeddings successfully upserted.");
  } catch (error) {
    console.error("Error upserting embeddings to Pinecone:", error);
    throw new Error("Failed to upsert embeddings to Pinecone.");
  }
}
