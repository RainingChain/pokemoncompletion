/// <reference path="./src/common/js/globalTypesAndInterfaces.d.ts"/>

//entry for server

import sourceMapSupport from "source-map-support";
if(sourceMapSupport && sourceMapSupport.install)
  sourceMapSupport.install();

import {App_private} from "./src/App";

App_private.initialize();