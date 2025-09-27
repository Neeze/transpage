"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription, IconFileTypeDocx,
  IconFileWord,
  IconFolder,
  IconHelp, IconHome,
  IconInnerShadowTop,
  IconListDetails, IconMoneybag,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {useAuthContext} from "@/context/auth-context";

const data = {
  navList: [
    {
      title: "Trang chính",
      icon: IconHome,
      url: "/main",
    },
    {
      title: "Lịch sử dịch",
      icon: IconListDetails,
      url: "/main/history/translate",
    },
    {
      title: "Nhật ký hoạt động",
      icon: IconListDetails,
      url: "/main/history/activaty_log",
    },
  ],
  navSecondary: [
    {
      title: "Tài liệu API",
      url: "#",
      icon: IconFileAi,
    },
    {
      title: "Nạp tiền",
      url: "#",
      icon: IconMoneybag,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useAuthContext();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                {/*<IconInnerShadowTop className="!size-5" />*/}
                <span className="text-base font-semibold">Transpage.vn</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navList} />
        {/*<NavDocuments items={data.documents} />*/}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user ? user : null} />
      </SidebarFooter>
    </Sidebar>
  )
}
