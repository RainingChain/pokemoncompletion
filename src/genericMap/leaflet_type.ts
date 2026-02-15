import type L from "leaflet";

export type LeafletSidebar = {
  removeFrom:(map:L.Map) => void;
  addTo:(map:L.Map) => void;
  toggle:() => void;
  hide:() => void;
  show:() => void;
  isVisible:() => boolean;
  on:(what:'show' | 'hide', evt:() => void) => void;
} & L.Control;


export type LeafletControlLayers = {
  collapse:() => void;
};