
import PkCompletionist_runtimeconfig_json from "file-loader!./PkCompletionist/PkCompletionist.runtimeconfig.json2";
import mono_config_json from "file-loader!./PkCompletionist/mono-config.json2";
import supportFiles_0_runtimeconfig_bin from "file-loader!./PkCompletionist/supportFiles/0_runtimeconfig.bin";
import dotnet_timezones_blat from "file-loader!./PkCompletionist/dotnet.timezones.blat";
import dotnet_wasm from "file-loader!./PkCompletionist/dotnet.wasm";
import PkCompletionist_dll from "file-loader!./PkCompletionist/managed/PkCompletionist.dll";
import System_Collections_Concurrent_dll from "file-loader!./PkCompletionist/managed/System.Collections.Concurrent.dll";
import System_Collections_dll from "file-loader!./PkCompletionist/managed/System.Collections.dll";
import System_ComponentModel_Primitives_dll from "file-loader!./PkCompletionist/managed/System.ComponentModel.Primitives.dll";
import System_ComponentModel_TypeConverter_dll from "file-loader!./PkCompletionist/managed/System.ComponentModel.TypeConverter.dll";
import System_Console_dll from "file-loader!./PkCompletionist/managed/System.Console.dll";
import System_Diagnostics_DiagnosticSource_dll from "file-loader!./PkCompletionist/managed/System.Diagnostics.DiagnosticSource.dll";
import System_Diagnostics_TraceSource_dll from "file-loader!./PkCompletionist/managed/System.Diagnostics.TraceSource.dll";
import System_Linq_dll from "file-loader!./PkCompletionist/managed/System.Linq.dll";
import System_Memory_dll from "file-loader!./PkCompletionist/managed/System.Memory.dll";
import System_Net_Http_dll from "file-loader!./PkCompletionist/managed/System.Net.Http.dll";
import System_Net_Primitives_dll from "file-loader!./PkCompletionist/managed/System.Net.Primitives.dll";
import System_Numerics_Vectors_dll from "file-loader!./PkCompletionist/managed/System.Numerics.Vectors.dll";
import System_ObjectModel_dll from "file-loader!./PkCompletionist/managed/System.ObjectModel.dll";
import System_Private_CoreLib_dll from "file-loader!./PkCompletionist/managed/System.Private.CoreLib.dll";
import System_Private_Uri_dll from "file-loader!./PkCompletionist/managed/System.Private.Uri.dll";
import System_Runtime_dll from "file-loader!./PkCompletionist/managed/System.Runtime.dll";
import System_Runtime_InteropServices_dll from "file-loader!./PkCompletionist/managed/System.Runtime.InteropServices.dll";
import System_Runtime_InteropServices_JavaScript_dll from "file-loader!./PkCompletionist/managed/System.Runtime.InteropServices.JavaScript.dll";
import System_Runtime_Numerics_dll from "file-loader!./PkCompletionist/managed/System.Runtime.Numerics.dll";
import System_Security_Cryptography_dll from "file-loader!./PkCompletionist/managed/System.Security.Cryptography.dll";
import System_Text_RegularExpressions_dll from "file-loader!./PkCompletionist/managed/System.Text.RegularExpressions.dll";
import System_Threading_dll from "file-loader!./PkCompletionist/managed/System.Threading.dll";

const lazyGetAsync = function<T>(createRaw:() => Promise<T>) : () => Promise<T> {
  let v:T | undefined = undefined;
  let ongoingPromise:Promise<T>;
  return async function(){
    if(v === undefined){
      if(!ongoingPromise)
        ongoingPromise = createRaw();
      v = await ongoingPromise; //will create v
    }
    return v!;
  };
};

const createFileMap = function(){
  const map = new Map<string, FileClientPath>();
  const add = function(clientPath:FileClientPath, p:string){
    map.set(p, clientPath);
  };
  add(PkCompletionist_runtimeconfig_json,"PkCompletionist.runtimeconfig.json");
  add(mono_config_json,"mono-config.json");
  add(supportFiles_0_runtimeconfig_bin,"supportFiles/0_runtimeconfig.bin");
  add(dotnet_timezones_blat,"dotnet.timezones.blat");
  add(dotnet_wasm,"dotnet.wasm");
  add(PkCompletionist_dll,"managed/PkCompletionist.dll");
  add(System_Collections_Concurrent_dll,"managed/System.Collections.Concurrent.dll");
  add(System_Collections_dll,"managed/System.Collections.dll");
  add(System_ComponentModel_Primitives_dll,"managed/System.ComponentModel.Primitives.dll");
  add(System_ComponentModel_TypeConverter_dll,"managed/System.ComponentModel.TypeConverter.dll");
  add(System_Console_dll,"managed/System.Console.dll");
  add(System_Diagnostics_DiagnosticSource_dll,"managed/System.Diagnostics.DiagnosticSource.dll");
  add(System_Diagnostics_TraceSource_dll,"managed/System.Diagnostics.TraceSource.dll");
  add(System_Linq_dll,"managed/System.Linq.dll");
  add(System_Memory_dll,"managed/System.Memory.dll");
  add(System_Net_Http_dll,"managed/System.Net.Http.dll");
  add(System_Net_Primitives_dll,"managed/System.Net.Primitives.dll");
  add(System_Numerics_Vectors_dll,"managed/System.Numerics.Vectors.dll");
  add(System_ObjectModel_dll,"managed/System.ObjectModel.dll");
  add(System_Private_CoreLib_dll,"managed/System.Private.CoreLib.dll");
  add(System_Private_Uri_dll,"managed/System.Private.Uri.dll");
  add(System_Runtime_dll,"managed/System.Runtime.dll");
  add(System_Runtime_InteropServices_dll,"managed/System.Runtime.InteropServices.dll");
  add(System_Runtime_InteropServices_JavaScript_dll,"managed/System.Runtime.InteropServices.JavaScript.dll");
  add(System_Runtime_Numerics_dll,"managed/System.Runtime.Numerics.dll");
  add(System_Security_Cryptography_dll,"managed/System.Security.Cryptography.dll");
  add(System_Text_RegularExpressions_dll,"managed/System.Text.RegularExpressions.dll");
  add(System_Threading_dll,"managed/System.Threading.dll");
  return map;
}

export const loadDotnet = lazyGetAsync(async () => {
  const map = createFileMap();

  const oldFetch = window.fetch;
  window.fetch = function(rawFile){
    const match = rawFile.toString().match(/PkCompletionist\/(.*)/);
    if(!match)
      return oldFetch(rawFile);
    const match2 = match[1].replace('./','');

    const convertedFile = map.get(match2);
    if(convertedFile === undefined)
      return oldFetch(rawFile);

    return oldFetch(convertedFile);
  }

  // @ts-ignore
  const { dotnet } = await import('./PkCompletionist/dotnet.js');

  // Get exported methods from the .NET assembly
  const { getAssemblyExports, getConfig } = await dotnet
      .withDiagnosticTracing(false)
      .create();

  const config = getConfig();
  const info = await getAssemblyExports(config.mainAssemblyName);
  const res = info.PkCompletionist.Core;

  window.fetch = oldFetch;

  return res;
});
