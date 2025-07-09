/*
lib.d.ts               browser javascript definitions  (window)
typings/global/node/index.d.ts     nodejs definitions        (global)
*/

declare type Opaque<K, T> = T & { _: K };

declare type FileClientPath = Opaque<'FileClientPath', string>;

declare type FileServerPath = Opaque<'FileServerPath', string>;

declare type NoInfer<T> = [T][T extends any ? 0 : never];

declare type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R ? (...args: P) => R : never;

declare type NonNullable<T> = Exclude<T, null | undefined>;

declare type EmptyObject = Record<string, never>;

declare type MixinConstructor = new (...args: any[]) => {};

declare module '*.vue' {
  function withRender<T>(a:T) : T;
  export default withRender;
}
declare module '*.css' {
  let css:any;
  export = css;
}
declare module '*.png' { let url:FileClientPath; export default url; }
declare module '*.svg' { let url:FileClientPath; export default url; }
declare module '*.webp' { let url:FileClientPath; export default url; }
declare module '*.tmx' { let url:FileClientPath; export default url; }
declare module '*.ogg' { let url:FileClientPath; export default url; }
declare module '*.mp3' { let url:FileClientPath; export default url; }
declare module '*.mp4' { let url:FileClientPath; export default url; }
declare module '*.txt' { let url:FileClientPath; export default url; }
declare module '*.wav' { let url:FileClientPath; export default url; }
declare module '*.html' { let url:FileClientPath; export default url; }
declare module '*.woff' { let url:FileClientPath; export default url; }
declare module '*.woff2' { let url:FileClientPath; export default url; }
declare module '*.lua' { let url:FileClientPath; export default url; }
declare module '*.csv' { let url:FileClientPath; export default url; }
declare module 'file-loader!*' { let url:FileClientPath; export default url; }
declare module '*.raw' { let str:string; export default str; }

declare type VueComputed<T> = {
  [P in keyof T]: T[P] extends (...args:any[]) => any ? ReturnType<T[P]> : any;
};
declare type Enum<T> = any;
declare type Nullable<T> = T | null;
declare type Constructor<T> = new(...args: any[]) => T;
declare type Encoded<T = ''> = T & {_:T};

declare interface DictObj<T> {
  [key: string]: T;
  [key: number]: T;
}
