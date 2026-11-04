import { dotnetBuildId } from "./dotnetBuildId";

const lazyGetAsync = function<T>(createRaw:() => Promise<T>) : () => Promise<T> {
  let v:T | undefined = undefined;
  let ongoingPromise:Promise<T>;
  return async function(){
    if(v === undefined){
      if(!ongoingPromise)
        ongoingPromise = createRaw();
      v = await ongoingPromise;
    }
    return v!;
  };
};

const addDotnetBuildId = function(url:string){
  if(/[?&]build=/.test(url))
    return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}build=${dotnetBuildId}`;
};

export const loadDotnet = lazyGetAsync(async () => {
  const dotnetJs = addDotnetBuildId("/PkCompletionist/_framework/dotnet.js");
  const { dotnet } = await import(/* webpackIgnore: true */ dotnetJs);

  const { getAssemblyExports, getConfig } = await dotnet
      .withDiagnosticTracing(false)
      .withResourceLoader((type:string, name:string, defaultUri:string) => {
        if(!defaultUri.includes('/PkCompletionist/'))
          return defaultUri;
        return addDotnetBuildId(defaultUri);
      })
      .create();

  const config = getConfig();
  const info = await getAssemblyExports(config.mainAssemblyName);
  return info.PkCompletionist.Core;
});
