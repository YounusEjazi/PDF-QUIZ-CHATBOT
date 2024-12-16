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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PDFQuizCreation = ({ toggleMode }: { toggleMode: () => void }) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [topic, setTopic] = React.useState("");
  const [amount, setAmount] = React.useState(5);
  const [language, setLanguage] = React.useState("english");
  const [showLoader, setShowLoader] = React.useState(false);
  const [finishedLoading, setFinishedLoading] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false); // Dropdown state
  const { toast } = useToast();

  const { mutate: uploadPDF, isLoading } = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      formData.append("topic", topic);
      formData.append("amount", amount.toString());
      formData.append("language", language);
      const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: ({ gameId }: { gameId: string }) => {
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
    }
    setDropdownOpen(false); // Close dropdown after file selection
  };

  const handleSubmit = () => {
    if (!file || topic.trim() === "") {
      toast({
        title: "Error",
        description: "Please upload a file and fill out all fields before submitting.",
        variant: "destructive",
      });
      return;
    }
    setShowLoader(true);
    uploadPDF();
  };

  if (showLoader) {
    return <LoadingQuestions finished={finishedLoading} />;
  }

  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">PDF Quiz Creation</CardTitle>
          <CardDescription>Upload a PDF to generate a quiz.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="secondary" onClick={toggleMode} className="mb-4">
            Switch to Form Quiz Creation
          </Button>
          <div className="space-y-4">
            {/* Upload File Button with Dropdown */}
            <div className="relative">
              <Button
                variant="default"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full"
              >
                <FilePlus className="mr-2" />
                Upload File
                <ChevronUp
                  className={`ml-2 transform transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
              {dropdownOpen && (
                <div className="absolute z-10 p-4 bg-white border rounded-lg shadow-lg w-48">
                  <label className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 cursor-pointer">
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
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Link className="h-4 w-4" />
                    <span>Upload Link</span>
                  </button>
                </div>
              )}
            </div>

            {/* Topic Field */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Topic
              </label>
              <Input
                placeholder="Enter topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            {/* Number of Questions Field */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Number of Questions
              </label>
              <Input
                type="number"
                min={1}
                max={10}
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value, 10))}
              />
            </div>

            {/* Language Field */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
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

            {/* Submit Button */}
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full"
            >
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFQuizCreation;
