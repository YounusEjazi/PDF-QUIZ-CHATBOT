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

  // Check if user is specifically asking for JSON
  const userMessage = Array.isArray(user_prompt) ? user_prompt.join("\n") : user_prompt;
  const isAskingForJSON = userMessage.toLowerCase().includes('json') || 
                          userMessage.toLowerCase().includes('format') ||
                          userMessage.toLowerCase().includes('structure');

  console.log('GPT2: User message:', userMessage);
  console.log('GPT2: Is asking for JSON:', isAskingForJSON);

  for (let i = 0; i < num_tries; i++) {
    try {
      let systemContent = system_prompt;
      
      if (isAskingForJSON) {
        // If user is asking for JSON, provide actual JSON content, not wrapped in answer field
        systemContent = `${system_prompt}\nThe user is asking for JSON content. Provide a valid JSON object or array that demonstrates JSON structure. Do not wrap it in an "answer" field. Return the JSON directly.`;
      } else {
        // If user is asking for regular text, just provide a helpful response
        systemContent = `${system_prompt}\nProvide a clear, helpful response in plain text. Do not use JSON format unless specifically requested.`;
      }

      const response = await axios.post(
        "https://api.deepseek.com/v1/chat/completions", // Adjust endpoint based on DeepSeek docs
        {
          model,
          temperature,
          messages: [
            {
              role: "system",
              content: systemContent,
            },
            {
              role: "user",
              content: userMessage,
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

      if (isAskingForJSON) {
        // For JSON requests, return the raw response (should be actual JSON)
        return rawResponse;
      } else {
        // For regular text requests, return the raw response
        return rawResponse;
      }
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error instanceof Error ? error.message : 'Unknown error');
      if (error && typeof error === 'object' && 'response' in error) {
        console.error("DeepSeek API Error:", (error as any).response?.data);
      }
    }
  }

  throw new Error("Unable to generate a valid response from DeepSeek after multiple attempts.");
}