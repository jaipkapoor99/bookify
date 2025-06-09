import * as React from "react";
import { cn } from "@/lib/utils";

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, fallback, alt, onError, ...props }, ref) => {
    const [error, setError] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    const handleError = React.useCallback(
      (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setError(true);
        setLoading(false);
        onError?.(event);
      },
      [onError]
    );

    const handleLoad = React.useCallback(() => {
      setLoading(false);
      setError(false);
    }, []);

    if (error && fallback) {
      return (
        <img
          ref={ref}
          src={fallback}
          alt={alt}
          className={cn(className)}
          onError={handleError}
          onLoad={handleLoad}
          {...props}
        />
      );
    }

    return (
      <img
        ref={ref}
        alt={alt}
        className={cn(className)}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    );
  }
);
Image.displayName = "Image";

export { Image };
