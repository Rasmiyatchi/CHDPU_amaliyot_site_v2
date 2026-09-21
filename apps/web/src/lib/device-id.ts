/**
 * Qurilma identifikatori (fingerprint) — bitta-qurilma login uchun.
 * Birinchi marta yaratiladi va localStorage'da saqlanadi. Brauzer/qurilma
 * almashtirilsa yangi ID hosil bo'ladi (bu — "boshqa qurilma" deb hisoblanadi).
 */
const STORAGE_KEY = "chdpu_device_id";
const COOKIE_NAME = "chdpu_device_id";

function getCookie(name: string): string | null {
  try {
    const match = document.cookie.match(
      new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)")
    );
    return match && match[1] ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

function setCookie(name: string, value: string, days = 365) {
  try {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
  } catch {
    // ignore
  }
}

export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = getCookie(COOKIE_NAME);
    }
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
    localStorage.setItem(STORAGE_KEY, id);
    setCookie(COOKIE_NAME, id);
    return id;
  } catch {
    const cookieId = getCookie(COOKIE_NAME);
    if (cookieId) return cookieId;
    return `ephemeral-${Math.random().toString(36).slice(2)}`;
  }
}

