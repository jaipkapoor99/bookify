import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/SupabaseClient";

interface LazyStorageImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  imagePath?: string | null;
  placeholderSrc?: string;
  lazyLoad?: boolean;
  threshold?: number;
}

const ImageSkeleton = ({ className }: { className?: string }) => (
  <div
    className={`animate-pulse bg-gray-200 rounded ${className}`}
    style={{ minHeight: "200px" }}
  >
    <div className="flex items-center justify-center h-full">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  </div>
);

const LazyStorageImage: React.FC<LazyStorageImageProps> = ({
  imagePath,
  placeholderSrc = "/placeholder.svg",
  lazyLoad = true,
  threshold = 0.1,
  className,
  ...props
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imagePath) {
      setImageUrl(placeholderSrc);
      setIsLoading(false);
      return;
    }

    const loadImage = async () => {
      try {
        const { data } = supabase.storage
          .from("event-images")
          .getPublicUrl(imagePath);

        if (data?.publicUrl) {
          setImageUrl(data.publicUrl);
        } else {
          setImageUrl(placeholderSrc);
        }
      } catch (error) {
        console.error("Error loading image:", error);
        setImageUrl(placeholderSrc);
      } finally {
        setIsLoading(false);
      }
    };

    if (lazyLoad && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadImage();
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    } else {
      // Load immediately if lazy loading is disabled or not supported
      loadImage();
    }
  }, [imagePath, placeholderSrc, lazyLoad, threshold]);

  return (
    <div ref={imgRef} className={className}>
      {isLoading ? (
        <ImageSkeleton className={className} />
      ) : (
        <img
          src={imageUrl || placeholderSrc}
          alt={props.alt || ""}
          className={className}
          {...props}
        />
      )}
    </div>
  );
};

export default LazyStorageImage;
