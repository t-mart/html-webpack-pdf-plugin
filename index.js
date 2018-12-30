'use strict';
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');
const tmp = require('tmp');
const puppeteer = require('puppeteer');

class HtmlWebpackPDFPlugin {
    constructor(options) {
        options = options || {};
        this.outputPath = options.outputPath;
    }

    apply(compiler) {
        const self = this;

        compiler.hooks.compilation.tap('HtmlWebpackPDF', function (compilation) {
            compilation.hooks.htmlWebpackPluginAfterEmit.tapAsync('HtmlWebpackPDF', function (htmlPluginData, callback) {
                self.writePDFToDisk(compilation, htmlPluginData.plugin.options, htmlPluginData.outputName)
                    .then(() => {
                        callback(null)
                    });
            });
        });
    };

    async writePDFToDisk(compilation, htmlWebpackPluginOptions, webpackHtmlFilename) {
        // Skip if the plugin configuration didn't set `writePDF` to true
        if (!htmlWebpackPluginOptions.writePDF) {
            return callback(null);
        }

        // Prepare the folder
        const htmlPath = path.resolve(this.outputPath || compilation.compiler.outputPath, webpackHtmlFilename);
        const htmlName = path.parse(htmlPath).name;
        const outputDirectory = path.dirname(htmlPath);
        const pdfPath = path.join(outputDirectory, htmlName + '.pdf');

        mkdirp.sync(outputDirectory);

        const tmpFile = tmp.fileSync({
            dir: outputDirectory,
            postfix: '.html'
        });

        fs.writeFileSync(tmpFile.name, compilation.assets[webpackHtmlFilename].source());

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('file://' + tmpFile.name, {waitUntil: 'networkidle0'});
        await page.pdf({
            path: pdfPath,
            ...htmlWebpackPluginOptions.writePDF
        });
        browser.close();

        tmpFile.removeCallback();
    }
}

module.exports = HtmlWebpackPDFPlugin;
