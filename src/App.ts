
import ws from "ws";
import { AppConfig } from "./AppConfig";
import {wsBinary} from "./wsBinary";
import {BinSON} from "./BinSON";
import {App_httpPages} from "./App_httpPages";

import bodyParser from "body-parser";
import compression from "compression";
import ejs from "ejs"; //still do .__express hack
import express from "express";
import http from "http";

import url_favicon from "./common/img/favicon.png";

const Tk = {
  log:(...args:any[]) => console.log(...args),
  logError:(...args:any[]) => console.log(...args),
}

export class PageParam {
  location = '';
  title = 'Pokémon Completion';
  description = 'Pokémon Completion';
  scalable = true;  
  analyticDisplayCookieBar = true;
  
  url_favicon = url_favicon;
  clientData:any = null;
}
export interface App extends express.Express {
  render2:(res:express.Response,file:string,param?:Partial<PageParam>,extra?:object) => void;
  appConfig:AppConfig;
}


export interface NonGameHttpPack {
  app:App;
}

export class App_private {
  static async initialize(){
    const app = await App_private.createApp();

    const serv = new http.Server(app);
    serv.listen(app.appConfig.portNum);

    await App_private.initWebsocket(serv);
  }

  static async createApp(){
    let app = <App>express();
    app.render2 = <App['render2']>function(res,file,param,clientData){
      const p = new PageParam();
      Object.assign(p, param);
      p.clientData = clientData;
      res.set('Cache-Control', 'no-cache');
      return res.render(file, p);
    }
    app.appConfig = new AppConfig();

    if(app.appConfig.ON_PRODUCTION_SERVER){
      //redirect www
      app.use(function(req, res, next) {
        if (req.headers.host && req.headers.host.startsWith('www.')){
          const newHost = req.headers.host.slice(4);
          return res.redirect(301, 'https://' + newHost + req.originalUrl);
        }
        next();
      });

      //heroku forwards both http of port 80, and https of port 443 to port <appConfig.portNum>
      //if https, the header x-forwarded-proto is set to https
      //force https. doesnt work on localhost
      app.use(function(req, res, next) {
        //exception: we must accept http request for BattleFacilities assistant
        if(req.originalUrl.toLowerCase().includes('BattleFacilities/Emerald/Assistant/mGBA'.toLocaleLowerCase()))
          return next();

        if (req.headers['x-forwarded-proto'] !== 'https')
          res.redirect(301, 'https://' + req.hostname + req.originalUrl);
        else
          next();
      });
    }

    App_private.setCompress(app);
    app.enable('trust proxy');

    App_private.initHttpStatic(app);

    app.engine('.html', (<any>ejs).__express);
    app.set('view engine', 'html');

    App_httpPages.initHttpPages(app);

    App_private.handleSIGKILL();

    App_private.init404(app);
    
    return app;
  }

  static init404(app:App){    
    app.use(function(req, res) {
      res.status(404);
      if(!req.url.includes('.')){ //aka html page
        const filePath = app.appConfig.absolutePathFromCwd('compiled/notFound404/notFound404.html');
        app.render2(res,filePath, {
          location:'error',
        });
      } else
        res.end();
    });
  }

  static setCompress(app:App){
    app.use(compression({
      filter: function (req:any, res:any) {
        if(req.url.indexOf('.tmx') !== -1)
          return true;
        return /json|text|javascript|dart|image\/svg\+xml|application\/x-font-ttf|application\/vnd\.ms-opentype|application\/vnd\.ms-fontobject/.test(res.getHeader('Content-Type'));
      }
    }));  //needed otherwise cant parse init info
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
  }

  static initHttpStatic(app:App){ //required for game to work
    ['webpackAssets','compiled'].forEach(what => {
      const route = app.appConfig.absolutePathFromCwd(what);
      app.get(`/${what}/*`, function(req, res, next){
        if(req.url.toLowerCase().includes('.js.map'))
          return res.end();

        req.url = req.url.replace('/' + what,'');
        res.header('cache-control', 'public, max-age=31536000');  //1 year
        next();
      }, express.static(route));
    });
  }

  static handleSIGKILL(){
    process.on('SIGINT', function() {
      Tk.log('SIGINT');
      process.exit(1);
    });
    process.on('SIGTERM', function() {
      Tk.log('SIGTERM');
      process.exit(1);
    });
  }

  static async initWebsocket(serv:http.Server){
    const MB = 1000000;
    BinSON.init({
      Buffer:Buffer,
      bufferSize:MB,
      startOffset:1,
      logHandler:Tk.log,
      errorHandler(msg,data){
        Tk.logError(msg, data);
      }
    });

    await wsBinary.initServer(ws, serv,{
      errorHandler(msg:Error){
        Tk.logError(msg,'bison')
      },
    });

    //wsBinary.getSocketOptions.push in pokemonBattleTower_server

    return wsBinary;
  }
}


