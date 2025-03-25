"use client";

import { useChat } from "@ai-sdk/react";
import { Textarea } from "./textarea";
import { ProjectOverview } from "./project-overview";
import { Messages } from "./messages";

export default function Chat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    error,
    status,
    stop,
  } = useChat({
    maxSteps: 4,
  });
  console.log({ messages });

  const isLoading = status === "streaming" || status === "submitted";

  if (error) return <div>{error.message}</div>;

  return (
    <div className="h-dvh flex flex-col justify-center w-full stretch">
      {/* <Header /> */}
      {messages.length === 0 ? (
        <div className="max-w-xl mx-auto w-full">
          <ProjectOverview />
        </div>
      ) : (
        <Messages messages={messages} isLoading={isLoading} status={status} />
      )}
      <form
        onSubmit={handleSubmit}
        className="pb-8 bg-white dark:bg-black w-full max-w-xl mx-auto px-4 sm:px-0"
      >
        <Textarea
          handleInputChange={handleInputChange}
          input={input}
          isLoading={isLoading}
          status={status}
          stop={stop}
        />
      </form>
    </div>
  );
}
