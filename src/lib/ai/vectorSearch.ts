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
    console.log(`Searching for: "${query}" in namespace: ${namespace} with topK: ${topK}`);
    
    // Generate embedding for the query
    const queryEmbedding = await generateEmbeddings([query]);
    
    if (!queryEmbedding || queryEmbedding.length === 0) {
      console.error("Failed to generate query embedding");
      return [];
    }

    console.log(`Generated query embedding with ${queryEmbedding.length} dimensions, first embedding has ${queryEmbedding[0]?.length || 0} values`);

    // Initialize Pinecone
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const indexName = process.env.PINECONE_INDEX_NAME || "quickstart";
    const index = pinecone.index(indexName);
    console.log(`Using Pinecone index: ${indexName}`);

    // Search for similar vectors
    const searchResponse = await index.namespace(namespace).query({
      vector: queryEmbedding[0],
      topK,
      includeMetadata: true,
    });

    console.log(`Pinecone search response: ${searchResponse.matches?.length || 0} matches found`);
    console.log(`Search query vector length: ${queryEmbedding[0].length}`);
    console.log(`Search namespace: ${namespace}`);
    console.log(`Search topK: ${topK}`);
    
    // Format the results
    const results: SearchResult[] = searchResponse.matches
      .filter(match => match.metadata && match.score)
      .map(match => ({
        text: match.metadata?.text as string,
        pageNumber: match.metadata?.pageNumber as number,
        score: match.score || 0,
      }));

    console.log(`Found ${results.length} relevant chunks for query: "${query}" in namespace: ${namespace}`);
    if (results.length > 0) {
      console.log(`Top result: Page ${results[0].pageNumber}, Score: ${results[0].score}, Text preview: ${results[0].text.substring(0, 100)}...`);
    }
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
    console.log(`Getting relevant context for message: "${userMessage}" in namespace: ${namespace}`);
    
    // First, let's check if there are any chunks at all in this namespace
    console.log(`Checking if namespace ${namespace} has any content...`);
    const testResults = await searchSimilarChunks("test", namespace, 1);
    console.log(`Namespace ${namespace} has ${testResults.length} chunks available`);
    
    if (testResults.length === 0) {
      console.log(`No content found in namespace ${namespace} - PDF may not be uploaded or processed yet`);
      // Try waiting a bit and retrying in case of indexing delays
      console.log(`Waiting 5 seconds and retrying search...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const retryResults = await searchSimilarChunks("test", namespace, 1);
      if (retryResults.length > 0) {
        console.log(`Retry found ${retryResults.length} chunks after waiting`);
      } else {
        console.log(`Still no chunks found after retry`);
        return "";
      }
    }
    
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
    console.log(`Performing semantic search for: "${userMessage}"`);
    let searchResults = await searchSimilarChunks(userMessage, namespace, topK);
    console.log(`Search results found: ${searchResults.length} chunks`);
    
    // If no results found, wait and retry (Pinecone indexing delay)
    if (searchResults.length === 0) {
      console.log(`No results found, waiting 3 seconds and retrying...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      searchResults = await searchSimilarChunks(userMessage, namespace, topK);
      console.log(`Retry search results: ${searchResults.length} chunks`);
    }
    
    // If still no results found and the query is generic (like "analyze this"), try a broader search
    if (searchResults.length === 0 && (userMessage.toLowerCase().includes('analyze') || userMessage.toLowerCase().includes('summarize'))) {
      console.log(`No results for specific query, trying broader search...`);
      searchResults = await searchSimilarChunks("document content summary", namespace, topK);
      console.log(`Broader search results: ${searchResults.length} chunks`);
    }
    
    if (searchResults.length === 0) {
      console.log(`No search results found for namespace: ${namespace}`);
      // Try to get any content from the document as a last resort
      console.log(`Trying to get any content from the document...`);
      const fallbackResults = await searchSimilarChunks("content", namespace, 3);
      if (fallbackResults.length > 0) {
        console.log(`Found ${fallbackResults.length} fallback results`);
        searchResults = fallbackResults;
      } else {
        // If still no results, wait a bit and try again (in case PDF is still being processed)
        console.log(`No results found, waiting 2 seconds and retrying...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        const retryResults = await searchSimilarChunks("content", namespace, 3);
        if (retryResults.length > 0) {
          console.log(`Found ${retryResults.length} results on retry`);
          searchResults = retryResults;
        } else {
          return "";
        }
      }
    }

    // Combine relevant chunks into context
    const context = searchResults
      .map(result => `Page ${result.pageNumber}: ${result.text}`)
      .join("\n\n");

    console.log(`Context length: ${context.length} characters`);
    return context;
  } catch (error) {
    console.error("Error getting relevant context:", error);
    return "";
  }
} 