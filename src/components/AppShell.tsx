import { Sidebar } from "./Sidebar";

export const AppShell = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen w-full overflow-hidden bg-background">
    <Sidebar />
    <main className="flex-1 overflow-hidden">{children}</main>
  </div>
);
