import { url } from "@/lib/config";
import {
  AccountError,
  AccountProfile,
  accountRequest,
  parseAccountResponse,
  profileSchema,
} from "@/lib/account";

export const maxAvatarBytes = 2 * 1024 * 1024;
export const avatarTypes = ["image/jpeg", "image/png", "image/webp"];

// Only the configured backend and GitHub's image hosts receive image requests.
export function avatarImageURL(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (/^\/avatars\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value))
    return `${url.replace(/\/$/, "")}${value}`;
  try {
    const image = new URL(value);
    if (image.protocol !== "https:" || image.username || image.password || image.port || image.hash)
      return undefined;
    if (
      image.hostname === "avatars.githubusercontent.com" ||
      (image.hostname === "github.com" && image.pathname === "/images/error/octocat_happy.gif")
    )
      return image.href;
  } catch {
    /* Invalid URLs fall back to initials. */
  }
  return undefined;
}

export function postSignInPath(user: AccountProfile) {
  return user.onboarding_completed === false && !user.avatar_url
    ? "/onboarding"
    : `/dashboard/${user.userId}`;
}

export function avatarFileError(file: File): string | undefined {
  if (!file.size || file.size > maxAvatarBytes) return "Choose a photo up to 2 MiB.";
  if (file.type && !avatarTypes.includes(file.type)) return "Choose a JPEG, PNG or WebP photo.";
}

async function avatarProfile(response: Response, action: "upload" | "remove" | "onboard") {
  const profile = await parseAccountResponse(response, profileSchema, true);
  if (
    profile.onboarding_completed !== true ||
    (action === "upload" &&
      (profile.avatar_source !== "upload" ||
        !profile.avatar_url?.startsWith("/avatars/") ||
        !avatarImageURL(profile.avatar_url))) ||
    (action === "remove" && (profile.avatar_url !== "" || profile.avatar_source !== "none"))
  )
    throw new AccountError(
      "The profile update couldn’t be confirmed. Refresh Your account before retrying.",
      response.status,
      "invalid_response",
      0,
      true
    );
  return profile;
}

export function updateAvatar(token: string, file: File | null, signal?: AbortSignal) {
  const body = file ? new FormData() : undefined;
  if (file) body!.append("avatar", file, "avatar");
  return accountRequest(
    "/api/v1/account/user/me/avatar",
    {
      method: file ? "POST" : "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      body,
      signal,
    },
    (response) => avatarProfile(response, file ? "upload" : "remove")
  );
}

export function completeOnboarding(token: string, signal?: AbortSignal) {
  if (!token) return Promise.reject(new AccountError("Sign in again to continue.", 401));
  return accountRequest(
    "/api/v1/account/user/me/onboarding",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      signal,
    },
    (response) => avatarProfile(response, "onboard")
  );
}
