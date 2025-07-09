
<nav id="nav" class="navbar">

  <button class="navbar-toggleMobileBtn" @click="mobileExpanded = !mobileExpanded" type="button" aria-label="Open" role="button">
    <span class="navbar-togglerMobileIcon"></span>
  </button>

  <a :href="logoHeaderUrl" class="navbar-brand" style="padding-top:0px;padding-bottom:0px;">
    <img :src="logoHeader" alt="Pokémon Completion">
  </a>

  <div class="navbar-dropdown" :class="{mobileExpanded:mobileExpanded}">
    <ul class="navbar-ul">
      <li v-for="el in elems" @click="toggleShow(el)" class="navbar-li">
        <a class="navbar-link" :href="el.href" :class="{'navbar-link-clicked':el.show}">
          {{el.name}}
          <span style="font-size:0.8em" v-show="el.items.length > 0">▼</span>
        </a>

        <div class="navbar-inner-dropdown" v-show="el.show" v-if="el.items.length > 0">
          <a v-for="item in el.items" class="navbar-inner-li" :href="item.href">{{item.name}}</a>
        </div>
      </li>

    </ul>
  </div>
</nav>