require('babel-polyfill');

const isRelease = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'dev';

const path = require('path');
const commonConfig = require('./webpack.common.config');
const RsyncPlugin = require('./RsyncPlugin');
const UglifyJsPlugin = require('webpack').optimize.UglifyJsPlugin;
const BannerPlugin = require('webpack').BannerPlugin;
const version = isRelease ? require('../package.json').version : 'dev';

const lib = path.resolve('src/lib');
const thirdParty = path.resolve('src/third-party');
const staticFolder = path.resolve('dist', version);

const languages = isRelease ? [
    'en-AU',
    'en-CA',
    'en-GB',
    'en-US',
    'da-DK',
    'de-DE',
    'es-ES',
    'fi-FI',
    'fr-CA',
    'fr-FR',
    'it-IT',
    'ja-JP',
    'ko-KR',
    'nb-NO',
    'nl-NL',
    'pl-PL',
    'pt-BR',
    'ru-RU',
    'sv-SE',
    'tr-TR',
    'zh-CN',
    'zh-TW'
] : ['en-US']; // Only 1 language needed for dev

/* eslint-disable key-spacing */
function updateConfig(conf, language, index) {
    const config = Object.assign(conf, {
        entry: {
            preview:        [`${lib}/preview.js`],
            image:          [`${lib}/viewers/image/image.js`],
            'multi-image':  [`${lib}/viewers/image/multi-image.js`],
            swf:            [`${lib}/viewers/swf/swf.js`],
            text:           [`${lib}/viewers/text/text.js`],
            csv:            [`${lib}/viewers/text/csv.js`],
            document:       [`${lib}/viewers/doc/document.js`],
            presentation:   [`${lib}/viewers/doc/presentation.js`],
            markdown:       [`${lib}/viewers/text/markdown.js`],
            mp4:            [`${lib}/viewers/media/mp4.js`],
            mp3:            [`${lib}/viewers/media/mp3.js`],
            dash:           [`${lib}/viewers/media/dash.js`],
            error:          [`${lib}/viewers/error/error.js`],
            box3d:          [`${lib}/viewers/box3d/box3d.js`],
            model3d:        [`${lib}/viewers/box3d/model3d/model3d.js`],
            image360:       [`${lib}/viewers/box3d/image360/image360.js`],
            video360:       [`${lib}/viewers/box3d/video360/video360.js`],
            iframe:         [`${lib}/viewers/iframe/iframe.js`],
            office:         [`${lib}/viewers/office/office.js`]
        },
        output: {
            path: path.resolve('dist', version, language),
            filename: '[Name].js'
        }
    });

    // Copy over image and 3rd party
    if (index === 0) {
        config.plugins.push(new RsyncPlugin(thirdParty, staticFolder));
    }

    // If this is not a release and not CI build
    //      add the Rsync plugin for local development where copying to dev VM is needed.
    //      change source maps to be inline
    if (isDev) {
        /* eslint-disable no-template-curly-in-string */
        config.plugins.push(new RsyncPlugin('dist/.', '${USER}@${USER}.dev.box.net:/box/www/assets/content-experience'));
        /* eslint-enable no-template-curly-in-string */
        config.devtool = 'inline-source-map';
    }

    if (isRelease) {
        // http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
        config.plugins.push(new UglifyJsPlugin({
            compress: {
                warnings: false, // Don't output warnings
                drop_console: true // Drop console statements
            },
            comments: false, // Remove comments
            sourceMap: false
        }));

        // Add license message to top of code
        config.plugins.push(new BannerPlugin('Box Javascript Preview SDK | Copyright 2016 Box | Licenses: https://cloud.box.com/v/preview-licenses-v1'));
    }

    // Add the babel loader
    config.module.rules.push({
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: [
            path.resolve('src/third-party'),
            path.resolve('node_modules')
        ],
        options: {}
    });

    return config;
}

const localizedConfigs = languages.map((language, index) => updateConfig(commonConfig(language), language, index));
module.exports = localizedConfigs.length > 1 ? localizedConfigs : localizedConfigs[0];