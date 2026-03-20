import { useState } from 'react';

export default function ImageWithSkeleton({ src, alt, className = '', wrapperClassName = '' }) {
  const [loaded, setLoaded] = useState(false);

  if (!src) return null;

  return (
    <div className={`image-skeleton-wrap ${wrapperClassName}`.trim()}>
      {!loaded && <div className="image-skeleton-blur skeleton" aria-hidden="true" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`${className} ${loaded ? 'is-loaded' : ''}`.trim()}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
