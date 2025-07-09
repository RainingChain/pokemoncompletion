//create
// {"c":"trainerBattle","n":"Rival Battle #2 (Chikorita)","l":"Azalea Town","pos":[5948.8,4208]},
//for all collectables

c = [];

v.categories.forEach(cat => {
  if(cat.id === 'pokemon'){
    v.locations.forEach(loc => {
        let names = loc.list.filter(col => col.categoryId === 'pokemon')
          .map(col => ({c:'pokemon',n:col.name, l:loc.name,pos:[]}));
        c.push(...names);
    });
    return;
  }
  cat.list.forEach(col => {
    let n = {c:cat.id,n:col.name, l:col.location};
    c.push(n);
  })
});

c.sort((a,b) => a.l < b.l ? -1 : 1);

c.map(a => JSON.stringify(a)).join(',\n')

