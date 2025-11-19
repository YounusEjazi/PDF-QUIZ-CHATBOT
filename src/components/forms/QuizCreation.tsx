"use client";

import { quizCreationSchema } from "@/schemas/forms/quiz";
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { BookOpen, CopyCheck, RefreshCw } from "lucide-react";
import { Separator } from "../ui/separator";
import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "../../hooks/use-toast";
import { useRouter } from "next/navigation";
import { ErrorDialog, generateErrorCode, getUserFriendlyMessage } from "../ErrorDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoadingQuestions from "../LoadingQuestions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/utils";

type Props = {
  topic: string;
  toggleMode: () => void; // Add a prop for toggling modes
};

type Input = z.infer<typeof quizCreationSchema>;

const QuizCreation = ({ topic: topicParam, toggleMode }: Props) => {
  const router = useRouter();
  const [showLoader, setShowLoader] = React.useState(false);
  const [finishedLoading, setFinishedLoading] = React.useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = React.useState(false);
  const [errorInfo, setErrorInfo] = React.useState<{
    code: string;
    message: string;
  } | null>(null);
  const { toast } = useToast();
  const [language, setLanguage] = React.useState("english");
  const { mutate: getQuestions, isPending } = useMutation({
    mutationFn: async ({ amount, topic, type }: Input) => {
      const response = await axios.post("/api/game", {
        amount,
        topic,
        type,
        language,
      });
      return response.data;
    },
  });

  const form = useForm<Input>({
    resolver: zodResolver(quizCreationSchema),
    defaultValues: {
      topic: topicParam,
      type: "mcq",
      amount: 3,
    },
  });

  const onSubmit = async (data: Input) => {
    setShowLoader(true);
    getQuestions(data, {
      onError: (error) => {
        setShowLoader(false);
        if (error instanceof AxiosError) {
          const apiEndpoint = "/api/game";
          const errorCode = generateErrorCode(
            error.response?.status,
            apiEndpoint,
            error.response?.data?.error
          );
          const errorMessage = getUserFriendlyMessage(error, apiEndpoint);
          
          // Show toast notification
          toast({
            title: "Quiz Creation Failed",
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
          const errorCode = generateErrorCode(undefined, "/api/game");
          setErrorInfo({
            code: errorCode,
            message: "An unexpected error occurred. Please try again.",
          });
          setErrorDialogOpen(true);
        }
      },
      onSuccess: ({ gameId }: { gameId: string }) => {
        setFinishedLoading(true);
        setTimeout(() => {
          if (form.getValues("type") === "mcq") {
            router.push(`/play/mcq/${gameId}`);
          } else if (form.getValues("type") === "open_ended") {
            router.push(`/play/open-ended/${gameId}`);
          }
        }, 2000);
      },
    });
  };

  form.watch();

  if (showLoader) {
    return <LoadingQuestions finished={finishedLoading} />;
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card className="backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-white/20 rounded-2xl shadow-xl transition-all hover:shadow-2xl">
        <CardHeader className="space-y-1 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                Quiz Creation
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Create a custom quiz on any topic
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              onClick={toggleMode}
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
            >
              <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Switch Mode</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Topic</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter a topic" 
                        {...field}
                        className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 focus-visible:ring-purple-500/20 transition-all duration-200"
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500 dark:text-gray-400">
                      Please provide any topic you would like to be quizzed on here.
                    </FormDescription>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Number of Questions</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 shrink-0 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                          onClick={() => {
                            const newValue = Math.max(3, Number(field.value) - 1);
                            form.setValue("amount", newValue);
                          }}
                          disabled={field.value <= 3}
                        >
                          <span className="text-lg font-semibold">-</span>
                        </Button>
                        <div className="relative flex-1">
                          <Input
                            {...field}
                            type="number"
                            min={3}
                            max={10}
                            className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 focus-visible:ring-purple-500/20 transition-all duration-200 text-center"
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (!isNaN(value)) {
                                const clampedValue = Math.min(Math.max(value, 3), 10);
                                form.setValue("amount", clampedValue);
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
                          onClick={() => {
                            const newValue = Math.min(10, Number(field.value) + 1);
                            form.setValue("amount", newValue);
                          }}
                          disabled={field.value >= 10}
                        >
                          <span className="text-lg font-semibold">+</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription className="text-gray-500 dark:text-gray-400">
                      Choose between 3 and 10 questions for your quiz.
                    </FormDescription>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">Quiz Language</FormLabel>
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
                <FormDescription className="text-gray-500 dark:text-gray-400">
                  Choose the language of the quiz (English or German).
                </FormDescription>
              </FormItem>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant={form.getValues("type") === "mcq" ? "default" : "secondary"}
                  className={cn(
                    "flex-1 py-6 relative group transition-all duration-300",
                    form.getValues("type") === "mcq" 
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/25" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                  onClick={() => form.setValue("type", "mcq")}
                  type="button"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg" />
                  <CopyCheck className={cn(
                    "w-5 h-5 mr-2",
                    form.getValues("type") === "mcq" ? "text-white" : "text-gray-600 dark:text-gray-400"
                  )} />
                  <span className={form.getValues("type") === "mcq" ? "text-white" : ""}>
                    Multiple Choice
                  </span>
                </Button>
                <Button
                  variant={form.getValues("type") === "open_ended" ? "default" : "secondary"}
                  className={cn(
                    "flex-1 py-6 relative group transition-all duration-300",
                    form.getValues("type") === "open_ended" 
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/25" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                  onClick={() => form.setValue("type", "open_ended")}
                  type="button"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg" />
                  <BookOpen className={cn(
                    "w-5 h-5 mr-2",
                    form.getValues("type") === "open_ended" ? "text-white" : "text-gray-600 dark:text-gray-400"
                  )} />
                  <span className={form.getValues("type") === "open_ended" ? "text-white" : ""}>
                    Fill in the Blank
                  </span>
                </Button>
              </div>

              <Button 
                disabled={isPending} 
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                {isPending ? "Creating Quiz..." : "Create Quiz"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Error Dialog */}
      {errorInfo && (
        <ErrorDialog
          open={errorDialogOpen}
          onOpenChange={setErrorDialogOpen}
          errorCode={errorInfo.code}
          errorMessage={errorInfo.message}
          apiEndpoint="/api/game"
        />
      )}
    </div>
  );
};

export default QuizCreation;
