

   const LS_USERS = "pt_users";
   const LS_CURRENT = "pt_current";
   const LS_LISTS = "pt_listings";
   const LS_FAV = "pt_favs";
   
  
   const $ = id => document.getElementById(id);
   const get = k => JSON.parse(localStorage.getItem(k) || "null");
   const set = (k,v) => localStorage.setItem(k, JSON.stringify(v));
   
 
   function showAuth(){ $("authModal").classList.remove("hidden"); }
   function hideAuth(){ $("authModal").classList.add("hidden"); }
   function toggleAuth(){
     $("loginForm").classList.toggle("hidden");
     $("regForm").classList.toggle("hidden");
     $("authTitle").textContent = $("regForm").classList.contains("hidden") ? "Kirish" : "Roʻyxatdan oʻtish";
   }
   function register(){
     const u = $("regUser").value.trim(), p = $("regPass").value;
     if(!u||!p){ alert("Toʻldiring"); return; }
     let users = get(LS_USERS) || {};
     if(users[u]){ alert("Foydalanuvchi bor"); return; }
     users[u] = {pass:p};
     set(LS_USERS, users);
     alert("Roʻyxatdan oʻtildi");
     toggleAuth();
   }
   function login(){
     const u = $("loginUser").value.trim(), p = $("loginPass").value;
     let users = get(LS_USERS) || {};
     if(users[u] && users[u].pass === p){
       set(LS_CURRENT, u);
       $("authModal").classList.add("hidden");
       initAuthState();
     } else alert("Noto'g'ri login/parol");
   }
   function logout(){
     localStorage.removeItem(LS_CURRENT);
     initAuthState();
   }
   function initAuthState(){
     const cur = localStorage.getItem(LS_CURRENT);
     if(cur){
       $("btnLogout").classList.remove("hidden");
       $("btnShowAuth").classList.add("hidden");
     } else {
       $("btnLogout").classList.add("hidden");
       $("btnShowAuth").classList.remove("hidden");
     }
   }
   
  
   function addListing(){
     const title = $("petTitle").value.trim();
     if(!title){ alert("Ism kiriting"); return; }
     const listing = {
       id: Date.now().toString(36),
       title,
       type: $("petType").value,
       age: $("petAge").value || "N/A",
       price: $("petPrice").value.trim() || "Bepul",
       location: $("petLocation").value.trim() || "Toshkent",
       image: $("petImage").value.trim() || "",
       desc: $("petDesc").value.trim() || "",
       created: new Date().toISOString()
     };
     let lists = get(LS_LISTS) || [];
     lists.unshift(listing);
     set(LS_LISTS, lists);
     clearForm();
     renderListings();
   }
   function clearForm(){
     ["petTitle","petAge","petPrice","petLocation","petImage","petDesc"].forEach(id=>$(id).value="");
   }
   function renderListings(){
     const container = $("listings");
     container.innerHTML = "";
     let lists = get(LS_LISTS) || [];
     const favs = get(LS_FAV) || {};
     const q = $("searchInput") ? $("searchInput").value.toLowerCase() : "";
     const ft = $("filterType") ? $("filterType").value : "";
     const fp = $("filterPrice") ? $("filterPrice").value : "";
   
     lists = lists.filter(l=>{
       if(ft && l.type !== ft) return false;
       if(fp){
         if(fp==="free" && (l.price && l.price.toLowerCase()!=="bepul")) return false;
         if(fp==="paid" && (l.price.toLowerCase()==="bepul")) return false;
       }
       if(q && !(`${l.title} ${l.location} ${l.type} ${l.desc}`.toLowerCase().includes(q))) return false;
       return true;
     });
   
     if(lists.length===0){ container.innerHTML = "<div class='small'>E'lon topilmadi</div>"; return; }
   
     lists.forEach(l=>{
       const card = document.createElement("div"); card.className="card";
       card.innerHTML = `
         <div style="min-height:120px;">
           ${l.image ? `<img src="${l.image}" class="pet-img">` : `<div class="pet-img"></div>`}
         </div>
         <div>
           <div style="display:flex;justify-content:space-between;align-items:center">
             <div><strong>${escapeHtml(l.title)}</strong><div class="kicker">${escapeHtml(l.type)} • ${escapeHtml(l.location)}</div></div>
             <div class="price">${escapeHtml(l.price)}</div>
           </div>
           <div class="small" style="margin-top:8px">${escapeHtml(l.desc)}</div>
           <div class="actions">
             <div class="kicker">Yoshi: ${escapeHtml(String(l.age))}</div>
             <div>
               <button class="btn ghost" onclick='contact("${l.id}")'>Bog'lanish</button>
               <button class="btn" onclick='toggleFav("${l.id}")'>${favs[l.id] ? "Sevimli" : "Sevimlilarga qo'sh"}</button>
             </div>
           </div>
         </div>`;
       container.appendChild(card);
     });
   }
   
   
   function getFavs(){ return get(LS_FAV) || {}; }
   function toggleFav(id){
     const cur = getFavs();
     cur[id] = cur[id] ? false : true;
     set(LS_FAV, cur);
     renderListings();
   }
   function contact(id){
     const lists = get(LS_LISTS) || [];
     const item = lists.find(x=>x.id===id);
     if(!item) return alert("Topilmadi");
     const cur = localStorage.getItem(LS_CURRENT) || "Mehmonga";
     alert(`E'lon: ${item.title}\nManzil: ${item.location}\nBog'lanish: (demo) - Sizning raqamingizni e'lon xabarida qoldiring.`);
   }
   

   function computeStats(){
     const lists = get(LS_LISTS) || [];
     const total = lists.length;
     const byType = {};
     const byLoc = {};
     lists.forEach(l=>{
       byType[l.type] = (byType[l.type]||0)+1;
       const loc = l.location || "Noma'lum";
       byLoc[loc] = (byLoc[loc]||0)+1;
     });
     return { total, byType, byLoc };
   }
   
   
   function escapeHtml(s=''){ return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }
   
   
   window.addEventListener("DOMContentLoaded", ()=>{
     initAuthState();
     if(document.getElementById("listings")) renderListings();
   
    
     if(document.getElementById("statsRoot")) {
       const root = $("statsRoot");
       const st = computeStats();
       root.innerHTML = `<div class="panel"><h3>Umumiy e'lonlar: ${st.total}</h3></div>`;
       const t1 = document.createElement("div"); t1.className="panel";
       t1.innerHTML = `<h3>Hayvon turlari</h3>${Object.keys(st.byType).length? Object.entries(st.byType).map(([k,v])=>`<div>${k}: ${v}</div>`).join("") : "<div class='small'>Ma'lumot yo'q</div>"}`;
       root.appendChild(t1);
       const t2 = document.createElement("div"); t2.className="panel";
       t2.innerHTML = `<h3>Hududlar (eng faol)</h3>${Object.keys(st.byLoc).length? Object.entries(st.byLoc).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div>${k}: ${v}</div>`).join("") : "<div class='small'>Ma'lumot yo'q</div>"}`;
       root.appendChild(t2);
     }
   
  
     document.addEventListener("click", e=>{
       if(!e.target.closest(".auth-card") && !e.target.closest("#btnShowAuth") && !e.target.closest("#authModal")) return;
     });
   });
   