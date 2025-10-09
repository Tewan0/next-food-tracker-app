// In app/lib/supabase/utils.ts
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import type { CookieOptions } from "@supabase/ssr";

export function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions,
) {
  const stringValue =
    typeof value === "object" ? "j:" + JSON.stringify(value) : String(value);

  const newOptions = { ...options };

  if (newOptions.maxAge) {
    newOptions.expires = new Date(Date.now() + newOptions.maxAge);
    newOptions.maxAge /= 1000;
  }

  // Add the SameSite attribute
  if (!newOptions.sameSite) {
    newOptions.sameSite = 'lax';
  }

  const parts = [
    `${name}=${stringValue}`,
    newOptions.path && `Path=${newOptions.path}`,
    newOptions.domain && `Domain=${newOptions.domain}`,
    newOptions.maxAge && `Max-Age=${newOptions.maxAge}`,
    newOptions.expires && `Expires=${newOptions.expires.toUTCString()}`,
    newOptions.secure && 'Secure',
    newOptions.httpOnly && 'HttpOnly',
    newOptions.sameSite && `SameSite=${newOptions.sameSite}`,
  ];

  return parts.filter(Boolean).join('; ');
}

export function parseCookie(str: string): Record<string, string> {
    if (!str) return {};
    return str
        .split(";")
        .map((v) => v.split("="))
        .reduce(
            (acc, v) => {
                const key = decodeURIComponent(v[0]?.trim() ?? "");
                const value = decodeURIComponent(v[1]?.trim() ?? "");
                if (key) acc[key] = value;
                return acc;
            },
            {} as Record<string, string>,
        );
}