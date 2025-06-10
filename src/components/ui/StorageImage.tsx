import { useState, useEffect } from "react";
import { getImageUrl } from "@/lib/storage";

interface StorageImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  imagePath?: string | null;
  placeholderSrc?: string;
}

const StorageImage: React.FC<StorageImageProps> = ({
  imagePath,
  placeholderSrc = "/placeholder.svg",
  ...props
}) => {
  const [imageUrl, setImageUrl] = useState<string>(placeholderSrc);

  useEffect(() => {
    const fetchImageUrl = async () => {
      if (imagePath) {
        try {
          // Check if the imagePath is already a full URL (starts with http/https)
          if (
            imagePath.startsWith("http://") ||
            imagePath.startsWith("https://")
          ) {
            setImageUrl(imagePath);
          } else {
            // It's a Supabase storage path, get the public URL
            const url = await getImageUrl(imagePath);
            if (url) {
              setImageUrl(url);
            }
          }
        } catch {
          // Keep placeholder on error
        }
      }
    };

    fetchImageUrl();
  }, [imagePath]);

  return (
    <img
      src={imageUrl}
      onError={() => {
        // If the final URL also fails, fall back to placeholder
        if (imageUrl !== placeholderSrc) {
          setImageUrl(placeholderSrc);
        }
      }}
      {...props}
    />
  );
};

export default StorageImage;
