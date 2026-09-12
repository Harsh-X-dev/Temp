'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';

interface SectionTabsProps {
  hasCertificates?: boolean;
}

export default function SectionTabs({ hasCertificates = false }: SectionTabsProps) {
  const tabs = useMemo(
    () => [
      { id: 'description', label: 'Description' },
      { id: 'details', label: 'Details' },
      { id: 'specifications', label: 'Specifications' },
      ...(hasCertificates ? [{ id: 'certification', label: 'Certification' }] : []),
      { id: 'reviews', label: 'Reviews' },
    ],
    [hasCertificates]
  );

  const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'description');
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const isManualClickRef = useRef(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Smoothly center the active tab chip inside the horizontal container without jitter
  const scrollActiveTabIntoView = useCallback((tabId: string, smooth = true) => {
    const container = tabsContainerRef.current;
    if (!container) return;

    const activeBtn = container.querySelector<HTMLButtonElement>(`[data-tab-id="${tabId}"]`);
    if (!activeBtn) return;

    const containerWidth = container.clientWidth;
    const btnLeft = activeBtn.offsetLeft;
    const btnWidth = activeBtn.offsetWidth;
    const currentScrollLeft = container.scrollLeft;

    // Check if button is already comfortably visible within container bounds
    const isVisible =
      btnLeft >= currentScrollLeft + 20 &&
      btnLeft + btnWidth <= currentScrollLeft + containerWidth - 20;

    if (isVisible) return;

    // Center the target button in the container
    const targetScrollLeft = btnLeft - containerWidth / 2 + btnWidth / 2;

    try {
      container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: smooth ? 'smooth' : 'auto',
      });
    } catch {
      container.scrollLeft = Math.max(0, targetScrollLeft);
    }
  }, []);

  // When active tab changes from click or scroll, gently align if out of viewport
  useEffect(() => {
    scrollActiveTabIntoView(activeTab, !isManualClickRef.current);
  }, [activeTab, scrollActiveTabIntoView]);

  // Rock-solid hysteresis-backed scrollspy to eliminate oscillation & shivering
  useEffect(() => {
    let ticking = false;

    const checkActiveSection = () => {
      if (isManualClickRef.current) return;

      const isMobile = window.innerWidth < 768;
      const headerOffset = isMobile ? 120 : 140;

      // Bottom of page check
      const scrollY = window.scrollY;
      const scrollBottom = window.innerHeight + scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const isNearBottom = scrollBottom >= docHeight - 80;

      if (isNearBottom && tabs.length > 0) {
        const lastTab = tabs[tabs.length - 1];
        if (activeTabRef.current !== lastTab.id) {
          setActiveTab(lastTab.id);
        }
        return;
      }

      // Collect available section DOM elements
      const sectionElements = tabs
        .map((tab) => {
          const el = document.getElementById(tab.id) || document.getElementById(tab.id + 's');
          return { tabId: tab.id, el };
        })
        .filter((item): item is { tabId: string; el: HTMLElement } => item.el !== null);

      if (sectionElements.length === 0) return;

      const currentActive = activeTabRef.current;
      const currentIdx = sectionElements.findIndex((s) => s.tabId === currentActive);

      // Check current section with hysteresis deadband to prevent rapid flipping
      let newActiveId = sectionElements[0].tabId;

      for (let i = 0; i < sectionElements.length; i++) {
        const { tabId, el } = sectionElements[i];
        const rect = el.getBoundingClientRect();
        
        // Use a 40px hysteresis buffer: harder to leave current section, preventing flickering
        const threshold = i > currentIdx ? headerOffset + 10 : headerOffset + 50;

        if (rect.top <= threshold) {
          newActiveId = tabId;
        } else {
          break;
        }
      }

      if (activeTabRef.current !== newActiveId) {
        setActiveTab(newActiveId);
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkActiveSection();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    // Initial check
    checkActiveSection();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, [tabs]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    isManualClickRef.current = true;
    scrollActiveTabIntoView(tabId, true);

    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      isManualClickRef.current = false;
    }, 900);

    const element = document.getElementById(tabId) || document.getElementById(tabId + 's');
    if (element) {
      const isMobile = window.innerWidth < 768;
      const headerOffset = isMobile ? 120 : 140;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="sticky top-[56px] md:top-[64px] z-30 -mx-4 md:mx-0 w-[calc(100%+32px)] md:w-full bg-white py-2 border-b border-[#F0EBE1] isolate">
      <div
        ref={tabsContainerRef}
        className="flex items-center overflow-x-auto no-scrollbar py-0.5"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* 1. Left Spacer */}
        <div className="shrink-0 w-4 md:w-0" aria-hidden="true" />

        <div className="flex gap-2.5 items-center">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-tab-id={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`shrink-0 flex items-center justify-center h-[36px] px-4 rounded-full border cursor-pointer select-none text-[13px] md:text-[14px] font-semibold leading-none transition-colors duration-150 ${
                  isActive
                    ? 'bg-primary-orange text-white border-primary-orange shadow-xs'
                    : 'bg-white border-[#E7E2D8] text-[#57534E] hover:border-[#D6CEBF] hover:text-[#1C1917] hover:bg-[#FAF7F2]'
                }`}
              >
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Right Spacer */}
        <div className="shrink-0 w-4 md:w-0" aria-hidden="true" />
      </div>
    </div>
  );
}
