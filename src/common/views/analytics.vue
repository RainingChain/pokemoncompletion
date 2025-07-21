
<div v-if="displayCookieBar" style="z-index:10000;pointer-events:none;position:fixed;left:0px;bottom:0px;text-align:center;width:100%;">
  <div style="pointer-events:all;background-color:rgba(0,0,0,0.8);font-size:15px;z-index:999;min-height:25px;color:#fff;display: inline-block;padding:2px 10px;">
    <div style="display:flex">
      <div>
        <div>This site uses cookies for <a href="/legal" target="_blank" rel="noopener">analytics purposes</a>.</div>
        <div>It helps me prioritize what page to work on.  </div>
      </div>
      <div>
        <button @click="clickAccept" style="margin-left:5px;background-color:#2161ea;color:#fff;padding:2px 10px;border-radius:3px;font-size:20px;border:none;">
        <div style="transform: translate(-15px, 0px); width:100px;bottom:0px;height:60px;position:absolute;">
        </div>
        Accept
        </button>
      </div>
      <div>
        <button @click="clickRefuse" style="margin-left:5px;background-color:rgba(0,0,0,0);color:#bbb;padding:2px 10px;border-radius:3px;font-size:20px;border:1px solid #bbb;">
          <div style="transform: translate(-15px, 0px); width:100px;bottom:0px;height:60px;position:absolute;">
          </div>
          Reject
        </button>
      </div>
    </div>
  </div>
</div>

