"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logoutClient } from "@/lib/auth-client";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    logoutClient();
    router.replace("/login");
  }, [router]);

  return null;
}
