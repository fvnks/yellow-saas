import { SidebarProvider } from "@/components/ui/sidebar";
import { VeterinarySidebar } from "@/app/veterinaria/components/sidebar/app-veterinary-sidebar";
import VeterinarySidebarBreadcrumbs from "./components/sidebar/veterinary-sidebar-breadcrumbs";

export default function VeterinaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#F8FAFC]">
        <VeterinarySidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <VeterinarySidebarBreadcrumbs />
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
