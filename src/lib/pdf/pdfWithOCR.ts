import { createWorker } from "tesseract.js";
import { promises as fs } from "fs";
import * as pdfjsLib from "pdfjs-dist";
import { createCanvas } from "canvas";
import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

// Configure PDF.js worker for server-side
// Use a local worker file or CDN
if (typeof window === "undefined") {
  // Server-side: use CDN or local worker
  try {
    // Try to use local worker if available
    const workerPath = path.join(process.cwd(), "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  } catch (error) {
    // Fallback to CDN
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
}

interface PageContent {
  pageContent: string;
  metadata: {
    loc: {
      pageNumber: number;
    };
  };
}

/**
 * Extract text from PDF using OCR for scanned/image-based PDFs
 * Falls back to OCR if text extraction returns insufficient content
 */
export async function extractTextWithOCR(
  pdfPath: string,
  options: {
    minTextLength?: number; // Minimum text length to consider extraction successful
    useOCR?: boolean; // Force OCR even if text extraction works
    ocrLanguage?: string; // OCR language (e.g., 'eng', 'eng+deu' for multi-language)
  } = {}
): Promise<PageContent[]> {
  const {
    minTextLength = 50,
    useOCR = false,
    ocrLanguage = "eng",
  } = options;

  try {
    // First, try standard text extraction
    if (!useOCR) {
      const loader = new PDFLoader(pdfPath);
      const pages = await loader.load();

      // Check if we got sufficient text
      const hasEnoughText = pages.some(
        (page: any) => page.pageContent.trim().length >= minTextLength
      );

      if (hasEnoughText) {
        console.log("Text extraction successful, using extracted text");
        return pages as PageContent[];
      }

      console.log(
        "Text extraction returned insufficient content, falling back to OCR"
      );
    }

    // Use OCR for scanned PDFs or if forced
    console.log("Starting OCR processing...");
    return await extractTextWithTesseract(pdfPath, ocrLanguage);
  } catch (error) {
    console.error("Error in extractTextWithOCR:", error);
    // If standard extraction fails, try OCR as fallback
    if (!useOCR) {
      console.log("Text extraction failed, attempting OCR fallback...");
      try {
        return await extractTextWithTesseract(pdfPath, ocrLanguage);
      } catch (ocrError) {
        console.error("OCR fallback also failed:", ocrError);
        throw new Error(
          `Both text extraction and OCR failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
    throw error;
  }
}

/**
 * Extract text from PDF using Tesseract OCR
 * Converts PDF pages to images first, then runs OCR
 */
async function extractTextWithTesseract(
  pdfPath: string,
  language: string = "eng"
): Promise<PageContent[]> {
  // Create worker - Use CDN-based approach for Next.js compatibility
  // Tesseract.js can use CDN workers which work better in server environments
  let worker;
  try {
    // Try default configuration (uses CDN workers automatically)
    worker = await createWorker(language);
    console.log("Tesseract worker created successfully with default configuration");
  } catch (error) {
    console.error("Failed to create Tesseract worker:", error);
    // Re-throw with helpful message
    throw new Error(
      `OCR initialization failed: ${error instanceof Error ? error.message : String(error)}. ` +
      `This may be due to network issues or Tesseract.js configuration. ` +
      `The system will fall back to text extraction only.`
    );
  }
  
  const pages: PageContent[] = [];

  try {
    // Load PDF document
    const pdfDocument = await pdfjsLib.getDocument({
      url: pdfPath,
      verbosity: 0, // Suppress warnings
    }).promise;

    const numPages = pdfDocument.numPages;
    console.log(`Processing ${numPages} pages with OCR...`);

    // Process each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      console.log(`OCR processing page ${pageNum}/${numPages}...`);

      // Get PDF page
      const page = await pdfDocument.getPage(pageNum);

      // Render page to canvas
      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale = better OCR accuracy
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext("2d");

      // Render PDF page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;

      // Convert canvas to image buffer
      const imageBuffer = canvas.toBuffer("image/png");

      // Run OCR on the image
      const {
        data: { text },
      } = await worker.recognize(imageBuffer);

      // Clean up the text
      const cleanedText = text
        .replace(/\s+/g, " ") // Normalize whitespace
        .replace(/\n+/g, "\n") // Normalize newlines
        .trim();

      if (cleanedText.length > 0) {
        pages.push({
          pageContent: cleanedText,
          metadata: {
            loc: {
              pageNumber: pageNum,
            },
          },
        });
        console.log(
          `Page ${pageNum}: Extracted ${cleanedText.length} characters via OCR`
        );
      } else {
        console.log(`Page ${pageNum}: No text extracted via OCR`);
      }
    }

    await worker.terminate();
    console.log(`OCR completed. Extracted text from ${pages.length} pages.`);
    return pages;
  } catch (error) {
    await worker.terminate();
    throw error;
  }
}

/**
 * Hybrid approach: Try text extraction first, use OCR for pages with insufficient text
 * OCR is optional and will gracefully fail if not available
 * Images are automatically skipped - only pages with extractable text are processed
 */
export async function extractTextHybrid(
  pdfPath: string,
  options: {
    minTextLength?: number;
    ocrLanguage?: string;
    enableOCR?: boolean; // Allow disabling OCR if it causes issues
    skipImageOnlyPages?: boolean; // Skip pages that contain only images
  } = {}
): Promise<PageContent[]> {
  const { 
    minTextLength = 50, 
    ocrLanguage = "eng", 
    enableOCR = true,
    skipImageOnlyPages = true // Default to skipping image-only pages
  } = options;

  try {
    // Try standard extraction first
    console.log("Starting hybrid extraction: attempting text extraction first...");
    console.log("Note: Images will be automatically skipped - only text content will be extracted");
    
    const loader = new PDFLoader(pdfPath, {
      // PDFLoader automatically skips images and only extracts text
      // No additional configuration needed for image skipping
    });
    
    const pages = await loader.load();
    console.log(`Text extraction loaded ${pages.length} pages`);
    
    const resultPages: PageContent[] = [];
    let pagesNeedingOCR: number[] = [];
    let skippedPages: number[] = [];

    // First pass: identify pages that need OCR or should be skipped
    for (const page of pages) {
      const pageNum = page.metadata.loc.pageNumber;
      // Clean and validate page content
      const pageContent = page.pageContent?.trim() || "";
      const textLength = pageContent.length;
      
      console.log(`Page ${pageNum}: Extracted ${textLength} characters`);

      // Skip pages with no text content (image-only pages)
      if (skipImageOnlyPages && textLength === 0) {
        skippedPages.push(pageNum);
        console.log(`Page ${pageNum}: ⏭️ Skipped (image-only page, no text content)`);
        continue;
      }

      if (textLength >= minTextLength) {
        // Use extracted text - ensure content is valid
        resultPages.push({
          pageContent: pageContent,
          metadata: {
            loc: {
              pageNumber: pageNum,
            },
          },
        } as PageContent);
        console.log(
          `Page ${pageNum}: ✅ Using extracted text (${textLength} chars)`
        );
      } else if (textLength > 0) {
        // Some text but not enough - mark for OCR if enabled
        if (enableOCR) {
          pagesNeedingOCR.push(pageNum);
          console.log(
            `Page ${pageNum}: ⚠️ Insufficient text (${textLength} chars) - will attempt OCR`
          );
        } else {
          // OCR disabled, use what we have if it's not empty
          resultPages.push({
            pageContent: pageContent,
            metadata: {
              loc: {
                pageNumber: pageNum,
              },
            },
          } as PageContent);
          console.log(`Page ${pageNum}: Using available text (${textLength} chars, OCR disabled)`);
        }
      } else {
        // Empty page - skip it
        skippedPages.push(pageNum);
        console.log(`Page ${pageNum}: ⏭️ Skipped (empty page)`);
      }
    }

    // Second pass: Process pages needing OCR (only if enabled and there are pages to process)
    if (pagesNeedingOCR.length > 0 && enableOCR) {
      console.log(`\n=== Starting OCR for ${pagesNeedingOCR.length} pages ===`);
      try {
        // Process all pages with OCR at once (more efficient)
        const ocrPages = await extractTextWithTesseract(pdfPath, ocrLanguage);
        console.log(`OCR completed, processing ${ocrPages.length} OCR pages`);
        
        // Match OCR results with pages that needed it
        for (const pageNum of pagesNeedingOCR) {
          const ocrPage = ocrPages.find(
            (p) => p.metadata.loc.pageNumber === pageNum
          );
          if (ocrPage && ocrPage.pageContent.trim().length >= minTextLength) {
            resultPages.push(ocrPage);
            console.log(
              `Page ${pageNum}: ✅ OCR extracted ${ocrPage.pageContent.length} chars`
            );
          } else {
            // OCR didn't help, find original page
            const originalPage = pages.find(
              (p: any) => p.metadata.loc.pageNumber === pageNum
            );
            if (originalPage && originalPage.pageContent.trim().length > 0) {
              // Use original text even if short (better than nothing)
              resultPages.push({
                pageContent: originalPage.pageContent.trim(),
                metadata: {
                  loc: {
                    pageNumber: pageNum,
                  },
                },
              } as PageContent);
              console.log(`Page ${pageNum}: ⚠️ OCR didn't improve, using original text (${originalPage.pageContent.trim().length} chars)`);
            } else {
              // No text found, skip this page
              skippedPages.push(pageNum);
              console.log(`Page ${pageNum}: ⏭️ Skipped (no text found via OCR or extraction)`);
            }
          }
        }
      } catch (ocrError) {
        console.error(`\n❌ OCR processing failed:`, ocrError);
        console.warn(`Falling back to original extracted text for ${pagesNeedingOCR.length} pages`);
        // Fallback: use original pages if they have any text
        for (const pageNum of pagesNeedingOCR) {
          const originalPage = pages.find(
            (p: any) => p.metadata.loc.pageNumber === pageNum
          );
          if (originalPage && originalPage.pageContent.trim().length > 0) {
            resultPages.push({
              pageContent: originalPage.pageContent.trim(),
              metadata: {
                loc: {
                  pageNumber: pageNum,
                },
              },
            } as PageContent);
          } else {
            skippedPages.push(pageNum);
            console.log(`Page ${pageNum}: ⏭️ Skipped (no text available)`);
          }
        }
      }
    } else if (pagesNeedingOCR.length > 0 && !enableOCR) {
      // OCR disabled, use original text if available
      console.log(`OCR disabled, using original text for ${pagesNeedingOCR.length} pages`);
      for (const pageNum of pagesNeedingOCR) {
        const originalPage = pages.find(
          (p: any) => p.metadata.loc.pageNumber === pageNum
        );
        if (originalPage && originalPage.pageContent.trim().length > 0) {
          resultPages.push({
            pageContent: originalPage.pageContent.trim(),
            metadata: {
              loc: {
                pageNumber: pageNum,
              },
            },
          } as PageContent);
        } else {
          skippedPages.push(pageNum);
          console.log(`Page ${pageNum}: ⏭️ Skipped (no text available)`);
        }
      }
    }

    // Sort result pages by page number
    resultPages.sort((a, b) => a.metadata.loc.pageNumber - b.metadata.loc.pageNumber);

    console.log(`\n=== Hybrid extraction complete ===`);
    console.log(`✅ Processed: ${resultPages.length} pages with text`);
    if (skippedPages.length > 0) {
      console.log(`⏭️ Skipped: ${skippedPages.length} image-only or empty pages (${skippedPages.join(", ")})`);
    }
    
    // Ensure we have at least some content
    if (resultPages.length === 0) {
      throw new Error("No text content could be extracted from the PDF. The document may contain only images or be unreadable.");
    }
    
    return resultPages;
  } catch (error) {
    console.error("Error in hybrid extraction:", error);
    // If standard extraction fails completely, try OCR as last resort (only if enabled)
    if (enableOCR) {
      try {
        console.log("Text extraction failed completely, attempting full OCR fallback...");
        const ocrPages = await extractTextWithTesseract(pdfPath, ocrLanguage);
        // Filter out empty pages
        const validOcrPages = ocrPages.filter((p: PageContent) => p.pageContent.trim().length > 0);
        console.log(`Full OCR fallback extracted ${validOcrPages.length} pages with text`);
        
        if (validOcrPages.length === 0) {
          throw new Error("No text content could be extracted from the PDF using OCR. The document may contain only images.");
        }
        
        return validOcrPages;
      } catch (ocrError) {
        console.error("OCR fallback also failed:", ocrError);
        throw new Error(
          `Both text extraction and OCR failed. Text extraction error: ${error instanceof Error ? error.message : String(error)}. OCR error: ${ocrError instanceof Error ? ocrError.message : String(ocrError)}. The PDF may contain only images or be corrupted.`
        );
      }
    } else {
      throw error;
    }
  }
}

