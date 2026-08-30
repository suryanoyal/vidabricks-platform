import QRCode from 'qrcode';
import { BLACK_LOGO_DATA_URI, BLACK_LOGO_SRC, BLACK_LOGO_ASPECT_RATIO } from './blackLogoBase64';

export interface QROptions {
  margin?: number;
  width?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  includeLogo?: boolean;
}

const DEFAULT_QR_OPTIONS: QROptions = {
  margin: 2,
  width: 1024,
  color: {
    dark: '#111111',
    light: '#ffffff',
  },
  includeLogo: true,
};

// Cached image object for fast re-renders
let cachedBlackLogoImage: HTMLImageElement | null = null;

async function loadBlackLogoImage(): Promise<HTMLImageElement | null> {
  if (typeof window === 'undefined') return null;
  if (cachedBlackLogoImage && cachedBlackLogoImage.complete && cachedBlackLogoImage.naturalWidth > 0) {
    return cachedBlackLogoImage;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      cachedBlackLogoImage = img;
      resolve(img);
    };
    img.onerror = () => {
      // Fallback to direct src if data URI has an issue
      img.src = BLACK_LOGO_SRC;
      img.onload = () => {
        cachedBlackLogoImage = img;
        resolve(img);
      };
      img.onerror = () => resolve(null);
    };
    img.src = BLACK_LOGO_DATA_URI;
  });
}

/**
 * Generate a PNG Data URL for a URL with embedded official Vidabricks black logo
 */
export async function generateAgentQRCodeDataUrl(
  text: string,
  options?: QROptions
): Promise<string> {
  const opts = { ...DEFAULT_QR_OPTIONS, ...options };
  
  // 1. Generate base QR code on a canvas
  const canvas = document.createElement('canvas');
  const size = opts.width || 1024;
  canvas.width = size;
  canvas.height = size;

  await QRCode.toCanvas(canvas, text, {
    errorCorrectionLevel: 'H', // Highest error correction (30% recovery)
    margin: opts.margin ?? 2,
    width: size,
    color: {
      dark: opts.color?.dark || '#111111',
      light: opts.color?.light || '#ffffff',
    },
  });

  if (opts.includeLogo) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const center = size / 2;
      
      // Badge dimensions tailored for 850x292 Black Logo aspect ratio
      const badgeW = Math.floor(size * 0.28);
      const badgeH = Math.floor(size * 0.20);
      const badgeX = Math.floor(center - badgeW / 2);
      const badgeY = Math.floor(center - badgeH / 2);
      const radius = Math.floor(size * 0.028);

      ctx.save();
      
      // 1. White background container
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
      ctx.shadowBlur = Math.floor(size * 0.02);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = Math.floor(size * 0.005);

      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, radius);
      ctx.fill();

      // 2. Subtle luxury border
      ctx.shadowColor = 'transparent';
      ctx.lineWidth = Math.max(2, Math.floor(size * 0.006));
      ctx.strokeStyle = '#111111';
      ctx.stroke();

      // 3. Draw official black logo with bg inside
      const img = await loadBlackLogoImage();
      if (img) {
        const logoW = Math.floor(badgeW * 0.88);
        const logoH = Math.floor(logoW / BLACK_LOGO_ASPECT_RATIO);
        const logoX = Math.floor(center - logoW / 2);
        const logoY = Math.floor(center - logoH / 2);

        ctx.drawImage(img, logoX, logoY, logoW, logoH);
      } else {
        // Fallback text if image cannot load
        ctx.fillStyle = '#111111';
        ctx.font = `bold ${Math.floor(badgeH * 0.42)}px 'Plus Jakarta Sans', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('VIDABRICKS', center, center);
      }

      ctx.restore();
    }
  }

  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Generate an SVG string for a URL with embedded official Vidabricks black logo
 */
export async function generateAgentQRCodeSvg(
  text: string,
  options?: QROptions
): Promise<string> {
  const opts = { ...DEFAULT_QR_OPTIONS, ...options };
  const size = opts.width || 800;

  const rawSvg = await QRCode.toString(text, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: opts.margin ?? 2,
    width: size,
    color: {
      dark: opts.color?.dark || '#111111',
      light: opts.color?.light || '#ffffff',
    },
  });

  if (!opts.includeLogo) {
    return rawSvg;
  }

  const center = size / 2;
  const badgeW = Math.floor(size * 0.28);
  const badgeH = Math.floor(size * 0.20);
  const badgeX = Math.floor(center - badgeW / 2);
  const badgeY = Math.floor(center - badgeH / 2);
  const radius = Math.floor(size * 0.028);

  const logoW = Math.floor(badgeW * 0.88);
  const logoH = Math.floor(logoW / BLACK_LOGO_ASPECT_RATIO);
  const logoX = Math.floor(center - logoW / 2);
  const logoY = Math.floor(center - logoH / 2);

  const logoSvg = `
    <!-- Official Vidabricks Black Logo Badge -->
    <g id="vb-center-black-logo">
      <rect x="${badgeX}" y="${badgeY}" width="${badgeW}" height="${badgeH}" rx="${radius}" fill="#ffffff" stroke="#111111" stroke-width="${Math.max(2, Math.floor(size * 0.006))}" filter="drop-shadow(0px 4px 8px rgba(0,0,0,0.18))" />
      <image href="${BLACK_LOGO_DATA_URI}" x="${logoX}" y="${logoY}" width="${logoW}" height="${logoH}" preserveAspectRatio="xMidYMid meet" />
    </g>
  `;

  return rawSvg.replace('</svg>', `${logoSvg}</svg>`);
}

/**
 * Trigger browser download of PNG QR code
 */
export async function downloadQRCodePng(
  text: string,
  fileName: string,
  width: number = 1024,
  options?: Partial<QROptions>
): Promise<void> {
  const dataUrl = await generateAgentQRCodeDataUrl(text, {
    width,
    ...options,
  });

  const link = document.createElement('a');
  link.download = `${fileName}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Trigger browser download of SVG QR code
 */
export async function downloadQRCodeSvg(
  text: string,
  fileName: string,
  width: number = 800,
  options?: Partial<QROptions>
): Promise<void> {
  const svgString = await generateAgentQRCodeSvg(text, {
    width,
    ...options,
  });

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.download = `${fileName}.svg`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
