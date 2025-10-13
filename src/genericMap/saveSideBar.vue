<div id="save-sidebar" style="padding:15px;overflow-x:hidden">
  <div style="height:calc(100% - 100px)">
    <div>Free unlimited progress tracking. No login. No ads.</div>
    <div>
      Click a marker to hide it.<br>
    </div>
    <br>
    <table>
      <tr>
        <td style="padding-bottom:10px">
          <button @click="clearState" style="padding:5px 10px;margin-right:10px" class="btn btn-primary">Clear State</button>
        </td>
        <td style="padding-bottom:10px">
          Set all markers to the visible state.
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:10px">
          <button @click="saveState" style="padding:5px 10px;margin-right:10px" class="btn btn-primary">Save State</button>
        </td>
        <td style="padding-bottom:10px">
          Generate a save corresponding to the current marker states.
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:10px">
          <button @click="loadStateFromTextArea" style="padding:5px 10px;margin-right:10px" class="btn btn-primary">Load State</button>
        </td>
        <td style="padding-bottom:10px">
          Copy-paste a previous state in the text area and this will restore the markers to this state. Warning: This will overwrite the current state of the markers.
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:10px">
          <button @click="revertToPreviousState" style="padding:5px 10px;margin-right:10px;width:calc(100% - 10px);" class="btn btn-primary">Undo</button>
        </td>
        <td style="padding-bottom:10px">
          Revert to previous state. (Up to 100 times)
        </td>
      </tr>
    </table>
    <p style="margin-left:20px" v-if="saveEditorUrl">
      Download <a target="_blank" :href="saveEditorUrl" download>HK Save Editor</a> <a target="_blank" :href="saveEditorSrcUrl">(Source code)</a>
    </p>
    <textarea ref="saveTextArea" style="width:100%;min-height:100px;height:calc(100% - 230px)"></textarea>
  </div>
</div>