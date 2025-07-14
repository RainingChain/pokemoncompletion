
import Vue from "vue";

import withRender from "./analytics.vue";
import Clarity from "@microsoft/clarity";

// clarity project settings: cookies are disabled by default

const ACTIVE = !window.location.href.includes('localhost');
if (ACTIVE)
  Clarity.init('sauh2imb2d');

const activateGoogleAdsense = async function(){
  if(ACTIVE)
    Clarity.consent(true);
};

export class Vue_analytics_data {
  displayCookieBar = true;
}

class Vue_analytics_props {}
class Vue_analytics_methods {
  clickAccept = <any>function(this:Vue_analytics_full){
    this.displayCookieBar = false;
    activateGoogleAdsense();
    localStorage.setItem('acceptedCookies', 't' + Date.now());
  }
  clickRefuse = <any>function(this:Vue_analytics_full){
    this.displayCookieBar = false;
    localStorage.setItem('acceptedCookies', 'f' + Date.now());
  }
}

function createComponent(propsData:Partial<Vue_analytics_props>) {
  const comp = new Vue_analytics.Component({propsData:{...new Vue_analytics_props(), ...propsData}});
  return <{$props:Vue_analytics_props} & typeof comp>comp;
}

export type Vue_analytics_full = ReturnType<typeof createComponent>;

export class Vue_analytics {
  static Component = Vue.component('my-analytics', withRender(new Vue_analytics()));
  static createComponent = createComponent;

  static createAndMount(){
    document.addEventListener("DOMContentLoaded",function(){
      const acceptedCookies = (function(){
        try {
          const date = localStorage.getItem('acceptedCookies');
          if(!date)
            return null;
          const d = +date.slice(1);
          if(isNaN(d) || d < 1732976211590) //2024-11-30
            return null;
          return date[0] === 't';
        } catch(err){ return null; }
      })();

      if(acceptedCookies === true)
        return activateGoogleAdsense();

      if(acceptedCookies === false)
        return;

      const slot = document.createElement('div');
      document.body.appendChild(slot);
      const nav = Vue_analytics.createComponent({});
      nav.$mount(slot);
    });
  }
  props = Object.keys(new Vue_analytics_props());
  methods = new Vue_analytics_methods();
  data = function(){
    return new Vue_analytics_data();
  }
}
