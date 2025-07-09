
declare let L:any;

export class Config {
  getMaxZoom(){
    const crop = this.getCropSize();
    const dim = this.getDim();
    const m = Math.max(dim.w, dim.h) / crop;
    return Math.log2(m) - 1; //-1 because zoom0 is included (zoom 0,1,2,3,4 is 5 values)
  }
  fullImgUrl = '';
  fullImgSize = '';
  /** when using digital zoom, we say to leaflet to use tile of size 1024, but the image is only 512. leafet will zoom all images x2 */
  digitalZoom = 0;
  /** if true, pos used for icons represent pixels. ex: so you can position icon by using the img in paint.
      if false, pos use the internal leeaflet reference system. you must use leaflet to position the icons */
  usePxRefForIconPos = false;

  getTotalMaxZoom(){
    return this.getMaxZoom() + this.digitalZoom;
  }
  getUrl(){
    return '';
  }
  getDim(){
    return {w:32768,h:32768};
  }
  getCropSize(){
    return 1024;
  }
  getBottomRight(){
    return [
      -this.getDim!().h / (2 ** this.getMaxZoom()),
      this.getDim!().w / (2 ** this.getMaxZoom())
    ];
  }
  getInitialView(){
    return {pos:[-256,256], zoom:1};
  }
  convertWHToPixel(obj:[number,number]) : [number, number]{
    if(!this.usePxRefForIconPos)
      return obj;

    const br = this.getBottomRight();
    const dim = this.getDim();
    // wh / totalWh  ==  px / totalPx
    // => px = wh / totalWh * totalPx
    return [
      obj[0] / br[0] * dim.h,
      obj[1] / br[1] * dim.w,
    ];
  }
  convertPixelToWH(px:[number,number]){
    if(!this.usePxRefForIconPos)
      return px;

    const br = this.getBottomRight();
    const dim = this.getDim();
    // wh / totalWh  ==  px / totalPx
    // => wh = px / totalPx * totalWh
    return [
      px[0] / dim.h * br[0],
      px[1] / dim.w * br[1],
    ];
  }
  nonDetailedImageBounds:[[number,number], [number,number]] | null = null;
  noActionIconUrls = ["glitch.png","skip.png"];
  sizeData = <DictObj<{w:number,h:number}>>{};
  contributors:{href?:string,text:string}[] = [];
  speedrunLinks:{href?:string,text:string}[] = [];
  myMapParams = function(this:Config) : any {
    if(!this.getBottomRight)
      throw new Error('!this.getBottomRight');
    const br = this.getBottomRight();
    if(!br)
      throw new Error('!br');

    const bounds = [[0,0], br];
    return {
      crs: L.CRS.Simple,
      minZoom: 0,
      maxZoom: this.getTotalMaxZoom(),
      maxBoundsViscosity:1,
      bounds:bounds,
      maxBounds:bounds,
    };
  };
  mainImgOpacity = 1;
  DEBUG = window.location.href.includes('localhost');
  mapIsSplitInMultipleImages = true;
  saveEditorUrl:string | null = null;
  saveEditorSrcUrl:string | null = null;
  localStorage = {
    visibleLayers:"hkMapVisibleLayers",
    state:"",
  };
  alternativeMap:{text:string,href:string} | null = null;
  mapPosIdx = 0;
  nonDetailedImageUrl:string | null = null;
  /** bad trick to make icons smaller or bigger on certain maps. its a patch. the real solution would be to consider the maxZoom when determining the zoom */
  mapZoomIconScaleModifier = 0;

  static c = new Config();
  static init(c:Partial<Config>){
    for(const i in c){
      if ((<any>c)[i] !== undefined)
        (<any>Config.c)[i] = (<any>c)[i];
    }
    return Config.c;
  }


  static jsonToSizeData(json:any){
    const obj:DictObj<{w:number,h:number}> = {};
    // { "filename": "arrowDown.png",  "sourceSize": {"w":94,"h":94} }
    json.frames.forEach((f:any) => {
      obj[f.filename] = f.sourceSize;
    });
    return obj;
  }
}


