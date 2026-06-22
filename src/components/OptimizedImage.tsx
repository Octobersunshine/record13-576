import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  priority?: 'high' | 'low' | 'auto';
  className?: string;
  width?: number | string;
  height?: number | string;
  sizes?: string;
  srcSet?: string;
}

export default function OptimizedImage({
  src,
  alt,
  priority = 'auto',
  className,
  width,
  height,
  sizes,
  srcSet,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const isHighPriority = priority === 'high';

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {!loaded && !error && (
        <div className="absolute inset-0 skeleton" />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        srcSet={srcSet}
        loading={isHighPriority ? 'eager' : 'lazy'}
        fetchPriority={isHighPriority ? 'high' : 'low'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-800 text-dark-500 text-sm">
          加载失败
        </div>
      )}
    </div>
  );
}
