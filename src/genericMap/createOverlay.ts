import {Config} from "./Config";

export const createOverlay = function(config:Config){
    const size = config.getDim();
    const cropSize = config.getCropSize();
    const imgPerZoom:{w:number,h:number}[] = [];
    for(let zoom = 0; ; zoom++){
      const fact = 2 ** zoom;
      const cx = size.w / fact;
      const cy = size.h / fact;
      if(cx <= cropSize && cy <= cropSize)
        break;
      imgPerZoom.push({
        w:Math.ceil(cx / cropSize),
        h:Math.ceil(cy / cropSize)
      });
      if (imgPerZoom.length === 6)
        break; //max zoom generated //BAD
    }

    const res = imgPerZoom.map((v,zoom) => {
      const fact = 2 ** (imgPerZoom.length - zoom - 1);
      const imgSizeAtZoom = cropSize / fact;
      const boundWMin = (v.w - 1) * imgSizeAtZoom;
      const boundWMax = v.w * imgSizeAtZoom;

      const boundHMin = (v.h - 1) * imgSizeAtZoom;
      const boundHMax = v.h * imgSizeAtZoom;
      return {boundWMin,boundWMax, boundHMin, boundHMax};
    });

    //boundMin is kinda useless. we take the smallest boundMax
    const boundW = res.sort((a,b) => a.boundWMax - b.boundWMax)[0].boundWMax;
    const boundH = res.sort((a,b) => a.boundHMax - b.boundHMax)[0].boundHMax;
    //log(boundH,boundW);
    //at zoom4:  each img is 1024. if we want to load 2 img, the bounds must be ]1024,2048]
    //if > 2048, we would load 3 images, if <= 1024, we would only need 1 image
    const digitalZoomFact = (2 ** config.digitalZoom);
    const lay = L.tileLayer(config.getUrl(),{
      tileSize:cropSize * digitalZoomFact,
      zoomReverse:true,
      minZoom: 0,
      maxZoom: config.getTotalMaxZoom(),
      //zoomOffset:-config.digitalZoom,
      bounds:[[-boundH * digitalZoomFact / 2, 0], [ 0, boundW * digitalZoomFact / 2]],
    });

    return lay;
  }