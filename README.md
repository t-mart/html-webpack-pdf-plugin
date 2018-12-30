# html-webpack-pdf-plugin


## Example Usage

```
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPDFPlugin = require('html-webpack-pdf-plugin');

module.exports = {
    //...
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            inject: 'body',
            writePDF: {
                format: 'Letter',
                margin: {
                    top: '1in',
                    left: '1in',
                    right: '1in',
                    bottom: '1in',
                },
            },
        }),
        new HtmlWebpackPDFPlugin(),
    ],
    //...
};

```
