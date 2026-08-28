/* Pinemoor cart drawer + add-to-cart.
   Moved out of the layout so the browser can fetch it in parallel, cache it
   across page views, and run it deferred instead of parsing ~10KB of inline
   JS in the HTML document on every request. Behaviour is byte-identical. */
var cartOpenedAt = 0;
    // Variant IDs that ship free (3-pack "Buy 2 Get 1" and 6-pack / Family bundle)
    var PM_FREE_SHIP = ['52515952001205','52579196403893'];
    // Original ("was") prices shown struck through, by variant id, for subscribe vs one-time
    var ORIG_SUB = {'52514698887349':49.99,'52515952001205':89.99,'52579196403893':119.99};
    var ORIG_ONE = {'52514698887349':49.99,'52515952001205':89.99,'52579196403893':119.99};
    // Fixed "Save $" badge per variant (3-pack, 6-pack)
    var PM_SAVE_AMT = {'52515952001205':40,'52579196403893':50};
    // Bottle count per variant for the cart total "bundle" tag
    var PM_BOTTLES = {'52514698887349':'1 Bottle','52515952001205':'3 Bottles','52579196403893':'6 Bottles'};
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
      if(cart.items.length===0){
        itemsEl.innerHTML='<div class="cart-drawer__empty">Your cart is empty</div>';
        totalEl.textContent='$0.00'; if(footerEl) footerEl.style.display='none'; return;
      }
      if(footerEl) footerEl.style.display='';
      var html='';
      var totalSave=0;
      var PM_DOG_GIFT='52748083724469';
      var items=cart.items.slice().sort(function(a,b){return (String(a.variant_id)===PM_DOG_GIFT?1:0)-(String(b.variant_id)===PM_DOG_GIFT?1:0);});
      items.forEach(function(item){
        var fin=item.final_line_price/100;
        var vid=String(item.variant_id);
        if(vid===PM_DOG_GIFT){
          html+='<div class="cart-item">'
            +'<img decoding="async" src="'+item.image+'" alt="FREE Bottle Of Pinemoor For Dogs" class="cart-item__img">'
            +'<div class="cart-item__info"><div class="cart-item__head">'
              +'<div class="cart-item__main">'
                +'<p class="cart-item__title">FREE Bottle Of Pinemoor For Dogs</p>'
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
        var variant=(item.variant_title && item.variant_title!=='Default Title')?'<div class="cart-item__variant">'+item.variant_title+'</div>':'';
        // Both the 3-pack (b2g1) and 6-pack (b3g3) always ship free
        var freeship=(PM_FREE_SHIP.indexOf(vid)!==-1)?'<span class="cart-item__freeship"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Free Shipping</span>':'';
        // 6-pack (b3g3) also includes a free gift
        var freegift=(vid==='52579196403893')?'<span class="cart-item__freegift"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg> Free Gift Included</span>':'';
        html+='<div class="cart-item">'
          +'<img decoding="async" src="'+item.image+'" alt="'+item.title+'" class="cart-item__img">'
          +'<div class="cart-item__info">'
            +'<div class="cart-item__head">'
              +'<div class="cart-item__main">'
                +'<p class="cart-item__title">Pinemoor&reg; Tick<br>Protection Drops</p>'
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
      var totalFinal=cart.total_price/100;
      var totalComp=totalFinal+totalSave;
      var compEl=document.getElementById('cart-drawer-compare'); if(compEl){if(totalSave>0){compEl.textContent='else{compEl.style.display='none';}}
      totalEl.textContent='$'+totalFinal.toFixed(2);
      var bundleEl=document.getElementById('cart-drawer-bundle'); var bundleTextEl=document.getElementById('cart-drawer-bundletext');
      if(bundleEl&&bundleTextEl){var mainIt=cart.items[0];for(var mi=0;mi<cart.items.length;mi++){if(String(cart.items[mi].variant_id)!==PM_DOG_GIFT){mainIt=cart.items[mi];break;}}var bv=String(mainIt.variant_id); var bl=PM_BOTTLES[bv]||((mainIt.variant_title&&mainIt.variant_title!=='Default Title')?mainIt.variant_title:''); if(bl){bundleTextEl.textContent=bl.toUpperCase();bundleEl.style.display='';}else{bundleEl.style.display='none';}}
    }
    function updateCartItem(key,quantity){
      fetch('/cart/change.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:key,quantity:quantity})}).then(r=>r.json()).then(cart=>updateCartUI(cart));
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
