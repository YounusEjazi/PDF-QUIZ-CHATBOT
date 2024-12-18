import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid"; // For generating unique filenames

export const config = {
  api: {
    bodyParser: false, // Disable Next.js default body parsing
  },
};

// Helper to buffer the request body
async function bufferRequestBody(req: Request): Promise<Buffer> {
  const reader = req.body?.getReader();
  if (!reader) {
    throw new Error("ReadableStream is not available.");
  }

  const chunks: Uint8Array[] = [];
  let result: ReadableStreamReadResult<Uint8Array>;
  while (!(result = await reader.read()).done) {
    chunks.push(result.value);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: Request) {
  try {
    // Get the raw body
    const rawBody = await bufferRequestBody(req);

    // Parse multipart boundary
    const contentType = req.headers.get("content-type");
    const boundaryMatch = contentType?.match(/boundary=(.+)/);
    if (!boundaryMatch) {
      return NextResponse.json({ error: "Invalid content-type" }, { status: 400 });
    }
    const boundary = `--${boundaryMatch[1]}`;

    // Split the body into parts
    const parts = rawBody.toString("latin1").split(boundary).filter((part) => part.trim() !== "--");

    // Directory for saving files (directly under `public`)
    const publicPath = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath, { recursive: true });
    }

    const uploadedFiles: string[] = [];

    for (const part of parts) {
      if (part.includes("Content-Disposition")) {
        const match = part.match(/filename="(.+?)"/);
        if (match) {
          const originalFilename = match[1];
          const fileExtension = path.extname(originalFilename);
          const uniqueFilename = `${uuidv4()}${fileExtension}`; // Generate a unique filename

          // Extract binary data from part
          const start = part.indexOf("\r\n\r\n") + 4; // Body start
          const end = part.lastIndexOf("\r\n");
          const fileData = Buffer.from(part.slice(start, end), "latin1");

          const filePath = path.join(publicPath, uniqueFilename);
          fs.writeFileSync(filePath, fileData); // Save file to disk
          uploadedFiles.push(`/${uniqueFilename}`); // Store relative path
        }
      }
    }

    return NextResponse.json({ filePaths: uploadedFiles }, { status: 200 });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
