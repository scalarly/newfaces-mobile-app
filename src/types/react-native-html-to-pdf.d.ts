/**
 * Type declarations for react-native-html-to-pdf
 */

declare module 'react-native-html-to-pdf' {
  export interface PDFOptions {
    html: string;
    fileName?: string;
    directory?: string;
    width?: number;
    height?: number;
    base64?: boolean;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    padding?: number;
    bgColor?: string;
    fonts?: string[];
  }

  export interface PDFResult {
    filePath?: string;
    base64?: string;
  }

  export interface HTMLtoPDF {
    convert(options: PDFOptions): Promise<PDFResult>;
  }

  const RNHTMLtoPDF: HTMLtoPDF;
  export default RNHTMLtoPDF;
}
