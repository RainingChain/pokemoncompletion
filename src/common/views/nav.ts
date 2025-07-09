
import Vue from "vue";
Vue.config.devtools = false;
Vue.config.productionTip = false;

import pkmLogoHeader from "../../pokemonCompletion/icons/logo.png";
import withRender from "./nav.vue";

import "./nav.css";

interface Vue_nav_one {
  name:string;
  items:{name:string,href:string}[];
  show:boolean;
  href:string;
}

export class Vue_nav_data {
  $el:HTMLElement = undefined!;
  mobileExpanded = false;
  logoHeader = pkmLogoHeader;
  logoHeaderUrl = "/";
  elems = <Vue_nav_one[]>[
    {name:"100% Checklist", show:false,href:'/completion', items:[]},
    {name:"Battle Facilities", show:false,href:'/BattleFacilities', items:[]},
    {name:"Articles", show:false,href:'/articles', items:[]},
  ];
}

class Vue_nav_props {
}

class Vue_nav_methods {
  toggleShow = <any>function(this:Vue_nav_full, pack:Vue_nav_one) {
    this.elems.forEach(el => {
      if(el === pack)
        el.show = !el.show;
      else
        el.show = false;
    });
  }
}

let eventListener:any = undefined!;

function createComponent(propsData:Partial<Vue_nav_props>) {
  const comp = new Vue_nav.Component({propsData:{...new Vue_nav_props(), ...propsData}});
  return <{$props:Vue_nav_props} & typeof comp>comp;
}

export type Vue_nav_full = ReturnType<typeof createComponent>;

export class Vue_nav {
  static Component = Vue.component('my-nav', withRender(new Vue_nav()));
  static createComponent = createComponent;
  static removeEventListener(){
    document.removeEventListener('click',eventListener);
  }
  static createAndMount(slot='#nav-slot'){
    document.addEventListener("DOMContentLoaded",function(){
      const nav = Vue_nav.createComponent({});
      nav.$mount(slot);
    });
  }
  props = Object.keys(new Vue_nav_props());
  methods = new Vue_nav_methods();
  data = function(){
    return new Vue_nav_data();
  }
  mounted = function(this:Vue_nav_data){
    eventListener = (event:MouseEvent) => {
      if (this.$el.contains(<any>event.target))
        return;

      this.elems.forEach(el => { el.show = false; });
    }
    document.addEventListener('click', eventListener);
  }
}
