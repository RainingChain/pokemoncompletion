
import "../../common/css/common.css";
import "../../common/css/globalStyle.css";
import "../../pokemonArticles/home/pokemonGlobal.css";
import "./shuffleMod.css";
import img_icon from "./special_stages_icon.png";
import img_map from "./special_stages_map.png";

import { Vue_nav } from "../../common/views/nav";
Vue_nav.createAndMount();

import { Vue_analytics } from "../../common/views/analytics";
Vue_analytics.createAndMount();

import { applyBps, crc32 } from "./flip";

const getArrayFromEvent = async function(event:Event){
  if (!(event.target instanceof HTMLInputElement))
    return null;
  if(!event.target.files)
    return null;
  const file = event.target.files[event.target.files.length - 1];
  if(!file)
    return null;
  return new Uint8Array(await file.arrayBuffer());
};

const getBps = async function(){
  try {
    const file = await fetch('https://pokemonshuffle.b-cdn.net/Pokemon_Shuffle_Special%20Stages_DLC.bps');
    return [null, new Uint8Array(await file.arrayBuffer())] as const;
  } catch(err){
    return ["Internal error: Unable to load the DLC file.", null] as const;
  }
};

const onCiaLoaded = async function(event:Event){
  const outputMsg = document.getElementById('outputMsg-cia');
  const downloadLink = document.getElementById('downloadLink-cia');
  if (!outputMsg || !downloadLink || !(downloadLink instanceof HTMLAnchorElement))
    return;

  outputMsg.innerText = '';
  outputMsg.style.color = 'white';

  const ciaArray = await getArrayFromEvent(event);
  if (!ciaArray){
    outputMsg.innerText = 'Error: Unable to load the game file.';
    outputMsg.style.color = 'red';
    return;
  }

  if (crc32(ciaArray) !== 1898445886){
    outputMsg.innerText = 'Error: Wrong game file. The expected game file must have a SHA-256 Hash of 9c801679d4a37a1a28d259ac7aee950b00383bbebfb4513350114a1c6d9a345f.';
    outputMsg.style.color = 'red';
    return;
  }

  outputMsg.innerText = 'Progress: Loading DLC file... This can take a minute.';
  outputMsg.style.color = 'white';
  const [err2, bpsArray] = await getBps();
  if (err2){
    outputMsg.innerText = err2;
    return;
  }

  outputMsg.innerText = 'Progress: Injecting the DLC in the game file...';
  outputMsg.style.color = 'white';
  const [err, resultArray] = applyBps(ciaArray, bpsArray);
  if (err || !resultArray){
    outputMsg.innerText = err;
    return;
  }

  const blob = new Blob([resultArray], { type:"application/octet-stream"});
  downloadLink.style.display = '';
  downloadLink.href = URL.createObjectURL(blob);

  outputMsg.innerText = 'Complete. The game file was successfully generated.';
  outputMsg.style.color = 'white';
};

const onSaveDataLoaded = async function(event:Event){
  const outputMsg = document.getElementById('outputMsg-savedata');
  const downloadLink = document.getElementById('downloadLink-savedata');
  if (!outputMsg || !downloadLink || !(downloadLink instanceof HTMLAnchorElement))
    return;

  outputMsg.innerText = '';
  outputMsg.style.color = 'white';

  const saveDataArray = await getArrayFromEvent(event);
  if (!saveDataArray){
    outputMsg.innerText = 'Error: Unable to load the save data file.';
    outputMsg.style.color = 'red';
    return;
  }

  if (saveDataArray.length <= 22926){
    outputMsg.innerText = 'Error: Invalid save data file.';
    outputMsg.style.color = 'red';
    return;
  }

  //byte 107: The 4 first must be 0010. 4 last bits must be kept (represent Jewels).
  saveDataArray[107] &= 0x0F; // clear 4 first bits
  saveDataArray[107] |= 0x40; // set 0010xxxx

  const blob = new Blob([saveDataArray], { type:"application/octet-stream"});
  downloadLink.style.display = '';
  downloadLink.href = URL.createObjectURL(blob);

  outputMsg.innerText = 'Complete. The save data file was successfully adapted.';
  outputMsg.style.color = 'white';
};


document.addEventListener("DOMContentLoaded",async function(){
  const fileUploadCia = document.getElementById('file-upload-cia');
  if (fileUploadCia)
    fileUploadCia.addEventListener('change', onCiaLoaded);

  const fileUploadSaveData = document.getElementById('file-upload-savedata');
  if (fileUploadSaveData)
    fileUploadSaveData.addEventListener('change', onSaveDataLoaded);

  const imgIconHtml = document.getElementById('img_icon');
  if (imgIconHtml instanceof HTMLImageElement)
    imgIconHtml.src = img_icon;

  const imgMapHtml = document.getElementById('img_map');
  if (imgMapHtml instanceof HTMLImageElement)
    imgMapHtml.src = img_map;
});
