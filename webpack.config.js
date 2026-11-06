//to debug dependencies issues:
//bun --bun run webpack --profile --json > stats.json

//to debug bundle size
//set bundleAnalyzer below to true, then run bun run compil-prod

//process.traceDeprecation = true;

const profileWebpackPerf = false;
const bundleAnalyzer = false;

import fs from "fs/promises";
import path, { dirname } from "path";
import { fileURLToPath } from 'url';
import { createRequire } from 'node:module';
import merge from 'webpack-merge';
import nodeExternals from "webpack-node-externals";

import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

//dev-only
import CleanTerminalPlugin from 'clean-terminal-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

// ESM interop in Bun eagerly reads webpack's deprecated export getters.
// Require the CommonJS module so only the APIs used below are accessed.
const webpack = createRequire(import.meta.url)('webpack');

const TS_LOADER = 'ts-loader';
const CSS_LOADER = 'css-loader';
const VUE_TEMPLATE_LOADER = 'vue-template-loader';
const HANDLEBARS_LOADER = 'handlebars-loader';

const __dirname = dirname(fileURLToPath(import.meta.url));

let assetLoader = function(){
  let main = {
    type: 'asset',
    test: /\.(png|webp|tmx|jpg|woff|woff2|svg|ogg|mp4|mp3|txt|csv|wav|lua)$/i,
    generator: {
      filename:'[name]@[contenthash][ext]',
    },
    parser: {
      dataUrlCondition: {
        maxSize: 1 * 1024 // smaller than 1kb => inline. otherwise, http request. doesnt affect node
      }
    }
  };

  return [main];
};

let markdownLoader = function(){
 return {
    test: /\.md$/i,
    type: 'asset/source'
  };
}

let log = function(...args){
  let c = console;
  c.log(...args);
};

let tsLoader = function(options={}){
  return {
    test: /\.tsx?$/,
    use: {
      loader:TS_LOADER,
      options,
    },
    exclude: /node_modules/,
  };
}

let myHtmlWebpackPlugin = function({
  production=false,
  hbsTemplate='',
  templateParameters={},
  htmlFilename='',
  cssFilename='',
  cssChunkFilename='',}
){
  let arr = [];
  arr.push(
    new MiniCssExtractPlugin({
      filename: cssFilename,
      ...(cssChunkFilename ? {chunkFilename:cssChunkFilename} : {}),
      ignoreOrder: false,
    })
  );
  arr.push(
    new HtmlWebpackPlugin({
      hash: true,
      template:hbsTemplate,
      templateParameters,
      inject:false,
      filename:htmlFilename,
      scriptLoading:'defer',
      ...(production ? {minify:{
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
      }} : {}),
    }),
  );

  if(bundleAnalyzer)
    arr.push(new BundleAnalyzerPlugin());

  return arr;
}


let commonConfig = ({production}) => ({
  stats: 'minimal', //{ children: false, assets:false, },
  plugins: [
    new CleanTerminalPlugin(),
    ...(profileWebpackPerf ? [new webpack.debug.ProfilingPlugin({
      outputPath: path.join(__dirname, `./webpackPerf_${Math.random()}.json`),
    })] : [])
  ],
  resolve:{
    symlinks:false,
    fallback:{process:false},
    modules: [__dirname, 'node_modules'],
    extensions: [ '.ts', '.js', '.vue' ],  //priority order. import "hey" imports hey.ts
  },
  performance: {
    maxEntrypointSize: 512000,
    maxAssetSize: 1024000
  },
  cache: production ? false : {
    type: 'filesystem',
    buildDependencies: {
    }
  },
});

let nodeConfigCommon2 = ({production}) => {
  return merge(commonConfig({production}), {
    target: "node",
    externalsPresets: { node: true },
    externals: [nodeExternals({importType:'import'})], // keep node_modules untouched. ex: import('mongodb') without including mongodb source code
    externalsType: "import",
    experiments: { outputModule: true, },
    output: {
      libraryTarget:"module",
      chunkFormat: "module",
    },
  });
}

let nodeConfigCommon = ({production}) => {
  return merge(nodeConfigCommon2({production}), {
    devtool:production ? "source-map" : false, // "eval-source-map",
    output: {
      path: path.resolve(__dirname,'dist/webpackAssets'),
      publicPath: '/webpackAssets/',
      pathinfo: false,
    },
    optimization: {
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false,
      minimize: false,
    },
    performance : {hints : false},
    module:{
      rules:[
        ...assetLoader(),
        markdownLoader(),
        {
          test: /\.css$/i,
          resourceQuery: /^\?url$/,
          type: 'asset/resource',
          generator: {filename:'[name]@[contenthash][ext]'},
        },
        tsLoader({
          transpileOnly:!production,
          compilerOptions:{
            module:'esnext',
            declaration:false,
          },
        }),
      ]
    },
  });
};

let serverConfigCommon = (params) => {
  return merge(nodeConfigCommon(params), {
    entry: './entry.ts',
    output: {filename:'../app.js',},
    plugins: [
      new CleanTerminalPlugin(),
      new CopyWebpackPlugin({
        patterns: [{
          from: path.resolve(__dirname, 'src/pokemonCompletion/PkCompletionist'),
          to: path.resolve(__dirname, 'dist/PkCompletionist'),
        }],
      }),
    ],
  });
}

