
import { Category, Collectable, Conflict, Formula, FormulaContext, Missable, ObtainType, Ware, WareGroup } from "./pokemonCompletion_data";

import { Vue_pokemonCompletion_full, callableOncePerCycle } from "./pokemonCompletion";

const invalidReqList = new Set<string>();

export class Vue_pokemonCompletion_req_methods {

  updateReqsAndObtainableStatus = function(this:Vue_pokemonCompletion_full){
    this.updateObtainableVariationIfToggled();

    const ctx = this.createFormulaContext();
    this.updateObtainableStatus(ctx);
    this.updateObtainableCount();

    //ui only
    this.updateVisibleCount();
    this.allMissables.forEach(m => this.updateMissableVisibility(m, ctx));
    this.updateConflictsVisibility(ctx);
    this.updateWaresVisibility(ctx);
  }

  createFormulaContext = function(this:Vue_pokemonCompletion_full, waresMarkedAsOwned=this.getWaresMarkedAsOwned()){
    const ctx = new FormulaContext(waresMarkedAsOwned, null, null);

    ctx.ownedWares = (() => {
      const map = new Map<string,number>();
      this.getWares().forEach(w => {
        if(!waresMarkedAsOwned.has(w.id))
          console.error('invalid ware:' + w.id, Array.from(waresMarkedAsOwned.keys()));

        const count = waresMarkedAsOwned.get(w.id) ?? 0;
        //if(w.id === '$eReader_AnyBerry') //debug
        //  debugger;
        const hasValue = count && this.evaluateFormula(w.preReqs, ctx);
        if(!hasValue)
          return;
        // must support multiple ware with same id
        map.set(w.id, count);
      });
      return map;
    })();

    ctx.requirementsFulfilled = (() => {
      const reqs = this.requirements.filter(r => {
        const formula = this.getRequirementFormula(r.id);
        return this.evaluateFormula(formula, ctx);
      });
      return new Set(reqs.map(r => r.id));
    })();

    return ctx;
  }

  updateVisibleCount = callableOncePerCycle(function(this:Vue_pokemonCompletion_full,){
    this.categories.forEach(cat => {
      cat.visibleCount = 0;
      cat.list.forEach(c => {
        if (this.isVisible(c))
          cat.visibleCount++;
      });
    });

    this.locations.forEach(loc => {
      loc.visibleCount = 0;
      loc.list.forEach(c => {
        if (this.isVisible(c))
          loc.visibleCount++;
      });
    });
  });


  getParentGroup = function(this:Vue_pokemonCompletion_full, grp:WareGroup, i:number){
    const grps = this.getWareGroups();
    for(let j = i - 1; j >= 0; j--)
      if(grps[j].indent < grp.indent)
        return [grps[j], j] as const;
    return null;
  }


  getWarePreReqs = function(this:Vue_pokemonCompletion_full, wareId:string){
    return this.getWares().filter(w => w.id === wareId).map(w => w.preReqs);
  }
  getRequirementFormula = function(this:Vue_pokemonCompletion_full, reqId:string){
    const f = this.requirements.find(r => r.id === reqId)?.waresByType
        .find(w => w.type === this.playingWith)?.reqWares || null;
    if(!f){
      if(!invalidReqList.has(reqId)){
        console.error('invalid requirement:' + reqId);
        invalidReqList.add(reqId);
      }
    }
    return f;
  }

  isActiveConflict  = function(this:Vue_pokemonCompletion_full, cflt:Conflict, ctx:FormulaContext){
    if(cflt.reqsForProblemOnlyIfLivingDex !== null &&
      cflt.reqsForProblemOnlyIfLivingDex !== this.isLivingDex())
      return false;

    const resolved = this.evaluateFormula(cflt.reqsToSolve, ctx);
    return !resolved;
  }

  evaluateFormula = function(this:Vue_pokemonCompletion_full, formula:Formula | null, ctx:FormulaContext) : boolean {
    if(!formula)
      return false;

    return formula.evaluate(id => {
      id = this.waresByType.find(t => t.type === this.playingWith)?.aliases.get(id) ?? id;

      if(id.startsWith('$')){ //wares
        if(ctx.ownedWares)
          return ctx.ownedWares.get(id) ?? 0;

        const formulas = this.getWarePreReqs(id);
        if(formulas.every(f => !this.evaluateFormula(f, ctx)))
          return 0;
        return ctx.waresMarkedOwned.get(id) ?? 0;
      }

      //requirements
      if(ctx.requirementsFulfilled)
        return ctx.requirementsFulfilled.has(id) ? 1 : 0;

      const formula = this.getRequirementFormula(id);
      return this.evaluateFormula(formula, ctx) ? 1 : 0;
    });
  }

  updateWaresVisibility = function(this:Vue_pokemonCompletion_full, ctx:FormulaContext){
    const grps = this.getWareGroups();
    grps.forEach((grp,i) => {

      grp.wares.forEach(w => {
        w.hasWarning = !this.evaluateFormula(w.preReqs, ctx);
        w.visible = !w.hasWarning || w.alwaysVisible;
      });
    });
  }


