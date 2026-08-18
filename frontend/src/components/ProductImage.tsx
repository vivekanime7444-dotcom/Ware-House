import React, { useState } from "react";
import { Package } from "lucide-react";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  category?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({ src, alt, className = "w-full h-full object-cover", category }) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={`bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 rounded-xl p-2 ${className}`}>
        <Package className="w-8 h-8 text-indigo-500/60 mb-1" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center truncate max-w-full px-1">
          {category || "Product"}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
};
