import { Plugin } from 'webpack';

interface HtmlWebpackPDFPluginOptions {
  /**
   * Path where to save compiled assets
   */
  outputPath?: string;
}

interface HtmlWebpackPDFPlugin extends Plugin {
  new (options?: HtmlWebpackPDFPluginOptions): HtmlWebpackPDFPlugin;
}

declare const htmlWebpackPDFPlugin: HtmlWebpackPDFPlugin;
export = htmlWebpackPDFPlugin
