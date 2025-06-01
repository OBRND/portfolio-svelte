// src/lib/components/react/IconCloudReact.jsx
"use client"; // This directive is typically for Next.js, but harmless here.

import React, { useEffect, useMemo, useState } from "react";
import { Cloud, fetchSimpleIcons, renderSimpleIcon } from "react-icon-cloud";

// Simple mock for useTheme if you don't want to pass theme from Svelte
const useTheme = () => ({ theme: 'dark' }); // Always dark for simplicity here.

export const cloudProps = {
  containerProps: {
    style: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      paddingTop: 40,
    },
  },
  options: {
    reverse: true,
    depth: 1,
    wheelZoom: false,
    imageScale: 2,
    activeCursor: "default",
    tooltip: "native",
    initial: [0.1, -0.1],
    clickToFront: 500,
    tooltipDelay: 0,
    outlineColour: "#000", // Will be overridden by renderCustomIcon's bgHex for the icon's background
    maxSpeed: 0.04,
    minSpeed: 0.02,
    // dragControl: false, // Re-enable if you want it
  },
};

export const renderCustomIcon = (icon, theme = 'light', onIconClick) => { // Added onIconClick
  const bgHex = theme === "light" ? "#f3f2ef" : "#080510"; // This background color is for the icon's own SVG area
  const fallbackHex = theme === "light" ? "#6e6e73" : "#ffffff";
  const minContrastRatio = theme === "dark" ? 2 : 1.2;

  return renderSimpleIcon({
    icon,
    bgHex, // This creates a background for the icon's shape.
    fallbackHex,
    minContrastRatio,
    size: 42,
    aProps: {
      href: undefined,
      target: undefined,
      rel: undefined,
      onClick: (e) => { // Modified onClick handler
        e.preventDefault();
        if (onIconClick) {
          onIconClick(icon.slug); // Pass the slug back to the Svelte component
        }
      },
    },
  });
};

export default function IconCloudReact({
  iconSlugs = [],
  imageArray = [], // Ensure imageArray is always defined
  initialTheme = 'dark', // New prop to pass theme from Svelte
  onIconClick // New prop for click handler
}) {
  const [data, setData] = useState(null);
  const [currentTheme, setCurrentTheme] = useState(initialTheme); // Use internal state or prop directly

  // Update theme if prop changes
  useEffect(() => {
    setCurrentTheme(initialTheme);
  }, [initialTheme]);

  useEffect(() => {
    if (iconSlugs.length > 0) {
      fetchSimpleIcons({ slugs: iconSlugs }).then(setData);
    }
  }, [iconSlugs]);

  const renderedIcons = useMemo(() => {
    if (!data) return null;
    return Object.values(data.simpleIcons).map((icon) =>
      renderCustomIcon(icon, currentTheme, onIconClick) // Pass onIconClick here
    );
  }, [data, currentTheme, onIconClick]); // Include onIconClick in dependencies

  return (
    // @ts-ignore
    <Cloud {...cloudProps}>
      <>
        {/* Render simple-icons */}
        {renderedIcons}

        {/* Render custom images - Note: Custom images won't have a direct slug for mapping to techStack */}
        {imageArray &&
          imageArray.length > 0 &&
          imageArray.map((image, index) => {
            return (
              <a key={index} href="#" onClick={(e) => e.preventDefault()}>
                <img height="42" width="42" alt="Custom icon" src={image} />
              </a>
            );
          })}
      </>
    </Cloud>
  );
}