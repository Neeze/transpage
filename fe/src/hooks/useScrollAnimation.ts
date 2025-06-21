"use client";

import { useEffect, useRef, useState } from 'react';

export const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Unobserve after first intersection to prevent re-triggering
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -100px 0px', // Trigger slightly before element comes into view
      }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  return { ref, isVisible };
};

// Animation classes for different effects
export const fadeInUpClass = (isVisible: boolean, delay = 0) => `
  transform transition-all duration-1000 ease-out
  ${isVisible 
    ? 'translate-y-0 opacity-100' 
    : 'translate-y-8 opacity-0'
  }
`.trim() + (delay ? ` delay-${delay}` : '');

export const fadeInClass = (isVisible: boolean, delay = 0) => `
  transition-all duration-1000 ease-out
  ${isVisible ? 'opacity-100' : 'opacity-0'}
`.trim() + (delay ? ` delay-${delay}` : '');
