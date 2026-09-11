
interface ProductDescriptionProps {
  description: string;
}

export default function ProductDescription({ description }: ProductDescriptionProps) {
  return (
    <div className="flex flex-col gap-[8px] items-start w-full relative shrink-0">
      <h2 className="font-bold leading-[24px] text-text-primary text-[18px]">
        Description
      </h2>
      <p className="font-normal leading-[20px] text-text-secondary text-[14px]">
        {description}
      </p>
    </div>
  );
}
