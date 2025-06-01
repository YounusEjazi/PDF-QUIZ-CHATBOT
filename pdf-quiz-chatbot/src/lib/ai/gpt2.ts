import axios from "axios";

interface OutputFormat {
  [key: string]: string | string[] | OutputFormat;
}

export async function strict_output(
  system_prompt: string,
  user_prompt: string | string[],
  output_format: OutputFormat,
  default_category: string = "",
  output_value_only: boolean = false,
  model: string = "deepseek-chat", // Adjust model name based on DeepSeek's offerings
  temperature: number = 1,
  num_tries: number = 3,
  verbose: boolean = false
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY; // Replace with your DeepSeek API key environment variable
  if (!apiKey) {
    throw new Error("DeepSeek API key is not configured in environment variables.");
  }

  for (let i = 0; i < num_tries; i++) {
    try {
      const response = await axios.post(
        "https://api.deepseek.com/v1/chat/completions", // Adjust endpoint based on DeepSeek docs
        {
          model,
          temperature,
          messages: [
            {
              role: "system",
              content: `${system_prompt}\nOutput response that is either plain text or matches this JSON structure: ${JSON.stringify(
                output_format
              )}.`,
            },
            {
              role: "user",
              content: Array.isArray(user_prompt) ? user_prompt.join("\n") : user_prompt,
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`, // DeepSeek likely uses Bearer token authentication
          },
        }
      );

      const rawResponse = response.data.choices[0]?.message?.content ?? "";

      if (verbose) {
        console.log("Raw DeepSeek Response:", rawResponse);
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
      if (error.response) {
        console.error("DeepSeek API Error:", error.response.data);
      }
    }
  }

  throw new Error("Unable to generate a valid response from DeepSeek after multiple attempts.");
}