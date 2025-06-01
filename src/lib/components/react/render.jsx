// src/lib/components/react/RenderGlobeReact.jsx
// This file will contain the actual React component rendering logic
// It is a .jsx file, so Vite's React plugin will process its JSX.

import React from 'react';
import ReactDOM from 'react-dom/client';
import IconCloudReact from './globe.jsx'; // Adjust path as needed

// This function will be called from your Svelte component
export function mountReactGlobe(containerElement, props) {
  const root = ReactDOM.createRoot(containerElement);
  root.render(
    <React.StrictMode>
      <IconCloudReact {...props} />
    </React.StrictMode>
  );
  return root; // Return the root so Svelte can unmount it later
}

export function updateReactGlobe(root, props) {
  root.render(
    <React.StrictMode>
      <IconCloudReact {...props} />
    </React.StrictMode>
  );
}

export function unmountReactGlobe(root) {
  root.unmount();
}