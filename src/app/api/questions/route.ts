import { strict_output } from "@/lib/ai/gpt";
import { getAuthSession } from "@/lib/auth/nextauth";
import { getQuestionsSchema } from "@/schemas/questions";
import { NextResponse } from "next/server";
import { ZodError, z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60; // Hobby plan limit

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    // Uncomment to enforce auth
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: "You must be logged in to create a game." },
    //     { status: 401 }
    //   );
    // }

    const body = await req.json();

    // Extend schema to include 'language'
    const schemaWithLanguage = getQuestionsSchema.extend({
      language: z.enum(["english", "german"]),
    });

    const { amount, topic, type, language } = schemaWithLanguage.parse(body);

    // Ensure amount is between 3 and 10
    const safeAmount = Math.min(Math.max(amount, 3), 10);

    let questions: any;

    if (type === "open_ended") {
      // Language specific instructions
      const instructions = {
        english: {
          blankFormat: "5 underscores (_____)",
          example: [
            { question: "The capital of France is _____.", answer: "Paris" },
            { question: "The largest planet in our solar system is _____.", answer: "Jupiter" }
          ]
        },
        german: {
          blankFormat: "5 Unterstriche (_____)",
          example: [
            { question: "Die Hauptstadt von Deutschland ist _____.", answer: "Berlin" },
            { question: "Der höchste Berg Deutschlands ist der _____.", answer: "Zugspitze" }
          ]
        }
      };

      const langInst = instructions[language];
      
      const prompt = `You are a helpful AI that generates fill-in-the-blank questions in ${language}. 
      ${language === "german" ? "Generiere die Fragen und Antworten auf Deutsch." : ""}

      Follow these rules strictly:
        1. Create exactly ${safeAmount} natural, educational fill-in-the-blank questions about ${topic}.
        2. Each question MUST be a complete sentence with EXACTLY ONE blank marked as _____ (${langInst.blankFormat}).
        3. The blank MUST replace a SINGLE key term that is:
           - A noun, proper name, or specific technical term
           ${language === "german" ? "- Ein Substantiv, Eigenname oder Fachbegriff" : ""}
           - Important to understanding ${topic}
           - Clear and unambiguous
           - Between 1-3 words maximum
        4. The answer MUST be EXACTLY what was replaced with the blank.
           ${language === "german" ? "- Bei Substantiven den Artikel NICHT in die Antwort einbeziehen" : ""}
        5. Each sentence must provide enough context to determine the answer.
        6. Questions must be diverse and cover different aspects of ${topic}.
        7. DO NOT create questions that:
           - Have multiple blanks
           - Replace articles or prepositions ${language === "german" ? "(der/die/das/ein/eine)" : "(a/an/the)"}
           - Are ambiguous or could have multiple valid answers
           - Require external knowledge not in the sentence
        8. EVERY question MUST use exactly 5 underscores (_____) for the blank.
        9. Return ONLY a JSON array with exactly ${safeAmount} question objects.
        10. Each object MUST have this exact format:
            {"question": "Text with exactly one _____ blank", "answer": "exact answer"}

        Example format:
        ${JSON.stringify(langInst.example, null, 2)}`;

      questions = await strict_output(
        prompt,
        new Array(safeAmount).fill(
          `Generate a fill-in-the-blank question about ${topic} in ${language} with exactly one _____ blank.`
        ),
        {
          question: `complete sentence with exactly one _____ blank in ${language}`,
          answer: `exact answer for the blank in ${language}`
        }
      );

      // Validate and fix questions format
      if (typeof questions === 'string') {
        try {
          questions = questions.trim();
          if (!questions.startsWith('[')) {
            questions = `[${questions}]`;
          }
          questions = JSON.parse(questions);
        } catch (error) {
          console.error("Failed to parse questions:", error);
          throw new Error(`Failed to generate valid ${language} questions`);
        }
      }

      // Ensure each question has exactly one _____ placeholder
      questions = questions.map((q: any, index: number) => {
        let question = q.question.trim();
        const answer = q.answer.trim();

        // Count occurrences of _____
        const blankCount = (question.match(/_____/g) || []).length;

        if (blankCount === 0) {
          // If no blank, create one with the answer
          const words = question.split(' ');
          const answerIndex = words.findIndex((w: string) => 
            w.toLowerCase().includes(answer.toLowerCase())
          );
          if (answerIndex !== -1) {
            words[answerIndex] = '_____';
            question = words.join(' ');
          } else {
            throw new Error(`Question ${index + 1} cannot be automatically fixed: ${question}`);
          }
        } else if (blankCount > 1) {
          // If multiple blanks, keep only the first one
          question = question.replace(/_{5}/g, (match: string, offset: number) => 
            offset === question.indexOf('_____') ? match : answer
          );
        }

        // For German, ensure the answer doesn't include articles unless they're part of a proper noun
        if (language === "german" && !answer.includes(" ")) {
          const articles = ["der", "die", "das", "den", "dem", "des", "ein", "eine", "einer", "eines"];
          const words = answer.split(" ");
          if (articles.includes(words[0].toLowerCase())) {
            words.shift(); // Remove the article
          }
          return { question, answer: words.join(" ") };
        }

        return { question, answer };
      });

      // Final validation
      if (!Array.isArray(questions) || questions.length !== safeAmount) {
        throw new Error(`Expected ${safeAmount} questions but got ${Array.isArray(questions) ? questions.length : 0}`);
      }

      questions.forEach((q: { question: string; answer: string; options: string }, i: number) => {
        if (!q.question.includes('_____')) {
          throw new Error(`Question ${i + 1} is missing the blank placeholder`);
        }
        if ((q.question.match(/_____/g) || []).length !== 1) {
          throw new Error(`Question ${i + 1} has incorrect number of blanks`);
        }
      });
    } else if (type === "mcq") {
      const mcqPrompt = `You are a helpful AI that generates MCQ questions in ${language}.
        ${language === "german" ? "Generiere die Fragen und Antworten auf Deutsch." : ""}
        Follow these rules strictly:
        1. Create exactly ${safeAmount} multiple choice questions about ${topic}
        2. Each question must be clear and concise (max 150 characters)
        3. Each answer and option must be short (max 50 characters)
        4. Format each question as a proper JSON object with this EXACT structure:
           {
             "question": "the question text",
             "answer": "the correct answer",
             "option1": "first incorrect option",
             "option2": "second incorrect option",
             "option3": "third incorrect option"
           }
        5. Return a valid JSON array of these objects
        6. Each question should test understanding of ${topic}
        7. Make sure all options are plausible but only one is correct
        8. DO NOT include any explanations or text outside the JSON array
        9. Avoid using special characters or quotes within the text - rephrase if needed`;

      questions = await strict_output(
        mcqPrompt,
        new Array(safeAmount).fill(
          `Generate a concise MCQ question about ${topic} in ${language}.`
        ),
        {
          question: "question text (max 150 chars)",
          answer: "correct answer (max 50 chars)",
          option1: "first incorrect option (max 50 chars)",
          option2: "second incorrect option (max 50 chars)",
          option3: "third incorrect option (max 50 chars)"
        }
      );

      // Clean and validate MCQ questions
      if (typeof questions === 'string') {
        try {
          // Pre-process the string to ensure proper JSON format
          const cleanedString = questions
            .replace(/[\u201C\u201D]/g, '"') // Replace curly quotes with straight quotes
            .replace(/[\u2018\u2019]/g, "'") // Replace curly single quotes with straight single quotes
            .replace(/\\/g, '') // Remove escape characters
            .trim();
          
          console.log("Raw questions string:", cleanedString);
          questions = JSON.parse(cleanedString);
          console.log("Parsed questions:", questions);
        } catch (error) {
          console.error("Failed to parse MCQ questions:", error);
          console.error("Raw questions string:", questions);
          throw new Error("Failed to generate valid MCQ questions");
        }
      }

      // Process and validate each question
      console.log("Processing questions:", questions);
      questions = questions.map((q: any, index: number) => {
        // Basic cleaning of text
        const question = q.question?.trim() || '';
        const answer = q.answer?.trim() || '';
        const option1 = q.option1?.trim() || '';
        const option2 = q.option2?.trim() || '';
        const option3 = q.option3?.trim() || '';

        console.log(`Question ${index + 1}:`, { question, answer, option1, option2, option3 });

        return {
          question: question,
          answer: answer,
          option1: option1,
          option2: option2,
          option3: option3
        };
      });

      // Simple validation for MCQ
      console.log("Before filtering:", questions.length, "questions");
      questions = questions.filter((q: { 
        question: string; 
        answer: string; 
        option1: string;
        option2: string;
        option3: string;
      }) => {
        const isValid = q.question && q.answer && q.option1 && q.option2 && q.option3;
        if (!isValid) {
          console.log("Filtered out question:", q);
        }
        return isValid;
      });
      console.log("After filtering:", questions.length, "questions");

      // If all questions were filtered out, create fallback questions
      if (questions.length === 0) {
        console.log("All questions filtered out, creating fallback questions");
        questions = Array.from({ length: safeAmount }, (_, i) => ({
          question: `Sample question ${i + 1} about ${topic}?`,
          answer: `Correct answer ${i + 1}`,
          option1: `Wrong option 1 for question ${i + 1}`,
          option2: `Wrong option 2 for question ${i + 1}`,
          option3: `Wrong option 3 for question ${i + 1}`
        }));
      }
    }

    if (questions.length === 0) {
      throw new Error("No valid questions generated");
    }

    console.log(`Generated ${type} questions:`, questions);

    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    console.error("Question generation error:", error);
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// Helper function to clean text for JSON
function cleanText(text: string): string {
  if (!text) return '';
  return text
    .trim()
    // Replace curly quotes with straight quotes
    .replace(/[""]/g, "'")
    // Replace double quotes with single quotes
    .replace(/"/g, "'")
    // Remove any other potentially problematic characters
    .replace(/[\n\r\t]/g, ' ')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Escape any remaining special characters
    .replace(/[\\]/g, '\\\\');
}

// Helper function to ensure valid JSON string
function sanitizeJsonString(str: string): string {
  if (typeof str !== 'string') return str;
  return str
    // First, escape existing backslashes
    .replace(/\\/g, '\\\\')
    // Replace curly quotes with straight single quotes
    .replace(/[""]/g, "'")
    // Replace straight double quotes with escaped double quotes
    .replace(/"/g, '\\"')
    // Replace single quotes that should be double quotes for JSON
    .replace(/^'|'$/g, '"')
    .replace(/(?<=\{)'|'(?=\})/g, '"')
    .replace(/(?<=: )'|'(?=,)/g, '"')
    .replace(/(?<=\[)'|'(?=\])/g, '"');
}
