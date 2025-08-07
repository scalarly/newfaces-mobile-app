/**
 * PDF Service - PDF generation using react-native-html-to-pdf
 * Replaces expo PDF functionality
 */

import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Platform } from 'react-native';
import { fileSystemService } from './FileSystemService';
import { PDFExportOptions, GalleryImage } from '../types';

export interface PDFGenerationResult {
  filePath: string;
  fileName: string;
  size: number;
}

export class PDFService {
  private static instance: PDFService;

  private constructor() {}

  static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  /**
   * Generate PDF from selected images
   */
  async generatePDFFromImages(options: PDFExportOptions): Promise<PDFGenerationResult> {
    const {
      selectedImages,
      title = 'Gallery Export',
      fileName,
      quality = 0.8,
      format = 'A4',
      orientation = 'portrait',
    } = options;

    try {
      // Convert images to base64 for embedding
      const imageData = await this.prepareImagesForPDF(selectedImages);
      
      // Generate HTML content
      const htmlContent = this.generateHTMLContent({
        title,
        images: imageData,
        format,
        orientation,
      });

      // Generate PDF
      const pdfOptions = {
        html: htmlContent,
        fileName: fileName || `gallery_export_${Date.now()}`,
        directory: Platform.OS === 'android' ? 'Downloads' : 'Documents',
        width: this.getPageWidth(format),
        height: this.getPageHeight(format, orientation),
        base64: false,
      };

      const result = await RNHTMLtoPDF.convert(pdfOptions);
      
      if (!result.filePath) {
        throw new Error('PDF generation failed - no file path returned');
      }

      // Get file info
      const fileInfo = await fileSystemService.getFileInfo(result.filePath);

      return {
        filePath: result.filePath,
        fileName: pdfOptions.fileName + '.pdf',
        size: parseInt(fileInfo.size.toString()),
      };
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw error;
    }
  }

  /**
   * Prepare images for PDF by converting to base64
   */
  private async prepareImagesForPDF(images: GalleryImage[]): Promise<Array<{
    id: string;
    title: string;
    base64: string;
    mimeType: string;
  }>> {
    const imageData = [];

    for (const image of images) {
      try {
        let base64Data: string;
        
        if (image.path.startsWith('http')) {
          // Download image first if it's a URL
          const downloadResult = await fileSystemService.downloadFile({
            url: image.path,
            fileName: `temp_${image.id}.jpg`,
          });
          base64Data = await fileSystemService.readFileAsBase64(downloadResult.path);
          // Clean up temp file
          await fileSystemService.deleteFile(downloadResult.path);
        } else {
          // Read local file
          base64Data = await fileSystemService.readFileAsBase64(image.path);
        }

        imageData.push({
          id: image.id,
          title: image.title,
          base64: base64Data,
          mimeType: image.mimeType || 'image/jpeg',
        });
      } catch (error) {
        console.warn(`Failed to process image ${image.id}:`, error);
        // Continue with other images
      }
    }

    return imageData;
  }

  /**
   * Generate HTML content for PDF
   */
  private generateHTMLContent(options: {
    title: string;
    images: Array<{
      id: string;
      title: string;
      base64: string;
      mimeType: string;
    }>;
    format: string;
    orientation: string;
  }): string {
    const { title, images, orientation } = options;
    
    const isLandscape = orientation === 'landscape';
    const pageWidth = isLandscape ? '297mm' : '210mm';
    const pageHeight = isLandscape ? '210mm' : '297mm';
    const imageWidth = isLandscape ? '260mm' : '180mm';
    const imageMaxHeight = isLandscape ? '170mm' : '240mm';

    const imagesHtml = images.map(image => `
      <div class="image-container">
        <img 
          src="data:${image.mimeType};base64,${image.base64}"
          alt="${image.title}"
          class="gallery-image"
        />
        <p class="image-title">${image.title}</p>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          @page {
            size: ${pageWidth} ${pageHeight};
            margin: 20mm;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
            line-height: 1.6;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
          }
          
          .header h1 {
            font-size: 28px;
            color: #2c3e50;
            margin: 0;
            font-weight: 600;
          }
          
          .header p {
            color: #7f8c8d;
            margin: 10px 0 0 0;
            font-size: 14px;
          }
          
          .image-container {
            page-break-inside: avoid;
            margin-bottom: 40px;
            text-align: center;
            padding: 20px;
            border: 1px solid #ecf0f1;
            border-radius: 8px;
            background: #fafafa;
          }
          
          .gallery-image {
            max-width: ${imageWidth};
            max-height: ${imageMaxHeight};
            width: auto;
            height: auto;
            border-radius: 6px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            display: block;
            margin: 0 auto;
          }
          
          .image-title {
            margin-top: 15px;
            font-size: 16px;
            font-weight: 500;
            color: #34495e;
            text-align: center;
          }
          
          .footer {
            position: fixed;
            bottom: 10mm;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 10px;
            color: #95a5a6;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
          <p>${images.length} image${images.length !== 1 ? 's' : ''}</p>
        </div>
        
        ${imagesHtml}
        
        <div class="footer">
          <p>Gallery Export - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get page width for different formats
   */
  private getPageWidth(format: string): number {
    switch (format) {
      case 'A4':
        return 595; // A4 width in points
      case 'Letter':
        return 612; // Letter width in points
      default:
        return 595;
    }
  }

  /**
   * Get page height for different formats
   */
  private getPageHeight(format: string, orientation: string): number {
    const isLandscape = orientation === 'landscape';
    
    switch (format) {
      case 'A4':
        return isLandscape ? 595 : 842; // A4 height in points
      case 'Letter':
        return isLandscape ? 612 : 792; // Letter height in points
      default:
        return isLandscape ? 595 : 842;
    }
  }

  /**
   * Generate simple PDF with text content
   */
  async generateTextPDF(content: string, fileName?: string): Promise<PDFGenerationResult> {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              line-height: 1.6;
            }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>Gallery Report</h1>
          <div>${content}</div>
        </body>
        </html>
      `;

      const pdfOptions = {
        html: htmlContent,
        fileName: fileName || `report_${Date.now()}`,
        directory: Platform.OS === 'android' ? 'Downloads' : 'Documents',
        base64: false,
      };

      const result = await RNHTMLtoPDF.convert(pdfOptions);
      
      if (!result.filePath) {
        throw new Error('PDF generation failed');
      }

      const fileInfo = await fileSystemService.getFileInfo(result.filePath);

      return {
        filePath: result.filePath,
        fileName: pdfOptions.fileName + '.pdf',
        size: parseInt(fileInfo.size.toString()),
      };
    } catch (error) {
      console.error('Text PDF generation failed:', error);
      throw error;
    }
  }
}

export const pdfService = PDFService.getInstance();
