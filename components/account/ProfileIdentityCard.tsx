import Image from "next/image";
import Link from "next/link";
import { isProfileComplete } from "@/lib/validators";
import type { UserProfile } from "./types";

interface ProfileIdentityCardProps {
  profile: UserProfile;
  onCreateProfile?: () => void;
}

function AvatarPlaceholder({ name }: { name: string | null }) {
  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="flex size-full items-center justify-center rounded-full bg-surface-neutral text-text-primary text-xl font-bold leading-none select-none">
      <span>{initials}</span>
    </div>
  );
}

export default function ProfileIdentityCard({ profile, onCreateProfile }: ProfileIdentityCardProps) {
  const hasCompleteProfile = isProfileComplete(profile);

  return (
    <div className="relative flex items-start justify-between gap-2.5 sm:gap-3 p-[16px] rounded-[12px] border border-border-strong bg-white w-full shadow-2xs">
      <div className="flex gap-[12px] sm:gap-[16px] items-center min-w-0 flex-1">
        <div className="shrink-0 border-2 border-primary-orange rounded-full overflow-hidden size-[58px] sm:size-[64px] flex items-center justify-center">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.fullName ?? "Profile"}
              width={64}
              height={64}
              className="size-full object-cover"
              unoptimized
            />
          ) : (
            <AvatarPlaceholder name={profile.fullName} />
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-[3px] leading-normal">
          <h1 className="text-[17px] sm:text-[18px] font-bold text-text-primary truncate">
            {profile.fullName ? `Hi, ${profile.fullName}` : "Hi, User"}
          </h1>
          <div className="flex flex-col gap-[1px] text-[12px] text-text-secondary">
            {profile.email ? (
              <p className="truncate font-normal">{profile.email}</p>
            ) : (
              <p className="truncate italic text-text-muted">No email provided</p>
            )}
            {profile.phone ? (
              <p className="truncate font-medium">{profile.phone}</p>
            ) : (
              <p className="truncate italic text-text-muted font-medium">No phone provided</p>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 pt-0.5">
        {hasCompleteProfile ? (
          <Link
            href="/profile/edit"
            className="bg-white border border-border-strong rounded-[16px] size-[32px] flex items-center justify-center text-text-secondary transition-all hover:text-primary-orange hover:border-primary-orange active:scale-95 shadow-2xs shrink-0"
            aria-label="Edit Profile"
          >
            <svg className="size-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
            </svg>
          </Link>
        ) : onCreateProfile ? (
          <button
            type="button"
            onClick={onCreateProfile}
            className="inline-flex items-center justify-center bg-primary-orange hover:bg-primary-orange/90 active:scale-95 text-white text-[12px] sm:text-[13px] font-semibold px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-[8px] sm:rounded-[10px] shadow-xs transition-all whitespace-nowrap cursor-pointer"
            aria-label="Create Profile"
          >
            Create Profile
          </button>
        ) : (
          <Link
            href="/profile/edit"
            className="inline-flex items-center justify-center bg-primary-orange hover:bg-primary-orange/90 active:scale-95 text-white text-[12px] sm:text-[13px] font-semibold px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-[8px] sm:rounded-[10px] shadow-xs transition-all whitespace-nowrap cursor-pointer"
            aria-label="Create Profile"
          >
            Create Profile
          </Link>
        )}
      </div>
    </div>
  );
}
