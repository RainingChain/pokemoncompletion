import path from "path";

export class AppConfig {
  //#################################
  //ENV
  /** Server id as number. */
  portNum:number = +(process.env.PORT || 3000)!;
  HEROKU_APP_ID = process.env.HEROKU_APP_ID;
  HEROKU_API_TOKEN = process.env.HEROKU_API_TOKEN;
  //DEBUG_PORT env ini also important for debugging. check Performance.ts for info
  /** CWD is the directory of the file starting file of the node process */
  CWD:string = process.cwd();
  /** ROOT is the top-most directory, containing package.json  */
  ROOT:string = path.join(this.CWD, '..');
  ON_PRODUCTION_SERVER = !!process.env.HEROKU_APP_ID;

  constructor(){
    console.log(this.CWD, this.ROOT);
  }
  absolutePathFromCwd(...seg:string[]){
    return <FileServerPath>path.join(this.ROOT, 'dist', ...seg);
  }
  clientPathToServerPath(...seg:string[]){
     return <FileServerPath>path.join(this.CWD, ...seg);
  }
}