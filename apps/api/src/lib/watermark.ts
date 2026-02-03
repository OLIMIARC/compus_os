import sharp from 'sharp';
import path from 'path';
import { config } from '../config/env';

export interface WatermarkOptions {
    campusName?: string;
    platformText?: string;
    opacity?: number;
}

/**
 * Apply subtle watermark to meme images
 * Watermark includes campus name and platform logo text
 */
export async function watermarkImage(
    inputPath: string,
    outputPath: string,
    options: WatermarkOptions = {}
): Promise<void> {
    const {
        campusName,
        platformText = config.platform.watermarkText,
        opacity = 0.3,
    } = options;

    try {
        // Get input image metadata
        const image = sharp(inputPath);
        const metadata = await image.metadata();
        const width = metadata.width || 1000;
        const height = metadata.height || 1000;

        // Create watermark text
        const watermarkText = campusName
            ? `${campusName} · ${platformText}`
            : platformText;

        // Calculate font size based on image width (subtle, ~2% of width)
        const fontSize = Math.max(12, Math.floor(width * 0.02));

        // Create SVG watermark
        const svgWatermark = `
      <svg width="${width}" height="${height}">
        <style>
          .watermark {
            font-family: system-ui, -apple-system, sans-serif;
            font-size: ${fontSize}px;
            font-weight: 500;
            fill: white;
            opacity: ${opacity};
          }
        </style>
        <text
          x="${width - 10}"
          y="${height - 10}"
          text-anchor="end"
          class="watermark"
        >${watermarkText}</text>
      </svg>
    `;

        // Apply watermark
        await image
            .composite([
                {
                    input: Buffer.from(svgWatermark),
                    top: 0,
                    left: 0,
                },
            ])
            .toFile(outputPath);
    } catch (error) {
        console.error('Watermarking failed:', error);
        throw new Error('Failed to watermark image');
    }
}

/**
 * Optimize and resize image if needed
 */
export async function optimizeImage(
    inputPath: string,
    outputPath: string,
    maxWidth: number = 1200
): Promise<void> {
    await sharp(inputPath)
        .resize(maxWidth, null, {
            withoutEnlargement: true,
            fit: 'inside',
        })
        .jpeg({ quality: 85, progressive: true })
        .toFile(outputPath);
}
