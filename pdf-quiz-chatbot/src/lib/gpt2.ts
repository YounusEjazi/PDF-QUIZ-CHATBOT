import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface OutputFormat {
  [key: string]: string | string[] | OutputFormat;
}

export async function strict_output(
  system_prompt: string,
  user_prompt: string | string[],
  output_format: OutputFormat,
  default_category: string = "",
  output_value_only: boolean = false,
  model: string = "gpt-3.5-turbo",
  temperature: number = 1,
  num_tries: number = 3,
  verbose: boolean = false
): Promise<string> {
  for (let i = 0; i < num_tries; i++) {
    try {
      const response = await openai.chat.completions.create({
        model,
        temperature,
        messages: [
          {
            role: "system",
            content: `${system_prompt}\nOutput response that is either plain text or matches this JSON structure: ${JSON.stringify(
              output_format
            )}.`,
          },
          { role: "user", content: Array.isArray(user_prompt) ? user_prompt.join("\n") : user_prompt },
        ],
      });

      const rawResponse = response.choices[0]?.message?.content ?? "";

      if (verbose) {
        console.log("Raw GPT Response:", rawResponse);
      }

      try {
        const parsedResponse = JSON.parse(rawResponse);
        return parsedResponse.answer ?? JSON.stringify(parsedResponse);
      } catch {
        // Return raw response if JSON parsing fails
        return rawResponse;
      }
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error.message);
    }
  }

  throw new Error("Unable to generate a valid response after multiple attempts.");
}
