"use client";

import { useEffect, useState } from "react";
import type { User } from "@/types";
import { USER_COOKIE } from "@/lib/constants";

// Lee el usuario de la cookie no sensible "finzen_user" (el token está en una cookie httpOnly).
export function useUser(): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const prefix = `${USER_COOKIE}=`;
    const cookie = document.cookie
      .split("; ")
      .find((item) => item.startsWith(prefix));
    if (!cookie) return;
    try {
      const raw = decodeURIComponent(cookie.slice(prefix.length));
      setUser(JSON.parse(raw) as User);
    } catch {
      setUser(null);
    }
  }, []);

  return user;
}
