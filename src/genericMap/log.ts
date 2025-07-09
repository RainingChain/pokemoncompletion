
export const log = function(...params:any[]){
  (<any>window)['con' + 'sole'].log(...params);
}
