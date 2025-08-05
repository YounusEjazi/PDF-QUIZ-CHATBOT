import { Pinecone } from "@pinecone-database/pinecone";
import { generateEmbeddings } from "./openai";

export interface SearchResult {
  text: string;
  pageNumber: number;
  score: number;
}

export async function searchSimilarChunks(
  query: string,
  namespace: string,
  topK: number = 5
): Promise<SearchResult[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbeddings([query]);
    
    if (!queryEmbedding || queryEmbedding.length === 0) {
      console.error("Failed to generate query embedding");
      return [];
    }

    // Initialize Pinecone
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const indexName = process.env.PINECONE_INDEX_NAME || "quickstart";
    const index = pinecone.index(indexName);

    // Search for similar vectors
    const searchResponse = await index.namespace(namespace).query({
      vector: queryEmbedding[0],
      topK,
      includeMetadata: true,
    });

    // Format the results
    const results: SearchResult[] = searchResponse.matches
      .filter(match => match.metadata && match.score)
      .map(match => ({
        text: match.metadata?.text as string,
        pageNumber: match.metadata?.pageNumber as number,
        score: match.score || 0,
      }));

    console.log(`Found ${results.length} relevant chunks for query: "${query}" in namespace: ${namespace}`);
    return results;
  } catch (error) {
    console.error("Error in vector search:", error);
    return [];
  }
}

export async function getRelevantContext(
  userMessage: string,
  chatId: string,
  topK: number = 3
): Promise<string> {
  try {
    const namespace = `chat-${chatId}`;
    const searchResults = await searchSimilarChunks(userMessage, namespace, topK);
    
    if (searchResults.length === 0) {
      return "";
    }

    // Combine relevant chunks into context
    const context = searchResults
      .map(result => `Page ${result.pageNumber}: ${result.text}`)
      .join("\n\n");

    return context;
  } catch (error) {
    console.error("Error getting relevant context:", error);
    return "";
  }
} 