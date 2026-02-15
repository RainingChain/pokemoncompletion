
import L from "leaflet";
import { CollectableJson } from "./Collectable";

export const isMobile = () => {
  //based on chrome dino game
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/.test(window.navigator.userAgent) && window.ontouchstart !== undefined;
};

export const defaultMyMapParams = function(config:OverlayConfig) : L.MapOptions & {fullscreenControl:boolean} {
  const br = config.getBottomRightExcludingBlack();
  const bounds:[[number,number],[number,number]] = [
    [br[0] * 1.1, -br[1] * 0.1],
    [-br[0] * 0.1, br[1] * 1.1]
  ]; //bounds is [SouthWest, NorthEast].

  return {
    crs: L.CRS.Simple,
    zoomControl: false,
    minZoom: 0,
    maxZoom: config.getTotalMaxZoom(),
    maxBoundsViscosity:0.01,
    maxBounds:config.hasBounds ? bounds : undefined,
    doubleClickZoom: !isMobile() && !IS_CONTRIBUTOR_MODE,
    fullscreenControl: true,
    attributionControl: false,
  };
};

export const IS_CONTRIBUTOR_MODE = (() => {
  if (window.location.href.includes('localhost'))
    return !window.location.href.includes('prod');
  return window.location.href.includes('contributor');
})();

export const IS_MULTI_MAP_MODE = (() => {
  return window.location.href.includes('localhost') && window.location.href.includes('multi');
})();

export class OverlayConfig {
  static create(extra:Partial<OverlayConfig>){
    const c = new OverlayConfig();
    Object.assign(c, extra);
    return c;
  }
  idx = 0;
  name = 'Screenshots Image';
  getMaxZoom(){
    const crop = this.getCropSize();
    const dim = this.getDim();
    const m = Math.max(dim.w, dim.h) / crop;
    return Math.log2(m) - 1; //-1 because zoom0 is included (zoom 0,1,2,3,4 is 5 values)
  }
  /** when using digital zoom, we say to leaflet to use tile of size 1024, but the image is only 512. leafet will zoom all images x2 */
  digitalZoom = 0;

  getTotalMaxZoom(){
    return this.getMaxZoom() + this.digitalZoom;
  }
  getUrl(){
    return '';
  }
  getDim(){
    return {w:32768,h:32768};
  }
  getDimExcludingBlack(){
    return this.getDim();
  }
  getCropSize(){
    return 1024;
  }
  getMarkerPos(col:CollectableJson) : [number,number] | null {
    return <[number,number]>col.pos;
  }
  hasBounds = true;
  getBottomRightExcludingBlack(){
    return [
      -this.getDimExcludingBlack!().h / (2 ** this.getMaxZoom()),
      this.getDimExcludingBlack!().w / (2 ** this.getMaxZoom())
    ];
  }
  getInitialView(){
    return {pos:[-256,256], zoom:1};
  }
  getLeafMapOpts = function(this:OverlayConfig) : L.MapOptions {
    return defaultMyMapParams(this);
  };

  validImageSet:Set<string> | null = null; //if null, assumes they all exist
}

export class Config {
  overlays:OverlayConfig[] = [];
  fullImgUrl = '';
  fullImgSize = '';
  nonDetailedImageBounds:[[number,number], [number,number]] | null = null;
  contributors:{
    title:string,
    fontSize?:string,
    list:{href?:string,text:string,html?:string}[]
  }[] = [];
  mapIsSplitInMultipleImages = true;
  saveEditorUrl:string | null = null;
  saveEditorSrcUrl:string | null = null;
  saveVersion:'1.1' = '1.1';
  localStorage = {
    visibleLayers:"",
    state:"",
    viewPanel:'',
    overlay:''
  };
  hasSaveFlagEvaluator = false;
  nonDetailedImageUrl:string | null = null;
  /** bad trick to make icons smaller or bigger on certain maps. its a patch. the real solution would be to consider the maxZoom when determining the zoom */
  mapZoomIconScaleModifier = 0;

  static create(extra:Partial<Config>){
    const c = new Config();
    Object.assign(c, extra);
    return c;
  }

  static iconSizeData:DictObj<{w:number,h:number}> = {};

  static jsonToSizeData(json:{
    frames:{
      filename:string,
      sourceSize:{w:number,h:number}
      }[]
    }){
    const obj:DictObj<{w:number,h:number}> = {};
    // { "filename": "arrowDown.png",  "sourceSize": {"w":94,"h":94} }
    json.frames.forEach(f => {
      obj[f.filename] = f.sourceSize;
    });
    return obj;
  }
}


