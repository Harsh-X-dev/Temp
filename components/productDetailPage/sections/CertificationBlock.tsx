'use client';

import { ProductCertification } from '@/types/product.types';

interface CertificationBlockProps {
  certifications: ProductCertification[];
}

export default function CertificationBlock({ certifications }: CertificationBlockProps) {
  if (!certifications || certifications.length === 0) return null;
  const cert = certifications[0];

  return (
    <div className="flex flex-col gap-[12px] items-start w-full relative shrink-0">
      <h2 className="font-bold leading-[24px] text-text-primary text-[18px]">
        Certification
      </h2>
      
      <div className="bg-surface-subtle flex flex-col gap-[10px] items-start p-[14px] rounded-[12px] w-full">
        {/* Header */}
        <div className="flex gap-[10px] items-center w-full">
          <div className="bg-white flex items-center justify-center rounded-[10px] shrink-0 size-[36px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#ff5400" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 12l2 2 4-4" stroke="#ff5400" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex flex-1 flex-col gap-[2px] items-start min-w-px">
            <p className="font-bold leading-[20px] text-text-primary text-[14px]">
              Certified Authentic
            </p>
            <p className="font-normal leading-[16px] text-text-secondary text-[12px]">
              {cert.labName}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-[6px] items-start w-full">
          <div className="flex items-start justify-between w-full">
            <p className="font-normal text-text-secondary text-[12px]">
              Certificate No.
            </p>
            <p className="font-semibold text-text-primary text-[12px]">
              {cert.certificateNumber}
            </p>
          </div>
          <div className="flex items-start justify-between w-full">
            <p className="font-normal text-text-secondary text-[12px]">
              Issue Date
            </p>
            <p className="font-semibold text-text-primary text-[12px]">
              {cert.issueAt ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(cert.issueAt)) : 'N/A'}
            </p>
          </div>
        </div>

        {/* Action */}
        <a 
          href={cert.fileUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white border border-border-strong border-solid flex gap-[8px] items-center justify-between px-[12px] py-[10px] rounded-[10px] w-full transition-colors hover:bg-[#fafafa] cursor-pointer"
        >
          <p className="font-semibold leading-[18px] text-primary-orange text-[13px]">
            View Certificate
          </p>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12L10 8L6 4" stroke="#FF5400" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </div>
  );
}
