"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export interface User {
    id: number
    username: string
    email: string
    role: string
    points: number
    provider: string
    avatarUrl: string
    createdAt: string
}


export function useAuth(pollingInterval = 30000) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<User | null>(null)

    const fetchUser = async () => {
        const token = localStorage.getItem("token")
        if (!token) {
            toast.error("Phiên của bạn đã hết hạn. Vui lòng đăng nhập lại.")
            router.replace("/auth")
            return
        }

        try {
            const res = await fetch(
                process.env.NEXT_PUBLIC_BACKEND_URL + "/api/info",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (res.ok) {
                const data = await res.json()
                setUser(data.data)
            } else {
                localStorage.removeItem("token")
                toast.error("Phiên không hợp lệ. Vui lòng đăng nhập lại.")
                router.replace("/auth")
            }
        } catch {
            localStorage.removeItem("token")
            toast.error("Không thể kết nối máy chủ. Vui lòng đăng nhập lại.")
            router.replace("/auth")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUser() // gọi lần đầu

        // Polling interval
        const interval = setInterval(() => {
            fetchUser()
        }, pollingInterval)

        return () => clearInterval(interval)
    }, [router, pollingInterval])

    return { user, loading, refetch: fetchUser }
}
