"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilePlus, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import LoadingQuestions from "../LoadingQuestions";
import PDFViewer from "../PDFViewer";
import { ErrorDialog, generateErrorCode, getUserFriendlyMessage } from "../ErrorDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UploadResponse {
  gameId: string;
}

const PDFQuizCreation = ({ toggleMode }: { toggleMode: () => void }) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [topic, setTopic] = React.useState("");
  const [amount, setAmount] = React.useState(5);
  const [language, setLanguage] = React.useState("english");
  const [useCustomTopic, setUseCustomTopic] = React.useState(false); // New state for topic mode
  const [showLoader, setShowLoader] = React.useState(false);
  const [finishedLoading, setFinishedLoading] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [selectedPages, setSelectedPages] = React.useState<number[]>([]);
  const [totalPages, setTotalPages] = React.useState<number>(0);
  const [errorDialogOpen, setErrorDialogOpen] = React.useState(false);
  const [errorInfo, setErrorInfo] = React.useState<{
    code: string;
    message: string;
  } | null>(null);
  const { toast } = useToast();

  const { mutate: uploadPDF, status } = useMutation<UploadResponse, Error>({
    mutationFn: async () => {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      formData.append("topic", topic);
      formData.append("amount", amount.toString());
      formData.append("language", language);
      formData.append("pages", selectedPages.join(","));
      formData.append("useCustomTopic", useCustomTopic.toString()); // Pass topic mode
      const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: ({ gameId }) => {
      setFinishedLoading(true);
      setTimeout(() => {
        window.location.href = `/play/mcq/${gameId}`;
      }, 2000);
    },
    onError: (error) => {
      setShowLoader(false);
      if (error instanceof AxiosError) {
        const apiEndpoint = "/api/upload";
        const errorCode = generateErrorCode(
          error.response?.status,
          apiEndpoint,
          error.response?.data?.error
        );
        const errorMessage = getUserFriendlyMessage(error, apiEndpoint);
        
        // Show toast notification
        toast({
          title: "Upload Failed",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Show error dialog with code
        setErrorInfo({
          code: errorCode,
          message: errorMessage,
        });
        setErrorDialogOpen(true);
      } else {
        // Fallback for non-Axios errors
        const errorCode = generateErrorCode(undefined, "/api/upload");
        setErrorInfo({
          code: errorCode,
          message: "An unexpected error occurred. Please try again.",
        });
        setErrorDialogOpen(true);
      }
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setSelectedPages([]);
    }
    setDropdownOpen(false);
  };

  const handlePageRangeInput = (input: string) => {
    setSelectedPages([]);
    if (!input.trim()) return;

    const ranges = input.split(',').map(range => range.trim());
    const newPages = new Set<number>();

    ranges.forEach(range => {
      if (!range.includes('-')) {
        const page = parseInt(range);
        if (!isNaN(page) && page > 0 && page <= totalPages) {
          newPages.add(page);
        }
        return;
      }

      const [start, end] = range.split('-').map(num => parseInt(num.trim()));
      if (!isNaN(start) && !isNaN(end) && start > 0 && end <= totalPages) {
        for (let i = start; i <= end; i++) {
          newPages.add(i);
        }
      }
    });

    const pagesArray = Array.from(newPages).sort((a, b) => a - b);

    if (pagesArray.length > 10) {
      toast({
        title: "Too many pages selected",
        description: "Please select a maximum of 10 pages.",
        variant: "destructive",
      });
      return;
    }

    setSelectedPages(pagesArray);
  };

  const handleSubmit = () => {
    if (!file || selectedPages.length === 0) {
      toast({
        title: "Error",
        description: "Please upload a file and select pages before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    // Only require topic if custom topic is enabled (user wants to specify it)
    if (useCustomTopic && topic.trim() === "") {
      toast({
        title: "Error",
        description: "Please enter a topic when 'Benutzerdefiniert' is enabled, or disable it to auto-generate topic.",
        variant: "destructive",
      });
      return;
    }
    
    setShowLoader(true);
    uploadPDF();
  };

  const handleTotalPages = (numPages: number) => {
    setTotalPages(numPages);
  };

  if (showLoader) {
    return <LoadingQuestions finished={finishedLoading} />;
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex flex-col items-center gap-6 sm:gap-8">
        {/* Upload + Config Card */}
        <Card className="w-full backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-white/20 rounded-2xl shadow-xl transition-all hover:shadow-2xl">
          <CardHeader className="space-y-1 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                  PDF Quiz Creation
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Upload a PDF to generate a quiz
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <Button 
              variant="secondary" 
              onClick={toggleMode} 
              className="w-full bg-white/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-200"
            >
              Switch to Form Quiz Creation
            </Button>

            {/* Upload File Button with Dropdown */}
            <div className="relative">
              <Button
                variant="default"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <FilePlus className="mr-2" />
                {file ? file.name : "Upload File"}
                <ChevronUp
                  className={`ml-2 transform transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </Button>
              {dropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-lg backdrop-blur-xl">
                  <label className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                    <FilePlus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-gray-700 dark:text-gray-300">Upload from PC</span>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Topic Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Topic
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="customTopic"
                    checked={useCustomTopic}
                    onChange={(e) => setUseCustomTopic(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor="customTopic"
                    className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                  >
                    Benutzerdefiniert
                  </label>
                </div>
              </div>
              <Input
                placeholder={useCustomTopic ? "Enter your custom topic" : "Topic will be generated from selected pages"}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={!useCustomTopic}
                className={`bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 focus-visible:ring-purple-500/20 transition-all duration-200 ${
                  !useCustomTopic ? "opacity-50 cursor-not-allowed" : ""
                }`}
              />
              {!useCustomTopic && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Topic will be automatically generated from the content of selected pages
                </p>
              )}
              {useCustomTopic && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enter your custom topic based on the selected pages
                </p>
              )}
            </div>

            {/* Page Range Input */}
            {file && totalPages > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Pages (e.g., 1-3, 5, 7-8)
                </label>
                <Input
                  placeholder="Enter page numbers or ranges"
                  onChange={(e) => handlePageRangeInput(e.target.value)}
                  className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 focus-visible:ring-purple-500/20 transition-all duration-200"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total pages: {totalPages}. Select up to 10 pages.
                </p>
                {selectedPages.length > 0 && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Selected pages: {selectedPages.join(", ")}
                  </p>
                )}
              </div>
            )}

            {/* Number of Questions */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Number of Questions (3-10)
              </label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                  onClick={() => setAmount(Math.max(3, amount - 1))}
                  disabled={amount <= 3}
                >
                  <span className="text-lg font-semibold">-</span>
                </Button>
                <div className="relative flex-1">
                  <Input
                    type="number"
                    min={3}
                    max={10}
                    value={amount}
                    className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 focus-visible:ring-purple-500/20 transition-all duration-200 text-center"
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value)) {
                        if (value < 3) {
                          setAmount(3);
                          toast({
                            title: "Minimum Questions",
                            description: "You must generate at least 3 questions.",
                            variant: "destructive",
                          });
                        } else if (value > 10) {
                          setAmount(10);
                          toast({
                            title: "Maximum Questions",
                            description: "You can generate up to 10 questions.",
                            variant: "destructive",
                          });
                        } else {
                          setAmount(value);
                        }
                      }
                    }}
                    readOnly
                    onKeyDown={(e) => e.preventDefault()}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                  onClick={() => setAmount(Math.min(10, amount + 1))}
                  disabled={amount >= 10}
                >
                  <span className="text-lg font-semibold">+</span>
                </Button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Generate between 3 and 10 questions from the selected pages.
              </p>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Language
              </label>
              <Select onValueChange={setLanguage} defaultValue={language}>
                <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 focus:ring-purple-500/20">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent 
                  className="bg-white dark:bg-gray-800 border-gray-200/50 dark:border-gray-700/50 z-[100]"
                  position="item-aligned"
                >
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit */}
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={status === "pending" || selectedPages.length === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              {selectedPages.length === 0 ? "Select pages to continue" : "Create Quiz"}
            </Button>
          </CardContent>
        </Card>

        {/* PDF Preview Card */}
        {file && (
          <Card className="w-full backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-white/20 rounded-2xl shadow-xl transition-all hover:shadow-2xl">
            <CardHeader className="space-y-1 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                PDF Preview
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Preview of selected pages from your PDF
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="w-full flex justify-center">
                <PDFViewer
                  file={file}
                  selectedPages={selectedPages}
                  onTotalPages={handleTotalPages}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Error Dialog */}
      {errorInfo && (
        <ErrorDialog
          open={errorDialogOpen}
          onOpenChange={setErrorDialogOpen}
          errorCode={errorInfo.code}
          errorMessage={errorInfo.message}
          apiEndpoint="/api/upload"
        />
      )}
    </div>
  );
};

export default PDFQuizCreation;
