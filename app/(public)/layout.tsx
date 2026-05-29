import { Header } from "@/components/Header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="print:hidden">
        <Header showNav />
      </div>
      {/* Spacer to offset the fixed header height */}
      <div className="h-16 print:hidden" />
      {children}
    </>
  );
}
