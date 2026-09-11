import React from 'react';
import { IconStarFilled, IconStarOutline } from '@/components/productDetailPage/Icons';

interface ProductHeaderProps {
  title: string;
  rating: number;
  reviewCount: number;
  tags?: string[];
}

export default function ProductHeader({ title, rating, reviewCount, tags = [] }: ProductHeaderProps) {
  const fullStars = Math.floor(rating);
  return (
    <div className="flex flex-col gap-[10px] items-start relative shrink-0 w-full">
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-[-6px]">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="bg-primary-orange text-white text-[10px] font-bold uppercase tracking-wider px-[8px] py-[3px] rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between w-full">
        <h1 className="font-bold leading-[24px] text-text-primary text-[18px] break-words">
          {title}
        </h1>
      </div>
      <div className="flex gap-[10px] items-center w-full">
        <span className="font-bold leading-[28px] text-text-primary text-[22px]">
          {rating.toFixed(1)}
        </span>
        <div className="flex items-center gap-[2px]">
          {[1, 2, 3, 4, 5].map((star) => (
            star <= fullStars 
              ? <IconStarFilled key={star} className="w-[18px] h-[18px] text-primary-orange" /> 
              : <IconStarOutline key={star} className="w-[18px] h-[18px] text-[#e5e0da]" />
          ))}
        </div>
        <span className="font-normal leading-[16px] text-text-muted text-[12px]">
          ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      </div>
    </div>
  );
}
