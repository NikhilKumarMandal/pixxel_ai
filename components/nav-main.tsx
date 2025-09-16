"use client"

import {
  Image,
  LayoutGrid,
  RefreshCcw,
  Sparkle,
  Wallet,
  Wand2,
} from "lucide-react"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const NavItems = [
  {
    title: "Generate Image",
    url: "/generator",
    icon: Image
  },
  {
    title: "Edit Image",
    url: "edit-image",
    icon: Sparkle
  },
  {
    title: "Remove Background",
    url: "/remove-background",
    icon: Wand2
  },
  {
    title: "Upscale Image",
    url: "/upscale-images",
    icon: RefreshCcw
  },
  {
    title: "Gallery",
    url: "/gallery",
    icon: LayoutGrid
  },
  {
    title: "billing",
    url: "/billing",
    icon: Wallet
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