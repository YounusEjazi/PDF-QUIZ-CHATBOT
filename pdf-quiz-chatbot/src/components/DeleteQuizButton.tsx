"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type DeleteQuizButtonProps = {
  gameId: string;
  gameTopic: string;
};

export default function DeleteQuizButton({
  gameId,
  gameTopic,
}: DeleteQuizButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    console.log("Delete button clicked, gameId:", gameId);
    setIsDeleting(true);
    try {
      console.log("Sending DELETE request to /api/game/" + gameId);
      const response = await axios.delete(`/api/game/${gameId}`);
      console.log("Delete response:", response);
      toast.success("Quiz deleted successfully");
      setOpen(false);
      // Refresh the page to update the list
      router.refresh();
    } catch (error: unknown) {
      console.error("Error deleting quiz:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        const errorMessage =
          error.response?.data?.error ||
          "Failed to delete quiz. Please try again.";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 transition-colors"
          onClick={(e: React.MouseEvent) => {
            // Prevent navigation if clicking on the delete button (stop parent link)
            e.stopPropagation();
            console.log("Delete button clicked, opening dialog for gameId:", gameId);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Quiz</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the quiz &quot;{gameTopic}&quot;?
            This action cannot be undone and will permanently remove the quiz
            and all its questions.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

