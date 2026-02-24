// app/(protected)/layout.tsx
import "./protected.css";
import "./pages.css";
import ProtectedShell from "./protected-shell";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
