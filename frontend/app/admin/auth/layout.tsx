// app/auth/layout.tsx
import type React from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative w-full min-h-screen">
            {children}
        </div>
    );
}
