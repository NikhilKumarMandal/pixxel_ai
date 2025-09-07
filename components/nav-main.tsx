"use client"

import {
  Image,
  SquareTerminal,
} from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"


const NavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: SquareTerminal
  },
  {
    title: "Generate Image",
    url: "/Image-generation",
    icon: Image
  }
]

export function NavMain() {

  const pathname = usePathname()
  return (
    <SidebarGroup>
      <SidebarMenu>
        {NavItems.map((item) => (
          <Link href={item.url} key={item.title} className={cn("rounded-none",
            pathname === item.url ? "text-primary bg-primary/5" : "text-muted"
          )}>
            <SidebarMenuItem >
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && <item.icon className="text-white" />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </Link>

        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}