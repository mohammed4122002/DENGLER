"use client";

import { useSyncExternalStore } from "react";

import { HeartIcon } from "@/components/ui/Icons";
import {
  getServerSnapshot,
  getSnapshot,
  subscribe,
  toggleFavourite,
} from "@/lib/favourites";

/**
 * Saves a shortlist to localStorage.
 *
 * Deliberately anonymous — a visitor browsing eight-figure inventory should
 * not have to create an account to keep a shortlist. When Supabase auth is
 * wired up, `lib/favourites` is the one place to sync it to a user.
 */
export function FavoriteButton({
  propertyId,
  title,
  tone = "light",
}: {
  propertyId: string;
  title: string;
  tone?: "light" | "dark";
}) {
  const favourites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const saved = favourites.includes(propertyId);

  const toggle = (event: React.MouseEvent) => {
    // The card is a link — don't navigate when the heart is clicked.
    event.preventDefault();
    event.stopPropagation();
    toggleFavourite(propertyId);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from shortlist` : `Save ${title} to shortlist`}
      className={`grid h-10 w-10 place-items-center rounded-full border backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        tone === "light"
          ? "border-white/35 bg-black/20 text-white hover:border-gold-soft hover:text-gold-soft"
          : "border-hairline bg-paper/80 text-graphite hover:border-gold hover:text-gold"
      } ${saved ? "!text-gold-soft" : ""}`}
    >
      <HeartIcon filled={saved} size={15} />
    </button>
  );
}
