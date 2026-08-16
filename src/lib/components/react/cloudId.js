// Shared between globe.jsx (which starts the TagCanvas instance under this
// id) and Skills.svelte (which nudges its rotation speed on scroll, talking
// to the TagCanvas global directly). Kept in its own tiny module so the
// scroll handler doesn't have to import globe.jsx's React/react-icon-cloud
// dependencies just to get a string constant.
export const CLOUD_ID = 'tech-globe';
