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
import { FilePlus, ChevronUp, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import LoadingQuestions from "../LoadingQuestions";
import PDFViewer from "../PDFViewer";
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
  const [showLoader, setShowLoader] = React.useState(false);
  const [finishedLoading, setFinishedLoading] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [selectedPages, setSelectedPages] = React.useState<number[]>([]);
  const [totalPages, setTotalPages] = React.useState<number>(0);
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
        const errorMessage =
          error.response?.data?.error || "Something went wrong. Please try again.";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
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
    if (!file || topic.trim() === "" || selectedPages.length === 0) {
      toast({
        title: "Error",
        description: "Please upload a file, select pages, and fill out all fields before submitting.",
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
    <div className="w-full max-w-4xl px-4 pb-40 mx-auto">
      <div className="flex flex-col items-center gap-y-10">
        {/* Upload + Config Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">PDF Quiz Creation</CardTitle>
            <CardDescription>Upload a PDF to generate a quiz.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button variant="secondary" onClick={toggleMode} className="w-full">
                Switch to Form Quiz Creation
              </Button>

              {/* Upload File Button with Dropdown */}
              <div className="relative">
                <Button
                  variant="default"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full"
                >
                  <FilePlus className="mr-2" />
                  {file ? file.name : "Upload File"}
                  <ChevronUp
                    className={`ml-2 transform transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </Button>
                {dropdownOpen && (
                  <div className="absolute z-10 p-4 bg-white dark:bg-gray-800 border rounded-lg shadow-lg w-48">
                    <label className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 cursor-pointer">
                      <FilePlus className="h-4 w-4" />
                      <span>Upload from PC</span>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                    <button
                      onClick={() => alert("External Link Upload Coming Soon!")}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <Link className="h-4 w-4" />
                      <span>Upload Link</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Topic Field */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Topic
                </label>
                <Input
                  placeholder="Enter topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              {/* Page Range Input */}
              {file && totalPages > 0 && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    Select Pages (e.g., 1-3, 5, 7-8)
                  </label>
                  <Input
                    placeholder="Enter page numbers or ranges"
                    onChange={(e) => handlePageRangeInput(e.target.value)}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Total pages: {totalPages}. Select up to 10 pages.
                  </p>
                  {selectedPages.length > 0 && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                      Selected pages: {selectedPages.join(", ")}
                    </p>
                  )}
                </div>
              )}

              {/* Number of Questions */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Number of Questions (3-10)
                </label>
                <Input
                  type="number"
                  min={3}
                  max={10}
                  value={amount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
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
                />
                <p className="mt-1 text-sm text-gray-500">
                  Generate between 3 and 10 questions from the selected pages.
                </p>
              </div>

              {/* Language */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Language
                </label>
                <Select onValueChange={setLanguage} defaultValue={language}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
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
                className="w-full"
              >
                {selectedPages.length === 0 ? "Select pages to continue" : "Submit"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* PDF Preview Card */}
        {file && (
          <Card className="w-full max-w-4xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold">PDF Preview</CardTitle>
              <CardDescription>Preview of selected pages from your PDF</CardDescription>
            </CardHeader>
            <CardContent className="p-2">
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
    </div>
  );
};

export default PDFQuizCreation;
