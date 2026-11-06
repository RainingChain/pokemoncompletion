
import "../common/css/globalStyle.css";
import "../common/css/common.css";
import "./SimplePage.css";
import "../legal/legal.css";

import {Vue_nav} from "../common/views/nav";
Vue_nav.createAndMount();

import {Vue_analytics} from "../common/views/analytics";
Vue_analytics.createAndMount();

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("cookie-opt-out")?.addEventListener("click", event => {
    event.preventDefault();
    localStorage.setItem("acceptedCookies", "");
    window.location.reload();
  });
});


