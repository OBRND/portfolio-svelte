// src/lib/components/react/IconCloudReact.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Cloud, fetchSimpleIcons, renderSimpleIcon } from "react-icon-cloud";
import { CLOUD_ID } from "./cloudId.js";

// Simple mock for useTheme (keep this as is, or remove if you truly use a theme context)
const useTheme = () => ({ theme: 'dark' });

// The underlying TagCloud engine turns a drag delta straight into rotation
// speed (yaw/pitch scale linearly with `maxSpeed`), so a value tuned for a
// precise mouse makes a small touch swipe fling the whole globe — and its
// tap-vs-drag tolerance (`dragThreshold`, in canvas px) defaults to 4, which
// a finger's natural tremor clears almost every time, turning taps into
// drags. Touch gets a much gentler speed and a wider tap tolerance so a
// specific icon is actually reachable; mouse/desktop keeps the snappier feel.
const supportsTouch =
  typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

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
    initial: supportsTouch ? [0.04, -0.04] : [0.1, -0.1],
    clickToFront: 500,
    tooltipDelay: 0,
    outlineColour: "#000",
    // TagCanvas fades tags by depth straight through globalAlpha, and with
    // `depth: 1` (double its own default) the far half of the cloud lands on
    // the stock `minBrightness: 0.1` — 10% opacity, which on a near-black
    // canvas leaves the brand colours washed out to grey. Lifting the floor
    // keeps the depth cue readable while the icons stay recognisably coloured
    // all the way around the sphere.
    minBrightness: 0.62,
    maxBrightness: 1,
    maxSpeed: supportsTouch ? 0.012 : 0.058,
    minSpeed: supportsTouch ? 0.006 : 0.02,
    dragThreshold: supportsTouch ? 10 : 4,
    // dragControl: false,
  },
};

const BG_HEX = { light: "#f3f2ef", dark: "#080510" };

// How much contrast an icon has to clear against the canvas behind it before
// it gets brightened (dark theme) or deepened (light theme).
const CONTRAST_TARGET = { light: 1.8, dark: 4.5 };

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
};

const toHex = (rgb) =>
  '#' + rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');

const relativeLuminance = (rgb) =>
  rgb
    .map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    })
    .reduce((sum, lin, i) => sum + lin * [0.2126, 0.7152, 0.0722][i], 0);