  getWareGroups = function(this:Vue_pokemonCompletion_full){
    return this.waresByType.find(w => w.type === this.playingWith)?.groups || [];
  }
  getWares = function(this:Vue_pokemonCompletion_full){
    return this.waresByType.find(w => w.type === this.playingWith)?.wares || [];
  }

  isWareOwned = function(this:Vue_pokemonCompletion_full, ware:Ware){
    if(!ware.owned)
      return false;
    // must check if parents are owned
  }

  getWaresMarkedAsOwned = function(this:Vue_pokemonCompletion_full){
    const map = new Map<string,number>();
    this.getWares().forEach(w => {
      const curCount = map.get(w.id) ?? 0;
      if(!w.owned)
        map.set(w.id, curCount);
      else
        map.set(w.id, w.ownedCount); // must support multiple ware with same id
    })

    return map;
  }

  updateObtainableStatus = function(this:Vue_pokemonCompletion_full,ctx:FormulaContext){
    if (!this.supportsWareAndRequirements())
      return;

    const statusMapByCat = new Map(this.categories.map(cat => {
      const activeCflts = cat.conflicts.filter(cflt => this.isActiveConflict(cflt, ctx));
      return [cat.id, this.getConflictsPokemonStatus(activeCflts)] as const;
    }));

    const getColCfltStatus = function(col:Collectable){
      const statusMap = statusMapByCat.get(col.categoryId);
      if(!statusMap) // error
        return true;
      const st = statusMap.get(col);
      if(st === undefined)
        return true; // aka no conflict
      return st;
    }

    this.collectableWithVariableObtainability.forEach(c => {
      const cat = this.categoriesMap.get(c.categoryId);
      if(!cat)
        return;

      if(!c.trackable && this.hideUntrackable){
        c.setObtainable(ObtainType.ignoredBecauseUntrackable);
        return;
      }

      const obtWithoutConflict = (() => {
        return this.evaluateFormula(c.requirements, ctx);
      })();

      if (!obtWithoutConflict){
        c.setObtainable(ObtainType.unobtainableReqs);
        return;
      }
      const status = getColCfltStatus(c);
      if (status === true)
        c.setObtainable(ObtainType.obtainable);
      else if (status === null)
        c.setObtainable(ObtainType.unresolvedConflict);
      else if (status === false)
        c.setObtainable(ObtainType.unobtainableConflit);
    });
  }


  updateMissableVisibility = function(this:Vue_pokemonCompletion_full,m:Missable,ctx:FormulaContext){
    const allCollectablesWereCollected = m.collectables?.every(colName => {
      const cat = this.categoriesMap.get(m.categoryId);
      return cat?.list.some(el => el.name === colName && el.obtained);
    });

    if (allCollectablesWereCollected)
      m.isSolved = true;
    else
      m.isSolved = this.evaluateFormula(m.reqsToSolve, ctx);

    if (m.reqsForProblemOnlyIfLivingDex !== null && m.reqsForProblemOnlyIfLivingDex !== this.isLivingDex())
      m.reqsForProblemFulfilled = false;
    else
      m.reqsForProblemFulfilled = this.evaluateFormula(m.reqsForProblem, ctx);
  }
  updateConflictsVisibility = function(this:Vue_pokemonCompletion_full,ctx:FormulaContext){
    this.categories.forEach(cat => {
      cat.conflicts.forEach(cflt => {
        this.updateConflictVisibility(cflt, ctx);
      });
    });
  }
  updateConflictVisibility = function(this:Vue_pokemonCompletion_full,cflt:Conflict, ctx:FormulaContext){
    const allCollectablesWereCollected = cflt.list.some(els => {
      return els.every(colName => {
        const cat = this.categoriesMap.get(cflt.categoryId);
        return cat?.list.some(el => el.name === colName && el.obtained);
      });
    });

    if(allCollectablesWereCollected)
      cflt.isSolved = true;
    else
      cflt.isSolved = this.evaluateFormula(cflt.reqsToSolve, ctx);

    if (cflt.reqsForProblemOnlyIfLivingDex !== null && cflt.reqsForProblemOnlyIfLivingDex !== this.isLivingDex())
      cflt.reqsForProblemFulfilled = false;
    else
      cflt.reqsForProblemFulfilled = this.evaluateFormula(cflt.reqsForProblem, ctx);
  }


