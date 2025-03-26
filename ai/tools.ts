import { tool } from "ai";
import { z } from "zod";
import { Sandbox, Result, ExecutionError } from "@e2b/code-interpreter";
import resumeJsonSchema from "../data/resumes/schemas/resume.schema.json";

const templateID = "dtpa9vsgs7ggc8brb4i0";

type ToolResultTextContentItem = {
  type: "text";
  text: string;
};
type ToolResultImageContentItem = {
  type: "image";
  data: string; // base64 encoded png image, e.g. screenshot
  mimeType?: string; // e.g. 'image/png';
};

type ToolResultContentItem =
  | ToolResultTextContentItem
  | ToolResultImageContentItem;

type ToolResultContent = Array<ToolResultContentItem>;

export type E2bResult = {
  logs: {
    stdout: string;
    stderr: string;
  };
  error: ExecutionError | undefined;
  results: Result[];
  code?: string;
};

export const sandboxCodeInterpreterTool = tool({
  description:
    "Execute python code in a Jupyter notebook cell and returns any result, stdout, stderr, display_data, and error.",
  parameters: z.object({
    code: z.string().describe("The Python code to execute in a single cell"),
  }),
  execute: async ({ code }, { toolCallId, messages }): Promise<E2bResult> => {
    const combinedCode = [
      ...messages
        .filter((m) => m.role === "tool")
        .flatMap((m) => m.content)
        .flatMap((m) => m.result as ToolResultContentItem)
        .filter((r) => r.type === "text")
        .filter((r) => r.text.startsWith("code:\n"))
        .map((r) => r.text.substring("code:\n".length)),
      code,
    ].join("\n");
    console.log("[Code Interpreter Code]", { combinedCode });
    const sbx = await Sandbox.create(templateID);
    const exec = await sbx.runCode(combinedCode);
    console.log("[Code Interpreter Exec]", exec);
    // Control the length, to prevent overwhelming context window
    const result = {
      logs: {
        stdout: exec.logs.stdout.join("\n").split(" ").slice(0, 100).join(" "),
        stderr: exec.logs.stderr.join("\n").split(" ").slice(0, 100).join(" "),
      },
      error: exec.error,
      results: exec.results,
      code: !exec.error && exec.logs.stderr.length === 0 ? code : undefined,
    };
    //console.log("[Code Interpreter Result]", result);
    return result;
  },
  experimental_toToolResultContent(exec: E2bResult): ToolResultContent {
    //console.log("[Code Interpreter toToolResultContent]", exec);
    const response: ToolResultContent = [
      ...(exec.logs.stdout
        ? [
            {
              type: "text" as const,
              text: `stdout:\n${exec.logs.stdout}`.trim(),
            },
          ]
        : []),
      ...(exec.logs.stderr
        ? [
            {
              type: "text" as const,
              text: `stderr:\n${exec.logs.stderr}`.trim(),
            },
          ]
        : []),
      ...(exec.error?.traceback
        ? [
            {
              type: "text" as const,
              text: `error:\n${exec.error.traceback}`.trim(),
            },
          ]
        : []),
      ...(exec.code
        ? [{ type: "text" as const, text: `code:\n${exec.code}`.trim() }]
        : []),
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
