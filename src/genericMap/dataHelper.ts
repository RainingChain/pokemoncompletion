import { CollectableJson } from "./Collectable";

export type GameDataJson = {
  categories:{
    list:CollectableJson[],
    group:string;
    href?:boolean | string;
    iconUrl?:string;
  }[];
  groups:{
    id:string;
    name:string;
    iconUrl:string;
    isVisibleByDefault:boolean;
  }[];

};

