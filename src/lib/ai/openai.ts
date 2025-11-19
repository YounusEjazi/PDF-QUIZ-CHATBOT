import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * Generate embeddings for multiple text chunks.
 * @param texts - Array of text chunks to embed.
 * @returns Array of embedding vectors.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: texts,
      });

      if (!response.data || response.data.length === 0) {
        throw new Error("No embeddings returned from OpenAI API.");
      }

      return response.data.map((item) => item.embedding);
    } catch (error) {
      console.error(`Error generating embeddings (Attempt ${attempt}):`, error);
      if (attempt === maxRetries) {
        throw new Error("Failed to generate embeddings after multiple attempts.");
      }
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay before retrying
    }
  }
}


export default openai;
