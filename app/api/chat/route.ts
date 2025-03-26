import { promises as fs } from "fs";
import path from "path";
import { anthropic } from "@ai-sdk/anthropic";
import { sandboxCodeInterpreterTool } from "@/ai/tools";
import { streamText, type UIMessage } from "ai";

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

const pydanticModels = await fs.readFile(
  path.resolve(process.cwd() + "/src/resume_demo/models.py"),
  "utf8",
);

const SYSTEM_PROMPT = `
## your job & context
You are a data scientist assisting the HR recruiting team with some resume analysis.

## Guidelines for responses

- Be concise and clear in your responses.
- Don't answer any questions that were not asked directly.
- Suggest follow-up questions to the user.

## Guidelines for using tools

- Run as few tools as possible to achieve the task.
- Do not refine your work with additional tool calls.
- Don't rerun a tool to do slight variations of the same task, let the user prompt with follow ups.
- Don't proactively run tools for related tasks, although you can provide suggestions in your final response.

## Guidelines for code

- the python code runs in jupyter notebook.
- every time you call \`analyzeData\` tool, the python code is executed in a separate cell. it's okay to multiple calls to \`analyzeData\`.
- all previous cells are available in global scope, you do not need to run them again.
- display visualizations using matplotlib or any other visualization library directly in the notebook. don't worry about saving the visualizations to a file.
- you can install any pip package (if it exists) if you need to but the usual packages for data analysis are already preinstalled.
- you can run any python code you want, everything is running in a secure sandbox environment.
- think ahead about how any visualizations will look, and make sure that an appropriate amount of information is presented to the user.
- provide a plot with your answer if possible

## Pydantic V2 BaseModels

${pydanticModels}
\`\`\`
`;

console.log("SYSTEM_PROMPT", SYSTEM_PROMPT);

function errorHandler(error: unknown) {
  if (error == null) {
    return "unknown error";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const initialMessage = {
    id: "1",
    role: "assistant" as const,
    content: "Load the resumes:",
    parts: [
      {
        type: "tool-invocation" as const,
        toolInvocation: {
          toolName: "analyzeData",
          toolCallId: "1",
          state: "result" as const,
          step: 0,
          args: {
            code:
              "from resume_demo.dataloader import load_resumes\n" +
              "resumes = load_resumes()\n" +
              'print(f"Number of resumes: {len(resumes)}")\n',
          },
          result: {
            logs: {
              stdout: "Number of resumes: 500\n",
              stderr: "",
            },
            error: undefined,
            results: [],
            code:
              "from resume_demo.dataloader import load_resumes\n" +
              "resumes = load_resumes()\n" +
              'print(f"Number of resumes: {len(resumes)}")\n',
          },
        },
      },
    ],
  };
  messages.splice(1, 0, initialMessage);
  //console.log(
  //  "message-parts",
  //  messages
  //    .filter((m) => m?.parts.length > 0)
  //    .flatMap((m) => m.parts)
  //    .filter((p) => p.type === "tool-invocation")
  //    .map((p) => p.toolInvocation),
  //);

  const result = streamText({
    model: anthropic("claude-3-7-sonnet-20250219"),
    system: SYSTEM_PROMPT,
    messages,
    tools: {
      analyzeData: sandboxCodeInterpreterTool,
    },
    experimental_telemetry: {
      isEnabled: true,
    },
    //providerOptions: {
    //  anthropic: {
    //    thinking: { type: "enabled", budgetTokens: 12000 },
    //  },
    //},
  });

  return result.toDataStreamResponse({
    sendReasoning: true,
    getErrorMessage: errorHandler,
  });
}
