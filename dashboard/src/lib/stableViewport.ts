/**
 * Lock a stable viewport height so mobile browser chrome
 * (URL / search bar show-hide) does not resize layout or fight scroll.
 * Updates only on orientation change, not on every visualViewport resize.
 */
export function lockStableViewport() {
  if (typeof window === "undefined") return;

  const apply = () => {
    const height = window.innerHeight;
    const root = document.documentElement;
    root.style.setProperty("--app-height", `${height}px`);
    root.style.setProperty("--stable-vh", `${height * 0.01}px`);
  };

  apply();

  const onOrientation = () => {
    window.setTimeout(apply, 250);
  };

  window.addEventListener("orientationchange", onOrientation);

  // Rare: first paint before chrome settles
  window.setTimeout(apply, 0);

  return () => {
    window.removeEventListener("orientationchange", onOrientation);
  };
}
