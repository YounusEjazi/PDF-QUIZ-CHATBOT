"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Copy, Check, X } from "lucide-react";
import { toast } from "sonner";

interface ErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorCode: string;
  errorMessage: string;
  apiEndpoint?: string;
}

export function ErrorDialog({
  open,
  onOpenChange,
  errorCode,
  errorMessage,
  apiEndpoint,
}: ErrorDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const errorInfo = `Error Code: ${errorCode}\nAPI: ${apiEndpoint || "N/A"}\nMessage: ${errorMessage}`;
      await navigator.clipboard.writeText(errorInfo);
      setCopied(true);
      toast.success("Error code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy error code");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900 border-red-200 dark:border-red-900">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Error Occurred
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400 mt-1">
                An error occurred while processing your request
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Error Code */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Error Code
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="font-mono text-lg font-bold text-red-600 dark:text-red-400">
              {errorCode}
            </div>
          </div>

          {/* Error Message */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-900/50">
            <p className="text-sm font-medium text-red-900 dark:text-red-200 mb-1">
              Error Message
            </p>
            <p className="text-sm text-red-800 dark:text-red-300">
              {errorMessage}
            </p>
          </div>

          {/* API Endpoint (if provided) */}
          {apiEndpoint && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium">API Endpoint:</span> {apiEndpoint}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              window.location.reload();
            }}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Retry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Helper function to generate user-friendly error codes
 */
export function generateErrorCode(
  statusCode: number | undefined,
  apiEndpoint: string,
  errorType?: string
): string {
  const prefix = apiEndpoint.includes("/upload") ? "UPL" : "GAM";
  const status = statusCode || 0;
  
  // Map status codes to friendly codes
  const statusMap: Record<number, string> = {
    400: "INV", // Invalid request
    401: "AUTH", // Authentication required
    403: "FORB", // Forbidden
    404: "NF", // Not found
    413: "SIZE", // File too large
    429: "RATE", // Rate limit
    500: "SRV", // Server error
    503: "UNAV", // Service unavailable
  };

  const statusCodeStr = statusMap[status] || `ERR${status}`;
  const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp
  
  return `${prefix}-${statusCodeStr}-${timestamp}`;
}

/**
 * Helper function to get user-friendly error messages
 */
export function getUserFriendlyMessage(
  error: any,
  apiEndpoint: string
): string {
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  const statusCode = error?.response?.status;
  
  switch (statusCode) {
    case 400:
      return "Invalid request. Please check your input and try again.";
    case 401:
      return "You must be logged in to perform this action. Please log in and try again.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "The requested resource was not found. Please try again.";
    case 413:
      return "The file you uploaded is too large. Please upload a smaller file.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    case 500:
      return apiEndpoint.includes("/upload")
        ? "Failed to process the uploaded file. The server encountered an error. Please try again later."
        : "Failed to create the quiz. The server encountered an error. Please try again later.";
    case 503:
      return "Service is temporarily unavailable. Please try again later.";
    default:
      return apiEndpoint.includes("/upload")
        ? "An unexpected error occurred while uploading your file. Please try again."
        : "An unexpected error occurred while creating your quiz. Please try again.";
  }
}

