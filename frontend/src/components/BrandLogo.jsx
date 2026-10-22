"use client";

import { useState } from "react";

export default function BrandLogo({
  name,
  src,
  className = "",
  imageClassName = "",
  fallbackClassName = "",
}) {
  const [failedSrc, setFailedSrc] = useState(null);

  return (
    <div className={className}>
      {src && failedSrc !== src ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={`${name} logo`}
          className={imageClassName}
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span className={fallbackClassName}>{name}</span>
      )}
    </div>
  );
}
