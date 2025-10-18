import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {Coins, Wallet} from "lucide-react"
import {useAuthContext} from "@/context/auth-context";
import {IconCoin, IconCoinPound, IconFireHydrant, IconLighter, IconPoint} from "@tabler/icons-react";

export function SiteHeader() {
  const { user, loading } = useAuthContext()

  return (
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
          />
          {/* Số dư thay cho chữ "Trang Chính" */}
          <div className="flex items-center gap-2 text-base font-medium text-blue-600">
            Số dư: {user?.points ? user?.points?.toLocaleString("vi-VN") : '0'} ⚡
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* chỗ này giữ trống để thêm action sau */}
          </div>
        </div>
      </header>
  )
}
