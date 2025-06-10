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
          const url = await getImageUrl(imagePath);
          if (url) {
            setImageUrl(url);
          }
        } catch (error) {
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
