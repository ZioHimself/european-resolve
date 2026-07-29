"use client";

import { useEffect, useRef } from "react";

interface WhyDonateWidgetProps {
  shortcode: string;
  lang?: string;
}

export function WhyDonateWidget({ shortcode, lang = "auto" }: WhyDonateWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    if (!document.querySelector('link[href*="wdplugin-style.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://plugin.whydonate.com/wdplugin-style.css";
      document.head.appendChild(link);
    }

    if (!document.querySelector('script[src*="wp_styling.js"]')) {
      const script = document.createElement("script");
      script.src = "https://plugin.whydonate.com/wp_styling.js";
      script.type = "text/javascript";
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current?.querySelector(".widget-here");
    if (el) {
      el.setAttribute("value", "donation-widget");
    }
  }, []);

  return (
    <div ref={containerRef}>
      <div
        id={`widget-here-${shortcode}`}
        className="widget-here"
        data-shortcode={shortcode}
        data-lang={lang}
      />
    </div>
  );
}
