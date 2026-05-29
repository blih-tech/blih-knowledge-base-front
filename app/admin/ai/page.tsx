import { AdminChatInterface } from "@/components/AdminChatInterface";

export const metadata = {
  title: "Internal AI Assistant — Admin",
  description: "Admin-only AI assistant with full access to documents, clients, and knowledge base data.",
};

export default function AdminAiPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      <AdminChatInterface />
    </div>
  );
}
