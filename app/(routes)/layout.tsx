import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider className="bg-[#141414]">
            <AppSidebar />
            <SidebarInset className="bg-[#1a1a1a] text-white">
                <div className="w-fit flex items-center gap-2 px-4 my-4">
                    <SidebarTrigger className="-ml-1 " />
                </div>
                <main className="flex flex-1 flex-col gap-4 p-4 pt-0 ">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}