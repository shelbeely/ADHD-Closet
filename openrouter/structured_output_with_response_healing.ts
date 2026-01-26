import { OpenRouter } from "@openrouter/sdk";

const client = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

export async function callStructuredOutput(schema, messages) {
  return client.chat.send({
    model: process.env.OPENROUTER_TEXT_MODEL,
    stream: false,
    responseFormat: {
      type: "json_schema",
      jsonSchema: {
        name: "structured_call",
        strict: true,
        schema
      }
    },
    plugins: [{ id: "response-healing" }],
    messages
  });
}