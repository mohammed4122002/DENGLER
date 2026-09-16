"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { BLUR_DATA_URL, FALLBACK_IMAGE } from "@/lib/data/images";

type SmartImageProps = Omit<ImageProps, "placeholder" | "blurDataURL" | "onError">;

/**
 * Every photograph in the platform goes through here.
 *
 * Adds three things `next/image` doesn't give us on its own:
 *   · a warm cream blur-up instead of an empty grey box,
 *   · a branded fallback plate if a remote URL ever 404s, so a dead image
 *     reads as intentional rather than broken,
 *   · a fade-in on decode, which is what makes the grid feel unhurried.
 */
export function SmartImage({ alt, className = "", ...props }: SmartImageProps) {
  const [src, setSrc] = useState(props.src);
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      onError={() => setSrc(FALLBACK_IMAGE)}
      onLoad={() => setLoaded(true)}
      className={`${className} transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
