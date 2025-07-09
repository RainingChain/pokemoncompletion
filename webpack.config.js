//npm run c-d -- --content=home,server,client --deleteDist=false
//npm run c-d -- --content=home --deleteDist=false
//npm run c-d -- --content=nongame --deleteDist=false
//npm run c-d -- --content=pokemon --deleteDist=false
//npm run c-d -- --content=nongame --deleteDist=true --watch=false


//node --max-old-space-size=8192 node_modules/webpack/bin/webpack.js --content=client,server,nongame --devtool=source-map --deleteDist=true

//to debug dependencies issues:
//node --max-old-space-size=8192 node_modules/webpack/bin/webpack.js --content=client --profile --json > stats.json

//to debug bundle size
//npm run c-p-quick -- --content=client

//process.traceDeprecation = true;

const profileWebpackPerf = false;
const bundleAnalyzer = false;

import fs from "fs/promises";
import path, { dirname } from "path";
import { fileURLToPath } from 'url';
import webpack from "webpack";
import merge from 'webpack-merge';
import nodeExternals from "webpack-node-externals";

import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

//dev-only
import CleanTerminalPlugin from 'clean-terminal-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

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

let rawLoader = function(){
 return {
    test: /\.(raw)$/i,
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
        rawLoader(),
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
      rawLoader(),
    ]
  },
  output: {
    path: path.resolve(__dirname,'dist/webpackAssets'),
    publicPath: '/webpackAssets/',
  },
});

let nongameConfigProd = async function(what,{pathExtra=what,useDefaultEntry=false,useChunk=false,target='es5'} = {}){
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
        hbsTemplate:path.resolve(__dirname, `./src/${pathExtra}/${what}.hbs`),
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

export default async function(env){
  let {debug,extra,watch,deleteDist,devtool} = env;
 
  log('env: ', {debug,extra,watch,deleteDist,devtool});

  if(!debug)
    await fs.rm(path.join(__dirname, 'node_modules','.cache'), {recursive:true, force:true}); //problem with .cache

  let packs = [ 
    await nongameConfigProd('pkStateEmulator',{pathExtra:'pokemonCompletion/research'}),
    await nongameConfigProd('VersionCompatibility_Gen1',{pathExtra:'pokemonCompletion/research',useDefaultEntry:true}),
    await nongameConfigProd('VersionCompatibility_Gen2',{pathExtra:'pokemonCompletion/research',useDefaultEntry:true}),
    await nongameConfigProd('VersionCompatibility_Gen3',{pathExtra:'pokemonCompletion/research',useDefaultEntry:true}),
    await nongameConfigProd('VersionCompatibility_Gen4',{pathExtra:'pokemonCompletion/research',useDefaultEntry:true}),
    await nongameConfigProd('Platinum_ForeignEntries',{pathExtra:'pokemonCompletion/research',useDefaultEntry:true}),
    await nongameConfigProd('shuffleMod',{pathExtra:'pokemonCompletion/ShuffleMod'}),
    await nongameConfigProd('notFound404'),
    await nongameConfigProd('pokemonCompletion',{useChunk:true}),
    await nongameConfigProd('SimplePage'),
    await serverConfigCommon({production:!debug}),
    await nongameConfigProd('pokemonHome',{pathExtra:'pokemonArticles/home'}),
    await nongameConfigProd('pkRngMonRating',{pathExtra:'pokemonBattleTower/pkRngMonRating'}),
    await nongameConfigProd('pkAssistant',{pathExtra:'pokemonBattleTower/pkAssistant',target:'es2021'}),
    await nongameConfigProd('pkRngAbuse',{pathExtra:'pokemonBattleTower/pkRngAbuse',target:'es2021'}),
    await nongameConfigProd('pkPtRngAbuse',{pathExtra:'pokemonBattleTower/pkPtRngAbuse',target:'es2021'}),
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
  if(deleteDist === 'true')
    await fs.rm(path.resolve(__dirname, 'dist'), {recursive:true, force:true});
  return packs;
};