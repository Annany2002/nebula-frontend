import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AccountProfile } from "@/lib/account";
import { avatarImageURL } from "@/lib/avatars";
import { cn } from "@/lib/utils";

export default function AccountAvatar({
  user,
  className,
}: {
  user: Pick<AccountProfile, "username" | "avatar_url"> | null;
  className?: string;
}) {
  return (
    <Avatar className={cn("bg-secondary text-primary font-semibold", className)} aria-hidden="true">
      <AvatarImage src={avatarImageURL(user?.avatar_url)} alt="" referrerPolicy="no-referrer" />
      <AvatarFallback className="bg-secondary">
        {Array.from(user?.username || "?")
          .slice(0, 2)
          .join("")
          .toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
