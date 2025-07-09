

import { Config } from "../../genericMap/Config";
import * as json from "./pokemonCompletionIconSheet.json";

const sizeData = Config.jsonToSizeData(json);

export const SUPPORTED_DIM = [
  "icon-10x10","icon-16x16","icon-16x32","icon-32x16","icon-24x24","icon-32x32","icon-48x48","icon-48x32","icon-32x48","icon-48x64","icon-64x64","icon-64x32","icon-64x48","icon-32x64",
];
export const getIconData = function(iconUrl:string,colorClass=''){
  if(!iconUrl)
    return null;

  const filename = iconUrl;
  const spriteClass = iconUrl.replace('.png','').replace(/\//g,'-');
  let wh = sizeData[filename];
  if (!wh){
    const errMsg = `invalid icon: {iconUrl=${iconUrl}, filename=${filename}}`;
    console.error(errMsg);
    wh = {w:32, h:32};
  }
  const sizeClass = `icon-${wh.w}x${wh.h}`
  if (!SUPPORTED_DIM.includes(sizeClass))
    console.error('invalid image size', iconUrl);

  return {
    id:iconUrl,
    filename,
    spriteClass,
    colorClass,
    w:wh.w,
    h:wh.h,
    sizeClass,
  }
}