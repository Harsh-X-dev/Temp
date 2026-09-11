import { ProductSpecification } from '@/types/product.types';

interface SpecificationsTableProps {
  specifications: ProductSpecification[];
}

export default function SpecificationsTable({ specifications }: SpecificationsTableProps) {
  if (!specifications || specifications.length === 0) return null;

  return (
    <div className="flex flex-col gap-[12px] items-start w-full relative shrink-0">
      <h2 className="font-bold leading-[24px] text-text-primary text-[18px]">
        Specifications
      </h2>
      <div className="flex flex-col items-start w-full border border-border-strong rounded-[12px] overflow-hidden">
        {specifications.map((spec, index) => {
          const isEven = index % 2 === 0;
          return (
            <div 
              key={spec.id} 
              className={`border-border-strong border-b last:border-b-0 border-solid flex items-center justify-between px-[14px] py-[12px] w-full ${
                isEven ? 'bg-white' : 'bg-surface-subtle'
              }`}
            >
              <p className="font-normal leading-[16px] text-text-secondary text-[12px]">
                {spec.specKey}
              </p>
              <p className="font-semibold leading-[20px] text-text-primary text-[14px] text-right">
                {spec.specValue}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
