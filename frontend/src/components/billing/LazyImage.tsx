import React, { useRef, useState, useEffect, memo } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /** Shown while the image loads — defaults to a blurred grey placeholder */
  placeholder?: string;
  /** Aspect ratio wrapper class, e.g. 'aspect-square' or 'aspect-video' */
  aspectClass?: string;
}

/**
 * LazyImage uses IntersectionObserver to defer loading until the image
 * enters the viewport. This is critical for menu grids with 200+ items —
 * without lazy loading every image would be fetched on initial render.
 *
 * Progressive enhancement:
 * 1. Native `loading="lazy"` is set for browsers that support it
 * 2. IntersectionObserver provides the same for older browsers
 * 3. A blur-to-clear CSS transition gives a smooth reveal
 */
export const LazyImage = memo(({
  src,
  alt,
  placeholder,
  aspectClass = 'aspect-square',
  className = '',
  ...props
}: LazyImageProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Native lazy loading handles most cases — IntersectionObserver for full control
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // start loading 200px before entering viewport
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const defaultPlaceholder = 'data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 1 1%22%3E%3Crect fill%3D%22%23e5e7eb%22 width%3D%221%22 height%3D%221%22%2F%3E%3C%2Fsvg%3E';

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${aspectClass}`}
    >
      {/* Placeholder shown until image loads */}
      <img
        src={placeholder ?? defaultPlaceholder}
        alt=""
        aria-hidden
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Actual image — only rendered when in viewport */}
      {isVisible && !hasError && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          {...props}
        />
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-300 dark:text-gray-600">
          <span className="text-3xl select-none">🍽️</span>
        </div>
      )}
    </div>
  );
});
LazyImage.displayName = 'LazyImage';
export default LazyImage;
