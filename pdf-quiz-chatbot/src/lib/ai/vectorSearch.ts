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

// Helper function to extract page number from user message
function extractPageNumber(message: string): number | null {
  // Match various patterns like "page 3", "page3", "on page 5", "from page 2", etc.
  const pageMatch = message.match(/(?:page|pg)\s*(\d+)|(?:on|from|in)\s+page\s+(\d+)/i);
  return pageMatch ? parseInt(pageMatch[1] || pageMatch[2]) : null;
}

// Function to get content from a specific page
export async function getPageContent(
  pageNumber: number,
  chatId: string
): Promise<string> {
  try {
    const namespace = `chat-${chatId}`;
    
    // Initialize Pinecone
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const indexName = process.env.PINECONE_INDEX_NAME || "quickstart";
    const index = pinecone.index(indexName);

    // Get a large number of results and filter by page number
    const searchResponse = await index.namespace(namespace).query({
      vector: new Array(1536).fill(0.1), // Small non-zero values
      topK: 1000, // Get many results to filter
      includeMetadata: true,
    });

    // Filter results by page number
    const pageChunks = searchResponse.matches
      .filter(match => match.metadata?.pageNumber === pageNumber)
      .map(match => match.metadata?.text as string);

    if (pageChunks.length === 0) {
      return "";
    }

    // Combine all chunks from the page
    const pageContent = pageChunks.join(" ");

    return pageContent;
  } catch (error) {
    console.error("Error getting page content:", error);
    return "";
  }
}

export async function getRelevantContext(
  userMessage: string,
  chatId: string,
  topK: number = 3
): Promise<string> {
  try {
    const namespace = `chat-${chatId}`;
    
    // Check if user is asking about a specific page
    const requestedPage = extractPageNumber(userMessage);
    
    if (requestedPage) {
      console.log(`User asking about specific page: ${requestedPage}`);
      const pageContent = await getPageContent(requestedPage, chatId);
      
      if (pageContent) {
        return `Page ${requestedPage}: ${pageContent}`;
      } else {
        return `I don't have access to content from page ${requestedPage}. The document may not have that many pages, or the page content may not be available.`;
      }
    }
    
    // For non-page-specific queries, use semantic search
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