import type { ComponentType } from 'react';

import {
  IconMaterial,
  IconOrigin,
  IconMukhiType,
  IconPurpose,
  IconBestFor,
  IconRulingPlanet,
  IconMoolank,
  IconEnergized
} from '@/components/productDetailPage/Icons';

interface ProductDetailsProps {
  details: {
    material?: string;
    origin?: string;
    mukhiType?: string;
    purpose?: string;
    bestFor?: string;
    rulingPlanet?: string;
    moolank?: string;
    energizedAt?: string;
    about?: string;
  };
  temple?: {
    templeName: string;
    location?: string;
    description: string;
  };
}

const DetailCard = ({ label, value, icon: Icon }: { label: string, value: string, icon: ComponentType<{ className?: string }> }) => (
  <div className="bg-white border border-border-strong border-solid flex flex-1 flex-col gap-[6px] items-start min-w-px p-[12px] rounded-[12px]">
    <div className="flex gap-[8px] items-center shrink-0">
      <div className="text-primary-orange flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <p className="font-semibold leading-[16px] text-text-secondary text-[12px] whitespace-nowrap">
        {label}
      </p>
    </div>
    <p className="font-semibold leading-[20px] text-text-primary text-[14px]">
      {value}
    </p>
  </div>
);

export default function ProductDetails({ details, temple }: ProductDetailsProps) {
  const cards = [
    { label: 'Material', value: details.material, icon: IconMaterial },
    { label: 'Origin', value: details.origin, icon: IconOrigin },
    { label: 'Mukhi Type', value: details.mukhiType, icon: IconMukhiType },
    { label: 'Purpose', value: details.purpose, icon: IconPurpose },
    ...(details.bestFor && details.bestFor !== 'N/A'
      ? [{ label: 'Best for', value: details.bestFor, icon: IconBestFor }]
      : []),
    { label: 'Ruling Planet', value: details.rulingPlanet, icon: IconRulingPlanet },
    { label: 'Moolank', value: details.moolank, icon: IconMoolank },
    { label: 'Energized at', value: details.energizedAt, icon: IconEnergized },
  ].filter((c) => Boolean(c.value) && c.value !== 'N/A');

  return (
    <div className="flex flex-col gap-[12px] items-start w-full relative shrink-0">
      <h2 className="font-bold leading-[24px] text-text-primary text-[18px]">
        Details
      </h2>
      
      <div className="grid grid-cols-2 gap-[12px] w-full">
        {cards.map((card, idx) => (
          <DetailCard key={idx} label={card.label} value={card.value!} icon={card.icon} />
        ))}
      </div>

      {details.about && details.about !== 'N/A' && (
        <div className="bg-surface-subtle flex flex-col gap-[8px] items-start p-[14px] rounded-[12px] w-full">
          <p className="font-bold leading-[20px] text-text-primary text-[14px]">
            About {details.mukhiType || 'Product'}
          </p>
          <p className="font-normal leading-[18px] text-text-secondary text-[13px]">
            {details.about}
          </p>
        </div>
      )}

      {temple && (
        <div className="bg-white border border-border-strong border-solid flex gap-[12px] items-center p-[12px] rounded-[12px] w-full">
          <div className="flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px">
            <p className="font-bold leading-[20px] text-text-primary text-[14px]">
              {temple.templeName}
            </p>
            {temple.location && (
              <p className="font-normal leading-[16px] text-text-secondary text-[12px]">
                {temple.location}
              </p>
            )}
            <p className="font-normal leading-[16px] text-text-muted text-[12px]">
              {temple.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
