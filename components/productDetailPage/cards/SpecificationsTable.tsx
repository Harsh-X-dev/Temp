import React from 'react';
import { ProductSpecification } from '@/types/product.types';

interface SpecificationsTableProps {
  specifications: ProductSpecification[];
}

export default function SpecificationsTable({ specifications }: SpecificationsTableProps) {
  if (!specifications || specifications.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 items-start w-full relative shrink-0">
      <h2 className="font-bold leading-[24px] text-text-primary text-[18px]">
        Specifications
      </h2>

      <div className="w-full rounded-[16px] border border-[#E7E2D8] bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] divide-y divide-[#EFEAE2]">
        {specifications.map((spec, index) => {
          const isEven = index % 2 === 0;
          return (
            <div
              key={spec.id || index}
              className={`flex items-start gap-4 sm:gap-6 px-4 py-3.5 sm:px-5 transition-colors ${
                isEven ? 'bg-white' : 'bg-[#FAF7F2]/70'
              }`}
            >
              {/* Specification Key / Label */}
              <span className="w-[110px] sm:w-[150px] shrink-0 text-[12.5px] sm:text-[13px] font-medium text-[#78716C] leading-relaxed">
                {spec.specKey}
              </span>

              {/* Specification Value */}
              <span className="flex-1 text-[13.5px] sm:text-[14px] font-semibold text-[#1C1917] leading-relaxed break-words text-left">
                {spec.specValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
