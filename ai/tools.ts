import { tool } from "ai";
import { z } from "zod";
import {
  OutputMessage,
  Sandbox,
  Execution,
  Result,
  ExecutionError,
} from "@e2b/code-interpreter";
import resumeJsonSchema from "../data/resumes/schemas/resume.schema.json";

const templateID = "dtpa9vsgs7ggc8brb4i0";

type ToolResultContent = Array<
  | {
      type: "text";
      text: string;
    }
  | {
      type: "image";
      data: string; // base64 encoded png image, e.g. screenshot
      mimeType?: string; // e.g. 'image/png';
    }
>;

export type E2bResult = {
  logs: {
    stdout: string;
    stderr: string;
  };
  error: ExecutionError | undefined;
  results: Result[];
};

export const sandboxCodeInterpreterTool = tool({
  description:
    "Execute python code in a Jupyter notebook cell and returns any result, stdout, stderr, display_data, and error.",
  parameters: z.object({
    code: z.string().describe("The Python code to execute in a single cell"),
  }),
  execute: async ({ code }): Promise<E2bResult> => {
    console.log("[Code Interpreter]", code);
    const sbx = await Sandbox.create(templateID);
    const exec = await sbx.runCode(code);
    // Control the length, to prevent overwhelming context window
    const result = {
      logs: {
        stdout: exec.logs.stdout.join("\n").split(" ").slice(0, 100).join(" "),
        stderr: exec.logs.stderr.join("\n").split(" ").slice(0, 100).join(" "),
      },
      error: exec.error,
      results: exec.results,
    };
    console.log("[Code Interpreter Result]", result);
    return result;
  },
  experimental_toToolResultContent(exec: E2bResult): ToolResultContent {
    const response: ToolResultContent = [
      { type: "text", text: `stdout:\n${exec.logs.stdout}` },
      { type: "text", text: `stderr:\n${exec.logs.stderr}` },
      { type: "text", text: `error:\n${exec.error}` },
      ...exec.results
        .filter((result) => result?.png)
        .map((result) => ({
          type: "image" as const,
          data: result.png!,
          mimeType: "image/png",
        })),
    ];
    return response;
  },
});

export const loadResumeJsonSchemaTool = tool({
  description: "Load the JSON schema for a resume.",
  parameters: z.object({}),
  execute: async () => {
    return resumeJsonSchema;
  },
});
