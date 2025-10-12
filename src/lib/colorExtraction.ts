export function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve('rgba(100, 100, 100, 0.1)');
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const colorCounts: { [key: string]: number } = {};

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a < 128) continue;

          if (r > 240 && g > 240 && b > 240) continue;
          if (r < 15 && g < 15 && b < 15) continue;

          const bucket = `${Math.floor(r / 20)}-${Math.floor(g / 20)}-${Math.floor(b / 20)}`;
          colorCounts[bucket] = (colorCounts[bucket] || 0) + 1;
        }

        let dominantBucket = '';
        let maxCount = 0;

        for (const [bucket, count] of Object.entries(colorCounts)) {
          if (count > maxCount) {
            maxCount = count;
            dominantBucket = bucket;
          }
        }

        if (dominantBucket) {
          const [r, g, b] = dominantBucket.split('-').map(n => parseInt(n) * 20 + 10);
          resolve(`rgba(${r}, ${g}, ${b}, 0.1)`);
        } else {
          resolve('rgba(100, 100, 100, 0.1)');
        }
      } catch (error) {
        console.error('Error extracting color:', error);
        resolve('rgba(100, 100, 100, 0.1)');
      }
    };

    img.onerror = () => {
      resolve('rgba(100, 100, 100, 0.1)');
    };

    img.src = imageUrl;
  });
}

const colorCache = new Map<string, string>();

export async function getCachedDominantColor(imageUrl: string): Promise<string> {
  if (colorCache.has(imageUrl)) {
    return colorCache.get(imageUrl)!;
  }

  const color = await extractDominantColor(imageUrl);
  colorCache.set(imageUrl, color);
  return color;
}
