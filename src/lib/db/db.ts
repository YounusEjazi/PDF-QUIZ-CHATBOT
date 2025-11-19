import { PrismaClient } from "@prisma/client";
import { Pinecone } from "@pinecone-database/pinecone";
import "server-only";

declare global {
  var cachedPrisma: PrismaClient;
  var cachedPinecone: Pinecone;
}

// Initialize Prisma
export let prisma: PrismaClient;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
  }
  prisma = global.cachedPrisma;
}

// Initialize Pinecone
export let pinecone: Pinecone;
if (!global.cachedPinecone) {
  global.cachedPinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
}
pinecone = global.cachedPinecone;

export async function getPineconeIndex(indexName: string) {
  if (!indexName) {
    throw new Error("Index name is required to retrieve Pinecone index.");
  }
  try {
    return pinecone.index(indexName);
  } catch (error) {
    console.error("Error retrieving Pinecone index:", error);
    throw new Error("Failed to retrieve Pinecone index.");
  }
}
