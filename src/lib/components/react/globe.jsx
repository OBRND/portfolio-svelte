// src/lib/components/react/IconCloudReact.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Cloud, fetchSimpleIcons, renderSimpleIcon } from "react-icon-cloud";

// Simple mock for useTheme (keep this as is, or remove if you truly use a theme context)
const useTheme = () => ({ theme: 'dark' });

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
    outlineColour: "#000",
    maxSpeed: 0.04,
    minSpeed: 0.02,
    // dragControl: false,
  },
};

// --- MODIFIED: renderLogic for individual icons ---
// This function creates the actual React element for each icon
const renderIconElement = (icon, theme = 'light', onIconClick) => {
  // If 'icon' has a 'slug' property, it's a simple-icon object from fetchSimpleIcons
  if (icon && typeof icon === 'object' && icon.slug) { // Added null/undefined check for safety
    const bgHex = theme === "light" ? "#f3f2ef" : "#080510";
    const fallbackHex = theme === "light" ? "#6e6e73" : "#ffffff";
    const minContrastRatio = theme === "dark" ? 2 : 1.2;

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
      // The 'render' prop is NOT used when passing pre-rendered children.
      // Remove the 'render' prop: render={(icon) => customRenderLogic(icon, currentTheme, onIconClick)}
    >
      {/* Pass the array of pre-rendered React elements as children */}
      {renderedIconElements}
    </Cloud>
  );
}