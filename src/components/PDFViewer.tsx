"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  file: File | null;
  selectedPages: number[];
  onTotalPages: (numPages: number) => void;
}

const PDFViewer = ({ file, selectedPages, onTotalPages }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const pdfOptions = useMemo(() => ({
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
  }), []);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  useEffect(() => {
    setCurrentPageIndex(0);
  }, [selectedPages]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    onTotalPages(numPages);
    setLoading(false);
  }

  const changePage = (offset: number) => {
    setCurrentPageIndex(prevIndex => {
      const newIndex = prevIndex + offset;
      return newIndex >= 0 && newIndex < selectedPages.length ? newIndex : prevIndex;
    });
  };

  if (!fileUrl) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]">
        <p className="text-gray-500 dark:text-gray-400">No PDF file selected</p>
      </Card>
    );
  }

  const currentPage = selectedPages[currentPageIndex];

  return (
    <Card className="w-full h-[400px] bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A] p-4 overflow-auto">
      <div className="flex flex-col items-center h-full">
        <div className="relative w-full flex justify-center flex-1">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            options={pdfOptions}
            loading={
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600 dark:text-purple-400" />
              </div>
            }
            error={
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-red-500">Error loading PDF file!</p>
              </div>
            }
          >
            {selectedPages.length > 0 ? (
              <Page
                pageNumber={currentPage}
                loading={
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600 dark:text-purple-400" />
                  </div>
                }
                className={cn(
                  "w-full h-auto object-contain",
                  loading ? "opacity-0" : "opacity-100 transition-opacity duration-200"
                )}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={350}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Please select pages to preview
              </div>
            )}
          </Document>

          {!loading && selectedPages.length > 0 && (
            <div className="absolute left-0 right-0 bottom-4 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => changePage(-1)}
                disabled={currentPageIndex <= 0}
                className="bg-white/80 dark:bg-[#2A2A2A]/80 backdrop-blur"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="px-4 py-2 text-sm bg-white/80 dark:bg-[#2A2A2A]/80 backdrop-blur rounded-md">
                Page {currentPageIndex + 1} of {selectedPages.length}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => changePage(1)}
                disabled={currentPageIndex >= selectedPages.length - 1}
                className="bg-white/80 dark:bg-[#2A2A2A]/80 backdrop-blur"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PDFViewer;
