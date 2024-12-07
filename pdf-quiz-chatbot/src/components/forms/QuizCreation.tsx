"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

type Props = {
  topic: string; // Props für die Komponente
};

const QuizCreationSchema = z.object({
  topic: z.string().optional(),
  amount: z.number().min(1).max(10),
  type: z.enum(["mcq", "open_ended"]),
});

type Input = z.infer<typeof QuizCreationSchema>;

const QuizCreation = ({ topic: topicParam }: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const [language, setLanguage] = useState("english");
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<Input>({
    resolver: zodResolver(QuizCreationSchema),
    defaultValues: {
      topic: topicParam,
      type: "mcq",
      amount: 3,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      form.setValue("topic", ""); // Lösche das Thema, wenn eine Datei hochgeladen wird
    }
  };

  const onSubmit = async (data: Input) => {
    if (!file && !data.topic?.trim()) {
      toast({
        title: "Error",
        description: "Please provide either a topic or upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    } else {
      formData.append("topic", data.topic ?? "");
    }

    formData.append("amount", data.amount.toString());
    formData.append("type", data.type);
    formData.append("language", language);

    try {
      const response = await axios.post(file ? "/api/quiz/upload" : "/api/game", formData, {
        headers: {
          "Content-Type": file ? "multipart/form-data" : "application/json",
        },
      });

      const { questions, gameId } = response.data;

      toast({
        title: "Success",
        description: "Quiz created successfully!",
      });

      router.push(`/play/${data.type}/${gameId}`);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create quiz. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Quiz Creation</CardTitle>
          <CardDescription>Choose a topic or upload a PDF file</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Topic Input */}
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a topic"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setFile(null); // Lösche die Datei, wenn ein Thema eingegeben wird
                        }}
                        disabled={!!file}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a topic or upload a PDF file. If a file is uploaded, this field will
                      be ignored.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PDF Upload */}
              <FormItem>
                <FormLabel>Upload PDF</FormLabel>
                <Input type="file" accept="application/pdf" onChange={handleFileChange} />
                <FormDescription>
                  Upload a PDF file to generate quiz questions. This will override the topic field.
                </FormDescription>
              </FormItem>

              {/* Number of Questions */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        min={1}
                        max={10}
                        placeholder="How many questions?"
                      />
                    </FormControl>
                    <FormDescription>Choose how many questions to generate.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quiz Language */}
              <FormItem>
                <FormLabel>Quiz Language</FormLabel>
                <Select onValueChange={setLanguage} defaultValue={language}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>

              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizCreation;
