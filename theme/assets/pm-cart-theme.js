/* Pinemoor cart drawer + add-to-cart.
   Moved out of the layout so the browser can fetch it in parallel, cache it
   across page views, and run it deferred instead of parsing ~10KB of inline
   JS in the HTML document on every request. Behaviour is byte-identical. */
var cartOpenedAt = 0;
    // In-cart upsell: Vet-Approved Tick Protection Drops (For Dogs) — 3 Bottles
    var PM_UPSELL_VARIANT = '52755888505013';
    // Variant IDs that ship free (3-pack "Buy 2 Get 1", 6-pack / Family bundle, dog upsell)
    var PM_FREE_SHIP = ['52515952001205','52579196403893','52810262610101','52810262642869','52944486170805','52944486203573',PM_UPSELL_VARIANT];
    // Original ("was") prices shown struck through, by variant id, for subscribe vs one-time
    var ORIG_SUB = {'52514698887349':49.99,'52515952001205':89.99,'52579196403893':119.99,'52755888505013':59.99,'52810262577333':44.99,'52810262610101':89.99,'52810262642869':119.99,'52944486138037':44.99,'52944486170805':79.99,'52944486203573':109.99};
    var ORIG_ONE = {'52514698887349':49.99,'52515952001205':89.99,'52579196403893':119.99,'52755888505013':59.99,'52810262577333':44.99,'52810262610101':79.99,'52810262642869':109.99,'52944486138037':44.99,'52944486170805':79.99,'52944486203573':109.99};
    // Fixed "Save $" badge per variant (3-pack, 6-pack, dog upsell)
    var PM_SAVE_AMT = {'52515952001205':40,'52579196403893':50,'52755888505013':30,'52810262610101':30,'52810262642869':40,'52944486170805':40,'52944486203573':50};
    // Bottle count per variant for the cart total "bundle" tag
    var PM_BOTTLES = {'52514698887349':'1 Bottle','52515952001205':'3 Bottles','52579196403893':'6 Bottles','52810262577333':'1 Bottle','52810262610101':'3 Bottles','52810262642869':'6 Bottles','52944486138037':'1 Bottle','52944486170805':'3 Bottles','52944486203573':'6 Bottles'};
    function openCartDrawer() {
      document.getElementById('cart-drawer').classList.add('open');
      document.getElementById('cart-drawer-overlay').classList.add('open');
      document.body.style.overflow = 'hidden';
      cartOpenedAt = Date.now();
      refreshCart();
    }
    function closeCartDrawer() {
      document.getElementById('cart-drawer').classList.remove('open');
      document.getElementById('cart-drawer-overlay').classList.remove('open');
      document.body.style.overflow = '';
    }
    function cartOverlayClick() {
      // Ignore the synthesized "ghost" tap mobile browsers fire right after the drawer opens
      if (Date.now() - cartOpenedAt < 450) return;
      closeCartDrawer();
    }
    function refreshCart() {
      fetch('/cart.js').then(r=>r.json()).then(cart=>{updateCartUI(cart);});
    }
    function updateCartUI(cart) {
      var itemsEl=document.getElementById('cart-drawer-items');
      var totalEl=document.getElementById('cart-drawer-total');
      var footerEl=document.getElementById('cart-drawer-footer');
      document.querySelectorAll('.cart-count').forEach(function(el){
        el.textContent=cart.item_count;
        el.style.display=cart.item_count>0?'flex':'none';
      });
      var countEl=document.getElementById('cart-drawer-count'); if(countEl) countEl.textContent=cart.item_count;
      var itemWord=document.getElementById('cart-drawer-itemword'); if(itemWord) itemWord.textContent=(cart.item_count===1?'Item':'Items');
      // If the main product was removed, automatically remove the dog upsell from the cart too
      var upsellLine=null, mainPresent=false;
      for(var ci=0;ci<cart.items.length;ci++){
        var cv=String(cart.items[ci].variant_id);
        if(cv===PM_UPSELL_VARIANT){upsellLine=cart.items[ci];}
        else if(cv!=='52748083724469'){mainPresent=true;}
      }
      if(upsellLine && !mainPresent){updateCartItem(upsellLine.key,0);return;}
      if(cart.items.length===0){
        itemsEl.innerHTML='<div class="cart-drawer__empty">Your cart is empty</div>';
        totalEl.textContent='$0.00'; if(footerEl) footerEl.style.display='none';
        var emptyUpsell=document.getElementById('cart-upsell'); if(emptyUpsell)emptyUpsell.style.display='none';
        return;
      }
      if(footerEl) footerEl.style.display='';
      var html='';
      var totalSave=0;
      var hasUpsell=false;
      var hasMain=false;
      var PM_DOG_GIFT='52748083724469';
      // Order: main product first, dog upsell second, free gift last
      function rank(it){var v=String(it.variant_id);return v===PM_DOG_GIFT?2:(v===PM_UPSELL_VARIANT?1:0);}
      var items=cart.items.slice().sort(function(a,b){return rank(a)-rank(b);});
      items.forEach(function(item){
        var fin=item.final_line_price/100;
        var vid=String(item.variant_id);
        if(vid===PM_UPSELL_VARIANT)hasUpsell=true;
        if(rank(item)===0)hasMain=true;
        if(vid===PM_DOG_GIFT){
          html+='<div class="cart-item">'
            +'<img decoding="async" src="'+item.image+'" alt="FREE Bottle Of Pinemoor For Dogs" class="cart-item__img">'
            +'<div class="cart-item__info"><div class="cart-item__head">'
              +'<div class="cart-item__main">'
                +'<p class="cart-item__title cart-item__title--wrap">FREE Bottle Of Pinemoor For Dogs</p>'
                +'<div class="cart-item__left"><span class="cart-item__freegift"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg> Free Gift</span></div>'
              +'</div>'
              +'<div class="cart-item__right">'
                +'<div class="cart-item__pricewrap"><div class="cart-item__pricerow"><span class="cart-item__price" style="color:#009370">FREE</span></div></div>'
                +'<button class="cart-item__remove" onclick="updateCartItem(\''+item.key+'\',0)" aria-label="Remove item">Remove</button>'
              +'</div>'
            +'</div></div>'
          +'</div>';
          return;
        }
        var subbed=!!(item.selling_plan_allocation && item.selling_plan_allocation.selling_plan);
        var orig=(subbed?ORIG_SUB:ORIG_ONE)[vid];
        var comp,save;
        if(orig!==undefined){comp=orig;save=Math.max(0,orig-fin);}else{save=Math.round(fin/3);comp=fin+save;}
        totalSave+=save;
        var compHtml=(comp>fin)?'<span class="cart-item__compare">$'+comp.toFixed(2)+'</span>':'';
        var samt=PM_SAVE_AMT[vid]; var saveHtml=(samt!==undefined)?'<span class="cart-item__save">Save $'+samt+'</span>':((save>0)?'<span class="cart-item__save">Save $'+save.toFixed(2)+'</span>':'');
        var vtitle=(item.variant_title||'').replace(/\s*\+\s*Free Gifts?\s*$/i,'');
        var variant=(vtitle && vtitle!=='Default Title')?'<div class="cart-item__variant">'+vtitle+'</div>':'';
        // Both the 3-pack (b2g1) and 6-pack (b3g3) always ship free, plus the dog upsell
        var freeship=(PM_FREE_SHIP.indexOf(vid)!==-1)?'<span class="cart-item__freeship"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Free Shipping</span>':'';
        // 6-pack (b3g3) also includes a free gift
        var freegift=(vid==='52579196403893'||vid==='52810262642869')?'<span class="cart-item__freegift"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg> Free Gifts Included</span>':'';
        var isUp=(vid===PM_UPSELL_VARIANT);
        var titleHtml=isUp?'Vet-Approved Tick Protection Drops <span class="cart-item__title-nowrap">(For&nbsp;Dogs)</span>':'Pinemoor&reg; Tick<br>Protection Drops';
        var itemImg=isUp?'https://cdn.shopify.com/s/files/1/1009/5601/2725/files/Pinemoor_For_Dogs_-_Dog_Variation_4.png?v=1783450399&width=200':item.image;
        html+='<div class="cart-item">'
          +'<img decoding="async" src="'+itemImg+'" alt="Pinemoor Tick Protection Drops" class="cart-item__img">'
          +'<div class="cart-item__info">'
            +'<div class="cart-item__head">'
              +'<div class="cart-item__main">'
                +'<p class="cart-item__title'+(isUp?' cart-item__title--wrap':'')+'">'+titleHtml+'</p>'
                +'<div class="cart-item__left">'+variant+freeship+freegift+'</div>'
              +'</div>'
              +'<div class="cart-item__right">'
                +'<div class="cart-item__pricewrap"><div class="cart-item__pricerow">'+compHtml+'<span class="cart-item__price">$'+fin.toFixed(2)+'</span></div>'+saveHtml+'</div>'
                +'<button class="cart-item__remove" onclick="updateCartItem(\''+item.key+'\',0)" aria-label="Remove item">Remove</button>'
              +'</div>'
            +'</div>'
          +'</div>'
        +'</div>';
      });
      itemsEl.innerHTML=html;
      totalEl.textContent='$'+(cart.total_price/100).toFixed(2);
      // Upsell only shows when the main product is in the cart and the dog drops aren't already added
      var upsellEl=document.getElementById('cart-upsell'); if(upsellEl)upsellEl.style.display=(hasMain&&!hasUpsell)?'':'none';
    }
    function updateCartItem(key,quantity){
      fetch('/cart/change.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:key,quantity:quantity})}).then(r=>r.json()).then(cart=>updateCartUI(cart));
    }
    function pmAddUpsell(btn){
      addToCart(parseInt(PM_UPSELL_VARIANT),1,btn);
    }
    async function addToCart(variantId,quantity,btn,sellingPlan){
      quantity=quantity||1;
      var label = btn ? btn.innerHTML : null;
      if(btn){btn.disabled=true;btn.dataset.label=label;btn.innerHTML='Adding…';}
      try{
        var item={id:variantId,quantity:quantity};
        if(sellingPlan){item.selling_plan=parseInt(sellingPlan);}
        var res=await fetch('/cart/add.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[item]})});
        var data=await res.json();
        if(data.status) throw new Error(data.description);
        await new Promise(function(resolve){fetch('/cart.js').then(r=>r.json()).then(function(cart){updateCartUI(cart);resolve();});});
        openCartDrawer();
      }catch(e){alert('Could not add to cart: '+e.message);}
      finally{if(btn){btn.disabled=false;btn.innerHTML=btn.dataset.label||label;}}
    }
    document.addEventListener('DOMContentLoaded',function(){
      fetch('/cart.js').then(r=>r.json()).then(function(cart){
        document.querySelectorAll('.cart-count').forEach(function(el){
          el.textContent=cart.item_count;
          el.style.display=cart.item_count>0?'flex':'none';
        });
      });
    });
    // Smooth scroll helper used by multiple CTAs — scrolls all the way to top of page
    function pmScrollTop(e){ if(e) e.preventDefault(); window.scrollTo({top:0,behavior:'smooth'}); }
