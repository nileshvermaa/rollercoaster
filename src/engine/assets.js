// Image loading. A missing file resolves to null so the renderer can fall back to shapes
// instead of the game failing to start.

export function loadImages(map) {
  const entries = Object.entries(map).map(
    ([key, src]) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve([key, img]);
        img.onerror = () => {
          console.warn('missing image', src);
          resolve([key, null]);
        };
        img.src = src;
      }),
  );
  return Promise.all(entries).then(Object.fromEntries);
}