const contrastRatio = (a, b) => {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

/**
 * simple-icons brand hexes are chosen for print and light UI, so a good number
 * of them (Flutter's navy, Cloudinary's indigo, GitHub's near-black) all but
 * vanish against the near-black globe. react-icon-cloud's own answer to that
 * is `fallbackHex` — but that is a single flat colour, so every icon failing
 * the check comes out identical: pure white in dark mode, grey in light mode.
 * That is what drains the colour out of the cloud.
 *
 * Instead, walk the brand colour itself toward white (or black on a light
 * background) only as far as it takes to clear the bar. The hue survives, so
 * a brightened Flutter still reads unmistakably as Flutter blue, and nothing
 * ever lands on flat white or grey.
 */
const legibleBrandHex = (hex, theme) => {
  const bg = hexToRgb(BG_HEX[theme] ?? BG_HEX.dark);
  const target = CONTRAST_TARGET[theme] ?? CONTRAST_TARGET.dark;
  const brand = hexToRgb(hex.startsWith('#') ? hex : '#' + hex);
  const towards = theme === 'light' ? [0, 0, 0] : [255, 255, 255];

  // GitHub and Vercel are achromatic by design, so there is no hue worth
  // preserving — nudging them just far enough to pass the check leaves a muddy
  // mid-grey. Take those all the way to a crisp near-white instead.
  const chroma = Math.max(...brand) - Math.min(...brand);
  if (chroma < 12 && theme === 'dark' && relativeLuminance(brand) < 0.3) {
    return '#ececec';
  }

  for (let t = 0; t <= 1.0001; t += 0.04) {
    const candidate = brand.map((c, i) => c + (towards[i] - c) * t);
    if (contrastRatio(candidate, bg) >= target) return toHex(candidate);
  }
  return toHex(towards);
};

// --- MODIFIED: renderLogic for individual icons ---
// This function creates the actual React element for each icon
const renderIconElement = (icon, theme = 'light', onIconClick) => {
  // If 'icon' has a 'slug' property, it's a simple-icon object from fetchSimpleIcons
  if (icon && typeof icon === 'object' && icon.slug) { // Added null/undefined check for safety
    const bgHex = theme === "light" ? BG_HEX.light : BG_HEX.dark;
    // The fallback is computed per icon rather than shared, and the ratio it is
    // measured against is the same one `legibleBrandHex` already satisfied — so
    // whichever branch renderSimpleIcon takes, the colour it paints is a tinted
    // version of this icon's own brand hex.
    const fallbackHex = legibleBrandHex(icon.hex, theme === "light" ? "light" : "dark");
    const minContrastRatio = theme === "dark" ? CONTRAST_TARGET.dark : CONTRAST_TARGET.light;

    // renderSimpleIcon already returns a React element (an <a> tag with SVG inside)
    return renderSimpleIcon({
      icon,
      bgHex,
      fallbackHex,
      minContrastRatio,
      size: 42,
      aProps: {
        href: undefined, // Ensure no actual navigation
        target: undefined,
        rel: undefined,
        onClick: (e) => {
          e.preventDefault();
          if (onIconClick) {
            onIconClick(icon.slug); // Pass the simple-icon slug
          }
        },
      },
    });
  } else if (icon && typeof icon === 'object' && icon.src && icon.id) {
    // If 'icon' has 'src' and 'id', it's one of your custom image objects.
    // We render it as a plain <img> tag inside an <a> for clickability.
    return (
      <a
        key={`custom-${icon.id}`} // Unique key for React list rendering
        href="#"
        onClick={(e) => {
          e.preventDefault();
          if (onIconClick) {
            onIconClick(icon.id); // Pass your custom image's ID
          }
        }}
        // Add inline styles for positioning and appearance if needed for the <a> tag itself
        style={{
            display: 'flex', // To center the image inside the anchor if needed
            justifyContent: 'center',
            alignItems: 'center',
            height: '42px', // Ensure anchor has same size as icons for consistency
            width: '42px',
            backgroundColor: theme === "light" ? "#f3f2ef" : "#080510", // Match simple-icon background
            borderRadius: '50%', // Simple icons often appear circular
            padding: '5px', // Adjust padding for your SVGs
            boxSizing: 'border-box' // Include padding in the element's total width and height
        }}
      >
        <img
          height="32" // Smaller image inside the padded anchor, adjust as needed
          width="32"
          alt={icon.alt || "Custom icon"}
          src={icon.src}
          style={{
            display: 'block', // Ensure image doesn't have extra space below it
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        />
      </a>
    );
  }
  console.warn("Unrecognized icon object:", icon); // Log unrecognized objects
  return null; // Return null for unrecognized or invalid icon objects
};


export default function IconCloudReact({
  iconSlugs = [], // Array of simple-icons slugs
  imageArray = [], // Array of { src, id, alt } objects for custom images
  initialTheme = 'dark',
  onIconClick
}) {
  const [simpleIconsData, setSimpleIconsData] = useState(null);
  const [currentTheme, setCurrentTheme] = useState(initialTheme);

  useEffect(() => {
    setCurrentTheme(initialTheme);
  }, [initialTheme]);

  // Fetch simple icons
  useEffect(() => {
    if (iconSlugs.length > 0) {
      fetchSimpleIcons({ slugs: iconSlugs })
        .then(data => {
          setSimpleIconsData(data);
          // console.log("Fetched Simple Icons:", data); // For debugging
        })
        .catch(error => {
          console.error("Error fetching simple icons:", error);
          setSimpleIconsData(null);
        });
    } else {
      setSimpleIconsData(null);
    }
  }, [iconSlugs]);

  // --- CRUCIAL CHANGE HERE: Render all icons into React elements in useMemo ---
  const renderedIconElements = useMemo(() => {
    const elements = [];

    // Render simple-icons
    if (simpleIconsData && simpleIconsData.simpleIcons) {
      Object.values(simpleIconsData.simpleIcons).forEach((icon) => {
        elements.push(renderIconElement(icon, currentTheme, onIconClick));
      });
    }

    // Render custom images
    if (imageArray && imageArray.length > 0) {
      imageArray.forEach((image) => {
        elements.push(renderIconElement(image, currentTheme, onIconClick));
      });
    }

    // Filter out any null elements in case renderIconElement returned null for invalid input
    return elements.filter(Boolean);
  }, [simpleIconsData, imageArray, currentTheme, onIconClick]);


  return (
    // @ts-ignore
    <Cloud
      {...cloudProps}
      id={CLOUD_ID}
      // The 'render' prop is NOT used when passing pre-rendered children.
      // Remove the 'render' prop: render={(icon) => customRenderLogic(icon, currentTheme, onIconClick)}
    >
      {/* Pass the array of pre-rendered React elements as children */}
      {renderedIconElements}
    </Cloud>
  );
}