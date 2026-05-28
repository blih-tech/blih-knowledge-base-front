import { Header } from "@/components/Header";
import { ChatInterface } from "@/components/ChatInterface";

export const metadata = {
  title: "Ask AI — Blih Brain",
  description: "AI assistant powered by the Blih Brain knowledge base. Ask anything.",
};

export default function AskAiPage() {
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Header showNav />
      {/* Full-height chat below header */}
      <div className="flex-1 min-h-0">
        <div className="h-full max-w-3xl mx-auto w-full">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