let webConfigCommon = ({} = {}) => ({
  target: "web",
  module: {
    rules:[
      {test: /\.css$/i, use: [MiniCssExtractPlugin.loader, CSS_LOADER]},
      {test: /\.vue$/, loader: VUE_TEMPLATE_LOADER},
      {test: /\.hbs$/, loader: HANDLEBARS_LOADER },
      ...assetLoader(),
      markdownLoader(),
    ]
  },
  output: {
    path: path.resolve(__dirname,'dist/webpackAssets'),
    publicPath: '/webpackAssets/',
  },
});

let nongameConfigProd = async function(what,{
  pathExtra=what,useDefaultEntry=false,useChunk=false,target='es5',
  hbsTemplate=`${pathExtra}/${what}.hbs`,templateParameters={},
} = {}){
  //await fs.remove(path.resolve(__dirname, `dist/compiled/${pathExtra}`));
  return merge(commonConfig({production:true}),webConfigCommon(),{
    entry: useDefaultEntry ? `./src/common/js/LoadHeaderFooter.ts` : `./src/${pathExtra}/${what}.ts`,
    output: {
      filename: `../compiled/${pathExtra}/${what}.js`,
      ...(useChunk ? {chunkFilename: `../compiled/${pathExtra}/${what}.[id].[contenthash].bundle.js`} : {}),
    },
    module: {
      rules:[tsLoader({
        transpileOnly:true,
        compilerOptions:{target:target},
      })],
    },
    plugins:[
      ...myHtmlWebpackPlugin({
        cssFilename: `../compiled/${pathExtra}/${what}.css`,
        cssChunkFilename:useChunk ? `../compiled/${pathExtra}/${what}.[id].[contenthash].bundle.css` : '',
        hbsTemplate:path.resolve(__dirname, 'src', hbsTemplate),
        templateParameters,
        htmlFilename:path.resolve(__dirname, `./dist/compiled/${pathExtra}/${what}.html`),
        production:true,
      }),
      new webpack.IgnorePlugin({ //to ignore error
        resourceRegExp: /module/,
        contextRegExp: /PkCompletionist/,
      }),
    ]
  });
}

// Reuse source templates while retaining each page's entrypoint and output paths.
const researchConfig = (what, options={}) => nongameConfigProd(what, {
  pathExtra:'pokemonCompletion/research',
  useDefaultEntry:true,
  hbsTemplate:'common/article.hbs',
  ...options,
});

const appPageConfig = (what, mountId, options={}) => nongameConfigProd(what, {
  ...options,
  hbsTemplate:'common/app.hbs',
  templateParameters:{mountId},
});

export default async function(env){
  let {debug,extra,watch,deleteDist,devtool} = env;
 
  log('env: ', {debug,extra,watch,deleteDist,devtool});

  if(!debug)
    await fs.rm(path.join(__dirname, 'node_modules','.cache'), {recursive:true, force:true}); //problem with .cache

  let packs = [ 
    await researchConfig('pkStateEmulator'),
    await researchConfig('VersionCompatibility_Gen1'),
    await researchConfig('VersionCompatibility_Gen2'),
    await researchConfig('VersionCompatibility_Gen3'),
    await researchConfig('VersionCompatibility_Gen4'),
    await researchConfig('Platinum_ForeignEntries'),
    await researchConfig('Black2_ForeignEntries'),
    await researchConfig('Black2_Shiny'),
    await nongameConfigProd('shuffleMod',{pathExtra:'pokemonCompletion/ShuffleMod'}),
    await nongameConfigProd('notFound404'),
    await appPageConfig('pokemonCompletion','pokemonCompletion-slot',{useChunk:true}),
    await nongameConfigProd('SimplePage'),
    await serverConfigCommon({production:!debug}),
    await appPageConfig('pokemonHome','slot',{pathExtra:'pokemonArticles/home'}),
    await appPageConfig('pkRngMonRating','pkRngMonRating-slot',{pathExtra:'pokemonBattleTower/pkRngMonRating'}),
    await appPageConfig('pkAssistant','pkAssistant-slot',{pathExtra:'pokemonBattleTower/pkAssistant',target:'es2021'}),
    await appPageConfig('pkRngAbuse','main-slot',{pathExtra:'pokemonBattleTower/pkRngAbuse',target:'es2021'}),
    await appPageConfig('pkPtRngAbuse','main-slot',{pathExtra:'pokemonBattleTower/pkPtRngAbuse',target:'es2021'}),
  ];

  packs = packs.map(pack => {
    if(devtool && pack.devtool === undefined)
      pack.devtool = devtool === 'false' ? false : devtool;
    pack.mode = debug === 'true' ? 'development' : 'production';
    pack.watch = watch === 'true';
    pack.plugins = pack.plugins || [];

    if(bundleAnalyzer)
      pack.plugins.push(new BundleAnalyzerPlugin());

    return pack;
  });
  console.log(deleteDist);
  if(deleteDist === 'true')
    await fs.rm(path.resolve(__dirname, 'dist'), {recursive:true, force:true});
  return packs;
};
