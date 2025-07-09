/*
//pokemon icons:

let str2 = '';
for (let i = 719; i <= 802; i++){
  str2 += `magick convert "C:\\rc\\rainingchain\\src\\pokemonCompletion\\icons\\pokemonExtra\\pokemon_${i}.png" -interpolate Nearest -filter point -resize 64x64 "C:\\rc\\rainingchain\\src\\pokemonCompletion\\icons\\img\\pokemon\\p${i}.png"\n`;
}
console.log(str2);
process.exit(0);
*/

setTimeout(() => {
  let str2 = '';
  map.forEach((list,[dim,canvas]) => {
    list.split(' ').forEach(el => {
      if(canvas)
        str2 += `magick "C:\\rc\\rainingchain\\${el}" -gravity center -extent ${dim} -transparent white "C:\\rc\\rainingchain\\${el}"\n`;
      else
        str2 += `magick "C:\\rc\\rainingchain\\${el}" -interpolate Nearest -filter point -resize ${dim} "C:\\rc\\rainingchain\\${el}"\n`;
    });
  });
  console.log(str2);
},1);

const map = new Map([
  [
    ["32x64",true],
    `src/pokemonCompletion/icons/img/accessory4/32x64/Colored_Parasol.png src/pokemonCompletion/icons/img/accessory4/32x64/Mirror_Ball.png src/pokemonCompletion/icons/img/accessory4/32x64/Sparks.png src/pokemonCompletion/icons/img/accessory4/32x64/Old_Umbrella.png src/pokemonCompletion/icons/img/accessory4/32x64/Standing_Mike.png src/pokemonCompletion/icons/img/accessory4/32x64/Yellow_Balloon.png src/pokemonCompletion/icons/img/accessory4/32x64/Big_Tree.png src/pokemonCompletion/icons/img/accessory4/32x64/Green_Balloons.png src/pokemonCompletion/icons/img/accessory4/32x64/Red_Balloons.png src/pokemonCompletion/icons/img/accessory4/32x64/Shiny_Powder.png`
  ],

]);


//  //str += `magick convert "C:\\rc\\rainingchain\\src\\pokemonCompletion\\icons\\pokemon\\${id}.png" -interpolate Nearest -filter point -resize 64x64 "C:\\rc\\rainingchain\\src\\pokemonCompletion\\icons\\pokemon2\\${newId}.png"\n`;