  getObtainables = function(this:Vue_pokemonCompletion_full, cat:Category){
    return cat.list.filter(p => {
      if(p.obtainable === ObtainType.obtainable)
        return true;

      if(p.obtainable === ObtainType.unresolvedConflict)
        return cat.firstInConflictGroup.includes(p.name);

      return false;
    });
  }
  updateObtainableCount = function(this:Vue_pokemonCompletion_full,){
    this.categories.forEach(cat => {
      cat.obtainableCount = this.getObtainables(cat).length;
      cat.unobtainableCount = 0;
      cat.strictlyUnobtainableCount = 0;
      cat.conflictCount = 0;
      cat.visibleCount = 0;

      cat.list.forEach(p => {
        if(p.obtainable === ObtainType.unobtainableReqs || p.obtainable === ObtainType.unobtainableConflit)
          cat.unobtainableCount++;
        if(p.obtainable === ObtainType.strictlyUnobtainable){
          cat.unobtainableCount++;
          cat.strictlyUnobtainableCount++;
        }
        if(p.obtainable === ObtainType.ignoredBecauseUntrackable){
          cat.untrackableCount++;
        }
        if(p.obtainable === ObtainType.unresolvedConflict){
          if(!cat.firstInConflictGroup.includes(p.name))
            cat.conflictCount++;
        }
      });
    });

    this.totalObtainableCount = 0;
    this.categories.forEach(c => {
      this.totalObtainableCount += c.obtainableCount;
    });

    this.locations.forEach(loc => {
      loc.obtainableCount = 0;
      loc.list.forEach(c => {
        if(this.isObtainableOrFirstGroup(c))
          loc.obtainableCount++;
      });
    });
  }

  getObtainableInfoMaps = function(this:Vue_pokemonCompletion_full){
    const normalCtx = this.createFormulaContext();
    this.updateObtainableStatus(normalCtx);
    this.updateObtainableCount();

    const obtainableCountNormal = new Map<string, number>();
    const obtainableCountList = new Map<string, Set<Collectable>>();
    const obtainableCountNormalTotal = this.totalObtainableCount;
    this.categories.forEach(cat => {
      obtainableCountNormal.set(cat.id, cat.obtainableCount);
      obtainableCountList.set(cat.id, new Set(this.getObtainables(cat)));
    });
    return [obtainableCountNormal, obtainableCountList, obtainableCountNormalTotal] as const;
  }

  updateObtainableVariationIfToggled = function(this:Vue_pokemonCompletion_full){
    const [obtainableCountNormal, obtainableCountList, obtainableCountNormalTotal] = this.getObtainableInfoMaps();

    const ownedNormal = this.getWaresMarkedAsOwned();

    this.getWareGroups().forEach(grp => {
      const [incr,decr] = [true, false].map(isIncr => {
        const newOwned = new Map(ownedNormal);
        let someChanged = false;
        grp.wares.forEach(w => {
          const normalCount = ownedNormal.get(w.id) ?? 0;
          if(isIncr && normalCount < w.maxCount){
            newOwned.set(w.id, normalCount + 1);
            someChanged = true;
          }
          else if(!isIncr && normalCount > w.minCount){
            newOwned.set(w.id, normalCount - 1);
            someChanged = true;
          }
        });
        if(!someChanged)
          return {diffCount:0,title:''};

        const ctx = this.createFormulaContext(newOwned);

        this.updateObtainableStatus(ctx);
        this.updateObtainableCount();

        const title:string[] = [];
        this.categories.forEach(cat => {
          const diffCount = cat.obtainableCount - (obtainableCountNormal.get(cat.id) || 0);
          if (diffCount === 0)
            return;

          let listStr = '';

          const oldSet = obtainableCountList.get(cat.id) || new Set();
          const newArr = this.getObtainables(cat);
          const newSet = new Set(newArr);
          const addedStuff = newArr.filter(el => !oldSet.has(el));
          const missingStuff = Array.from(oldSet).filter(el => !newSet.has(el));
          const diffArr = addedStuff.concat(missingStuff);

          const maxCount = window.location.href.includes('localhost') ? 1000 : 5;
          if(diffArr.length === Math.abs(diffCount) || diffArr.length <= maxCount){ //possible issue with conflict?
            const toDisplay = diffArr.slice(0,maxCount);
            listStr = ': ' + (toDisplay.map(el => el.name).join(', '));
            if (diffArr.length > maxCount)
              listStr += '...';
          }

          title.push(`${diffCount < 0 ? '' : '+'}${diffCount} ${cat.name}${listStr}`);
        });
        return {
          diffCount:this.totalObtainableCount - obtainableCountNormalTotal,
          title:title.join('\n'),
        };
      });

      if(!incr.diffCount && !decr.diffCount){
        grp.obtainableVariationIfToggledHtml = '';
        return;
      }

      if(incr.diffCount && !decr.diffCount){ //incr only
        grp.obtainableVariationIfToggledHtml = `<span title="${incr.title}" class="cs-green">+${incr.diffCount} if added</span>`
        return;
      }
      if(!incr.diffCount && decr.diffCount){ //decr only
        grp.obtainableVariationIfToggledHtml = `<span title="${decr.title}" class="cs-red">${decr.diffCount} if removed</span>`
        return;
      }
      if(incr.diffCount && decr.diffCount){ //decr only
        grp.obtainableVariationIfToggledHtml = `<span>
          <span title="${incr.title}" class="cs-green">+${incr.diffCount}</span> |
          <span title="${decr.title}" class="cs-red">${decr.diffCount}</span>
        </span>`
        return;
      }

    });
  }
  updateWareOwnedStatus = function(this:Vue_pokemonCompletion_full, func:(w:Ware) => number){
    this.getWares().forEach(w2 => {
      const count = func(w2);
      w2.owned = count > 0;
      w2.ownedCount = count;
    });
    this.onOwnedWaresChanged();
  }
}
