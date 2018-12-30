'use strict';
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');
const tmp = require('tmp');
const puppeteer = require('puppeteer');

function HtmlWebpackPDFPlugin(options) {
    options = options || {};
    this.outputPath = options.outputPath;
}

HtmlWebpackPDFPlugin.prototype.apply = function (compiler) {
    const self = this;

    compiler.hooks.compilation.tap('HtmlWebpackPDF', function (compilation) {
        if (compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration) {
            compilation.hooks.htmlWebpackPluginAfterEmit.tapAsync('HtmlWebpackPDF', function (htmlPluginData, callback) {
                self.writePDFToDisk(compilation, htmlPluginData.plugin.options, htmlPluginData.outputName, callback);
            });
        } else {
            const HtmlWebpackPlugin = require('html-webpack-plugin');
            const hooks = HtmlWebpackPlugin.getHooks(compilation);

            hooks.afterEmit.tapAsync('HtmlWebpackPDF', function (htmlPluginData, callback) {
                self.writePDFToDisk(compilation, htmlPluginData.plugin.options, htmlPluginData.outputName, callback);
            });
        }
    });
};

/**
 * Writes an asset to disk as PDF
 */
HtmlWebpackPDFPlugin.prototype.writePDFToDisk = function (compilation, htmlWebpackPluginOptions, webpackHtmlFilename, callback) {
    // Skip if the plugin configuration didn't set `alwaysWriteToDisk` to true
    if (!htmlWebpackPluginOptions.writePDF) {
        return callback(null);
    }
    // Prepare the folder
    const htmlPath = path.resolve(this.outputPath || compilation.compiler.outputPath, webpackHtmlFilename);
    const htmlName = path.parse(htmlPath).name;
    const outputDirectory = path.dirname(htmlPath);
    const pdfPath = path.join(outputDirectory, htmlName + '.pdf');

    mkdirp(outputDirectory, function (err) {
        if (err) {
            return callback(err);
        }

        tmp.file(
            {
                dir: outputDirectory,
                postfix: '.html'
            },
            function _tempFileCreated(err, tmpFilePath, _, cleanupCallback) {
                if (err) throw err;

                // Write to disk
                fs.writeFile(tmpFilePath, compilation.assets[webpackHtmlFilename].source(), function (err) {
                    if (err) {
                        return callback(err);
                    }

                    puppeteer.launch()
                        .then((browser) => {
                            browser.newPage().then(
                                (page) => {
                                    page.goto(
                                        'file://' + tmpFilePath, {waitUntil: 'networkidle0'}
                                    ).then(() => {
                                        debugger;
                                        page.pdf({
                                            path: pdfPath,
                                            ...htmlWebpackPluginOptions.writePDF
                                        }).then(() => {
                                            browser.close();
                                            cleanupCallback();
                                            callback(null);
                                        })
                                    })
                                }
                            )
                        })
                });
            });
    });
};

module.exports = HtmlWebpackPDFPlugin;
