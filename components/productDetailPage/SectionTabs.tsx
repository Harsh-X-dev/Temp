'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

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
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const isManualClickRef = useRef(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Smoothly center the active tab chip inside the horizontal scrollable slider
  useEffect(() => {
    const container = tabsContainerRef.current;
    if (!container) return;

    const activeBtn = container.querySelector<HTMLButtonElement>(`[data-tab-id="${activeTab}"]`);
    if (!activeBtn) return;

    const containerRect = container.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    const relativeLeft = btnRect.left - containerRect.left + container.scrollLeft;
    const targetScrollLeft = relativeLeft - container.clientWidth / 2 + btnRect.width / 2;

    container.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: 'smooth',
    });
  }, [activeTab]);

  // Reliable, high-performance scrollspy that highlights section accurately as user scrolls
  useEffect(() => {
    let ticking = false;

    const checkActiveSection = () => {
      const isMobile = window.innerWidth < 768;
      // Header offset: navbar + sticky tabs slider + buffer
      const headerOffset = isMobile ? 130 : 150;

      // When scrolled to the very bottom of the page, activate the last tab (Reviews)
      const isBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60;

      if (isBottom && tabs.length > 0) {
        const lastTab = tabs[tabs.length - 1];
        setActiveTab((prev) => (prev !== lastTab.id ? lastTab.id : prev));
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

      // Find the furthest section whose top has scrolled past or reached headerOffset
      let currentActiveId = sectionElements[0].tabId;

      for (let i = 0; i < sectionElements.length; i++) {
        const { tabId, el } = sectionElements[i];
        const rect = el.getBoundingClientRect();
        if (rect.top <= headerOffset) {
          currentActiveId = tabId;
        } else {
          break;
        }
      }

      setActiveTab((prev) => (prev !== currentActiveId ? currentActiveId : prev));
    };

    const handleScroll = () => {
      if (isManualClickRef.current) return;
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
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      isManualClickRef.current = false;
    }, 800);

    const element = document.getElementById(tabId) || document.getElementById(tabId + 's');
    if (element) {
      const isMobile = window.innerWidth < 768;
      const headerOffset = isMobile ? 120 : 135;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="sticky top-[56px] md:top-[64px] z-30 w-full bg-white py-1.5 isolate">
      <div
        ref={tabsContainerRef}
        className="flex gap-2.5 items-center overflow-x-auto no-scrollbar py-0.5"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`shrink-0 flex items-center justify-center px-4 py-2 rounded-full border cursor-pointer active:scale-95 text-[13px] md:text-[14px] font-semibold leading-[18px] transition-colors duration-150 ${
                isActive
                  ? 'bg-primary-orange text-white border-primary-orange shadow-xs'
                  : 'bg-white border-border-strong text-text-primary hover:border-text-muted hover:bg-surface-subtle'
              }`}
            >
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
