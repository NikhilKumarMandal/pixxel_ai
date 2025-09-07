"use client";
import * as React from "react"
import {
  Sparkles,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"

import { NavUser } from "./nav-user"
import { useUser, RedirectToSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation";


export  function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const { isSignedIn, user: userData } = useUser();
  
  React.useEffect(() => {
    if (!isSignedIn) {
      RedirectToSignIn;
    }
  }, [isSignedIn]);

  if (!isSignedIn) return null;


  const user:any = {
    name: userData?.fullName,
    email: userData?.primaryEmailAddress?.emailAddress
  }


  return (
    <Sidebar collapsible="icon" {...props} className="bg-[#141414]">
      <SidebarHeader className="bg-[#141414] text-white">
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="bg-[#141414] text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <Sparkles className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">Pixxel Ai</span>
            <span className="truncate text-xs">Pro</span>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent className="bg-[#141414] text-white">
        <NavMain />
      </SidebarContent>
      <SidebarFooter className="bg-[#141414] text-white">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}