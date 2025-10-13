import { Config } from "./Config";
declare let L:any;

const emptyImageUrl =
  "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

export const createOverlay = function (config: Config) {
  const size = config.getDim();
  const cropSize = config.getCropSize();
  const imgPerZoom: { w: number; h: number }[] = [];
  for (let zoom = 0; ; zoom++) {
    const fact = 2 ** zoom;
    const cx = size.w / fact;
    const cy = size.h / fact;
    if (cx <= cropSize && cy <= cropSize) break;
    imgPerZoom.push({
      w: Math.ceil(cx / cropSize),
      h: Math.ceil(cy / cropSize),
    });
    if (imgPerZoom.length === 6) break; //max zoom generated //BAD
  }

  const res = imgPerZoom.map((v, zoom) => {
    const fact = 2 ** (imgPerZoom.length - zoom - 1);
    const imgSizeAtZoom = cropSize / fact;
    const boundWMin = (v.w - 1) * imgSizeAtZoom;
    const boundWMax = v.w * imgSizeAtZoom;

    const boundHMin = (v.h - 1) * imgSizeAtZoom;
    const boundHMax = v.h * imgSizeAtZoom;
    return { boundWMin, boundWMax, boundHMin, boundHMax };
  });

  //boundMin is kinda useless. we take the smallest boundMax
  const boundW = res.sort((a, b) => a.boundWMax - b.boundWMax)[0].boundWMax;
  const boundH = res.sort((a, b) => a.boundHMax - b.boundHMax)[0].boundHMax;
  //log(boundH,boundW);
  //at zoom4:  each img is 1024. if we want to load 2 img, the bounds must be ]1024,2048]
  //if > 2048, we would load 3 images, if <= 1024, we would only need 1 image
  const digitalZoomFact = 2 ** config.digitalZoom;

  const maxZoom = config.getTotalMaxZoom();

  const tileLayerFallback = L.TileLayer.extend({
    getTileUrl: function (coords: { x: number; y: number; z: number }) {
      if (config.digitalZoom !== 0 && coords.z === maxZoom)
        return emptyImageUrl;

      let imgZ = maxZoom - coords.z;

      if (config.validImageSet && !config.validImageSet.has(`${imgZ}_${coords.x}_${coords.y}`))
        return emptyImageUrl;

      return L.TileLayer.prototype.getTileUrl.apply(this, [coords]);
    },
  });

  const url = config.getUrl();
  const lay = new tileLayerFallback(url, {
    tileSize: cropSize,
    zoomReverse: true,
    minZoom: 0,
    maxZoom,
    bounds: [
      [(-boundH * digitalZoomFact) / 2, 0],
      [0, (boundW * digitalZoomFact) / 2],
    ],
  });

  lay.on('tileloadstart', (obj:any) => {
    const {tile,coords} = obj;
    //TODO support both validImageSet and digitalZoom
    if (config.digitalZoom !== 0 && tile.src === emptyImageUrl){
      tile.style.backgroundImage = 'url(' + url
        .replace('{z}', '1')
        .replace('{y}', '' + Math.floor(coords.y / 2))
        .replace('{x}', '' + Math.floor(coords.x / 2)) + ')';

      const my = coords.y % 2;
      const mx = coords.x % 2;
      tile.style.visibility  = 'visible';
      tile.style.backgroundSize = '200%';
      tile.style.backgroundPositionX = mx === 0 ? '0%' : '100%';
      tile.style.backgroundPositionY = my === 0 ? '0%' : '100%';
    }
  });

  return lay;
};
