// Image loading. A missing file resolves to null so the renderer can fall back to shapes
// instead of the game failing to start. onProgress(done, total) reports real progress.

export function loadImages(map, onProgress) {
  const entries = Object.entries(map);
  let done = 0;
  return Promise.all(
    entries.map(
      ([key, src]) =>
        new Promise((resolve) => {
          const img = new Image();
          const finish = (value) => {
            done += 1;
            if (onProgress) onProgress(done, entries.length);
            resolve([key, value]);
          };
          img.onload = () => finish(img);
          img.onerror = () => {
            console.warn('missing image', src);
            finish(null);
          };
          img.src = src;
        }),
    ),
  ).then(Object.fromEntries);
}
