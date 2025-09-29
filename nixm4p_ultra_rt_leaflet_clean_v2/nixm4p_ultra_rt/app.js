// ====================== MAP CORE (Leaflet) ======================
const MAP_START = [12.125, -86.236];
const map = L.map('map', { zoomControl:true, minZoom:5, maxZoom:19 }).setView(MAP_START, 13);

// ---- Base maps ----
const baseLayers = {};
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'&copy; OpenStreetMap' }).addTo(map);
const cartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution:'&copy; CARTO' });
const cartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution:'&copy; CARTO' });
const esriStreets = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', { attribution:'Tiles &copy; Esri' });
const esriImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution:'Tiles &copy; Esri' });
baseLayers["OSM"] = osm;
baseLayers["Carto Light"] = cartoLight;
baseLayers["Carto Dark"] = cartoDark;
baseLayers["Esri Streets"] = esriStreets;
baseLayers["Esri Satélite"] = esriImagery;

// ---- Overlays (capas) ----
const routesLayer = L.layerGroup().addTo(map);
const stopsLayer = L.layerGroup().addTo(map);
const busesLayer = L.layerGroup().addTo(map);
const nationalRoutesLayer = L.layerGroup().addTo(map);

// Seguridad/Salud
const policeLayer = L.layerGroup();
const fireLayer = L.layerGroup();
const redCrossLayer = L.layerGroup();
const hospitalsLayer = L.layerGroup();
const pharmacies24Layer = L.layerGroup();

// Servicios pasajero
const parksLayer = L.layerGroup();
const atmsLayer = L.layerGroup();
const gasLayer = L.layerGroup();
const marketsLayer = L.layerGroup();
const universitiesLayer = L.layerGroup();

// Accesibilidad
const accessibilityLayer = L.layerGroup();
const seniorsLayer = L.layerGroup();
const inclusiveSpacesLayer = L.layerGroup();

// Valor agregado
const museumsLayer = L.layerGroup();
const stadiumsLayer = L.layerGroup();
const govOfficesLayer = L.layerGroup();
const hotelsLayer = L.layerGroup();

// Transporte complementario
const taxiStandsLayer = L.layerGroup();
const busTerminalsLayer = L.layerGroup();
const transferCentersLayer = L.layerGroup();
const parkingAreasLayer = L.layerGroup();

const overlays = {
  "🔵 Transporte · Rutas urbanas": routesLayer,
  "🔵 Transporte · Paradas": stopsLayer,
  "🔵 Transporte · Rutas nacionales": nationalRoutesLayer,
  "🚕 Transporte · Taxis autorizados": taxiStandsLayer,
  "🔵 Transporte · Terminales": busTerminalsLayer,
  "🔵 Transporte · Transferencias": transferCentersLayer,
  "🔵 Transporte · Parqueo/Estacionamiento": parkingAreasLayer,
  "🟢 Salud · Hospitales": hospitalsLayer,
  "🟢 Salud · Farmacias 24h": pharmacies24Layer,
  "🔴 Emergencias · Policía": policeLayer,
  "🔴 Emergencias · Bomberos": fireLayer,
  "🔴 Emergencias · Cruz Roja / 1ros aux": redCrossLayer,
  "🟡 Referencias · Parques/Plazas": parksLayer,
  "🟡 Referencias · ATMs/Bancos": atmsLayer,
  "🟡 Referencias · Gasolineras": gasLayer,
  "🟡 Referencias · Mercados/Centros comerciales": marketsLayer,
  "🟡 Referencias · Universidades/Colegios": universitiesLayer,
  "♿ Inclusión · Rampas/Accesos": accessibilityLayer,
  "♿ Inclusión · Adulto mayor": seniorsLayer,
  "♿ Inclusión · Espacios inclusivos": inclusiveSpacesLayer,
  "⭐ Valor · Museos/Teatros/Turismo": museumsLayer,
  "⭐ Valor · Estadios/Deportes": stadiumsLayer,
  "⭐ Valor · Gobierno": govOfficesLayer,
  "⭐ Valor · Hoteles/Zonas de hospedaje": hotelsLayer
};
L.control.layers(baseLayers, overlays, { collapsed:true }).addTo(map);

// ---- Icons ----
function busDivIcon(imgPath){
  return L.divIcon({
    className:'bus-marker',
    html:`<img src="${imgPath}" alt="bus"/>`,
    iconSize:[36,36], iconAnchor:[18,18], popupAnchor:[0,-18]
  });
}
function emojiMarker(emoji, size=22){
  return L.divIcon({
    className:'emoji-marker',
    html:`<div style="font-size:${size}px;line-height:1">${emoji}</div>`,
    iconSize:[size,size], iconAnchor:[size/2,size/2], popupAnchor:[0,-size/2]
  });
}

// ---- Data (rutas urbanas + paradas) ----
const ROUTES = {
  "Ruta A": {
    code:"110",
    color:"#60a5fa",
    path:[[12.142,-86.270],[12.137,-86.255],[12.130,-86.245],[12.125,-86.236],[12.120,-86.228]]
  },
  "Ruta B": {
    code:"120",
    color:"#3b82f6",
    path:[[12.110,-86.260],[12.111,-86.248],[12.113,-86.235],[12.118,-86.226],[12.125,-86.220]]
  }
};

const STOPS = {
  "Ruta A": [
    {name:"Terminal Norte", coord:[12.142,-86.270]},
    {name:"Mercado Central", coord:[12.130,-86.245]},
    {name:"Parque Central", coord:[12.125,-86.236]},
    {name:"Hospital", coord:[12.120,-86.228]}
  ],
  "Ruta B": [
    {name:"U. Regional", coord:[12.111,-86.248]},
    {name:"Colegio", coord:[12.113,-86.235]},
    {name:"Plaza Sur", coord:[12.118,-86.226]},
    {name:"Terminal Sur", coord:[12.125,-86.220]}
  ]
};

function drawRoutes(){
  routesLayer.clearLayers(); stopsLayer.clearLayers();
  Object.entries(ROUTES).forEach(([name, r])=>{
    L.polyline(r.path, { color:r.color, weight:4, opacity:.9 }).addTo(routesLayer);
    (STOPS[name]||[]).forEach(s=> L.circleMarker(s.coord, {radius:5, color:r.color, fillColor:r.color, fillOpacity:.9}).addTo(stopsLayer).bindTooltip(`${name}: ${s.name}`));
  });
}
drawRoutes();

// ---- Rutas nacionales (simplificadas) ----
const HUBS = {
  Managua: [12.136,-86.251],
  León: [12.437,-86.878],
  Chinandega: [12.628,-87.131],
  Granada: [11.933,-85.956],
  Masaya: [11.975,-86.095],
  Matagalpa: [12.916,-85.917],
  Jinotega: [13.091,-85.999],
  Estelí: [13.087,-86.353],
  Ocotal: [13.632,-86.475],
  Somoto: [13.480,-86.583],
  Rivas: [11.437,-85.827],
  Juigalpa: [12.106,-85.364],
  "San Carlos": [11.123,-84.777],
  Bluefields: [11.996,-83.764],
  Bilwi: [14.035,-83.388],
  Boaco: [12.471,-85.661]
};
const NATIONAL_ROUTES = [
  { name:"Troncal Occidente", color:"#3b82f6", path:[HUBS.Managua, HUBS.Masaya, HUBS.León, HUBS.Chinandega] },
  { name:"Troncal Centro-Norte", color:"#60a5fa", path:[HUBS.Managua, HUBS.Matagalpa, HUBS.Jinotega, HUBS.Estelí, HUBS.Ocotal, HUBS.Somoto] },
  { name:"Troncal Sur", color:"#2563eb", path:[HUBS.Managua, HUBS.Masaya, HUBS.Granada, HUBS.Rivas] },
  { name:"Troncal Río San Juan", color:"#1d4ed8", path:[HUBS.Managua, HUBS.Juigalpa, HUBS["San Carlos"]] },
  { name:"Troncal Caribe Sur", color:"#0ea5e9", path:[HUBS.Managua, HUBS.Masaya, HUBS.Granada, HUBS.Juigalpa, HUBS.Bluefields] },
  { name:"Troncal Caribe Norte", color:"#38bdf8", path:[HUBS.Managua, HUBS.Matagalpa, HUBS.Jinotega, HUBS.Bilwi] }
];
function drawNationalRoutes(){
  nationalRoutesLayer.clearLayers();
  NATIONAL_ROUTES.forEach(r=> L.polyline(r.path, { color:r.color, weight:3, opacity:.8 }).addTo(nationalRoutesLayer).bindTooltip(r.name));
}
drawNationalRoutes();

// ---- POIs por categoría ----
const POIS = {
  police:[{name:"Policía Nacional (demo) - Managua", coord:[12.152,-86.268]}],
  fire:[{name:"Bomberos (demo) - Managua", coord:[12.132,-86.251]}],
  redcross:[{name:"Cruz Roja (demo) - Managua", coord:[12.145,-86.261]}],
  hospitals:[
    {name:"Hospital Escuela Manolo Morales (Managua)", coord:[12.12241,-86.24597]},
    {name:"HEODRA - Hospital Escuela Oscar Danilo Rosales (León)", coord:[12.43363,-86.87803]}
  ],
  pharmacies24:[{name:"Farmacia 24h (demo) - Managua", coord:[12.134,-86.268]}],
  parks:[{name:"Plaza de la Revolución (Managua)", coord:[12.15639,-86.27215]}],
  atms:[{name:"Cajero BAC (demo) - Managua", coord:[12.140,-86.254]}],
  gas:[{name:"Gasolinera Puma (demo) - Managua", coord:[12.120,-86.255]}],
  markets:[{name:"Mercado Oriental (demo) - Managua", coord:[12.142,-86.224]}],
  universities:[{name:"UNAN-Managua (demo)", coord:[12.131,-86.267]}],
  accessibility:[{name:"Cruce con rampa (demo) - Managua", coord:[12.138,-86.249]}],
  seniors:[{name:"Centro Adulto Mayor (demo) - Managua", coord:[12.127,-86.237]}],
  inclusive:[{name:"Parque inclusivo (demo) - Masaya", coord:[11.976,-86.092]}],
  museums:[{name:"Museo Huellas de Acahualinca (demo) - Managua", coord:[12.160,-86.299]}],
  stadiums:[{name:"Estadio Nacional Soberanía (Managua)", coord:[12.149603,-86.283036]}],
  government:[{name:"Alcaldía de Managua (demo)", coord:[12.159,-86.270]}],
  hotels:[{name:"Hotel (demo) - Managua", coord:[12.144,-86.253]}],
  taxis:[{name:"Punto de taxis - UCA", coord:[12.136,-86.269]}],
  busTerminals:[{name:"Terminal UCA (Managua)", coord:[12.136,-86.269]},{name:"Terminal León", coord:[12.442,-86.883]}],
  transferCenters:[{name:"Centro de Transferencia (demo) - Managua", coord:[12.140,-86.257]}],
  parkingAreas:[{name:"Parqueo público (demo) - Managua", coord:[12.138,-86.252]}]
};
function drawPOIs(){
  POIS.police.forEach(p=> L.marker(p.coord,{icon:emojiMarker("🛡️")}).addTo(policeLayer).bindTooltip(p.name));
  POIS.fire.forEach(p=> L.marker(p.coord,{icon:emojiMarker("🔥")}).addTo(fireLayer).bindTooltip(p.name));
  POIS.redcross.forEach(p=> L.marker(p.coord,{icon:emojiMarker("➕")}).addTo(redCrossLayer).bindTooltip(p.name));
  POIS.hospitals.forEach(p=> L.marker(p.coord,{icon:emojiMarker("🏥")}).addTo(hospitalsLayer).bindTooltip(p.name));
  POIS.pharmacies24.forEach(p=> L.marker(p.coord,{icon:emojiMarker("💊")}).addTo(pharmacies24Layer).bindTooltip(p.name));
  POIS.parks.forEach(p=> L.marker(p.coord,{icon:emojiMarker("🟡")}).addTo(parksLayer).bindTooltip(p.name));
  POIS.atms.forEach(p=> L.marker(p.coord,{icon:emojiMarker("🏧")}).addTo(atmsLayer).bindTooltip(p.name));
  POIS.gas.forEach(p=> L.marker(p.coord,{icon:emojiMarker("⛽")}).addTo(gasLayer).bindTooltip(p.name));
  POIS.markets.forEach(p=> L.marker(p.coord,{icon:emojiMarker("🛒")}).addTo(marketsLayer).bindTooltip(p.name));
  POIS.universities.forEach(p=> L.marker(p.coord,{icon:emojiMarker("🎓")}).addTo(universitiesLayer).bindTooltip(p.name));
  POIS.accessibility.forEach(p=> L.marker(p.coord,{icon:emojiMarker("♿")}).addTo(accessibilityLayer).bindTooltip(p.name));
  POIS.seniors.forEach(p=> L.marker(p.coord,{icon:emojiMarker("👴")}).addTo(seniorsLayer).bindTooltip(p.name));
  POIS.inclusive.forEach(p=> L.marker(p.coord,{icon:emojiMarker("🤝")}).addTo(inclusiveSpacesLayer).bindTooltip(p.name));
  POIS.museums.forEach(p=> L.marker(p.coord,{icon:emojiMarker("🏛️")}).addTo(museumsLayer).bindTooltip(p.name));
  POIS.stadiums.forEach(p=> L.marker(p.coord,{icon:emojiMarker("🏟️")}).addTo(stadiumsLayer).bindTooltip(p.name));
  POIS.government.forEach(p=> L.marker(p.coord,{icon:emojiMarker("🏢")}).addTo(govOfficesLayer).bindTooltip(p.name));
  POIS.hotels.forEach(p=> L.marker(p.coord,{icon:emojiMarker("🛎️")}).addTo(hotelsLayer).bindTooltip(p.name));
  POIS.taxis.forEach(p=> L.marker(p.coord,{icon:emojiMarker("🚕")}).addTo(taxiStandsLayer).bindTooltip(p.name));
  POIS.busTerminals.forEach(p=> L.marker(p.coord,{icon:emojiMarker("🚌")}).addTo(busTerminalsLayer).bindTooltip(p.name));
  POIS.transferCenters.forEach(p=> L.marker(p.coord,{icon:emojiMarker("🔁")}).addTo(transferCentersLayer).bindTooltip(p.name));
  POIS.parkingAreas.forEach(p=> L.marker(p.coord,{icon:emojiMarker("🅿️")}).addTo(parkingAreasLayer).bindTooltip(p.name));
}
drawPOIs();

// ===================== SIMULACIÓN DE BUSES =====================
const buses = new Map();
let selectedBusId = null;
let followSelected = false;

const statusEl = document.getElementById('status');
const busCountEl = document.getElementById('busCount');
const pImg = document.getElementById('p-img');
const panelTitle = document.getElementById('p-title');
const panelTime = document.getElementById('p-time');
const pRoute = document.getElementById('p-route');
const pSpeed = document.getElementById('p-speed');
const pStop = document.getElementById('p-stop');
const pEta = document.getElementById('p-eta');

// Utils
const toRad = d=> d*Math.PI/180;
function haversine([lat1,lon1],[lat2,lon2]){
  const R=6371000, dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}
function nearestStop(routeName, coord){
  const arr = STOPS[routeName]||[];
  let best={name:'—', dist:Infinity};
  arr.forEach(s=>{ const d=haversine(coord, s.coord); if (d<best.dist) best={name:s.name, dist:d}; });
  return best;
}

function spawnBus(id, routeName){
  const r = ROUTES[routeName];
  const path = r.path;
  const segIdx = Math.floor(Math.random()*(path.length-1));
  const A = path[segIdx];
  const pos = { lat:A[0], lng:A[1] };
  const img = (id%3===0)?'assets/bus_a.png':(id%3===1)?'assets/bus_b.png':'assets/bus_c.png';
  const marker = L.marker([pos.lat,pos.lng], { icon: busDivIcon(img), zIndexOffset:1000 }).addTo(busesLayer);
  marker.on('click', ()=> selectBus(id));
  const speedMs = 8 + Math.random()*4; // 8–12 m/s (~29–43 km/h)
  buses.set(id, { id, marker, routeName, segIdx, pos, speedMs, img, speedKmh:Math.round(speedMs*3.6) });
}

function initBuses(n=12){
  const routeNames = Object.keys(ROUTES);
  for(let i=0;i<n;i++){
    const route = routeNames[i%routeNames.length];
    spawnBus(i, route);
  }
  busCountEl && (busCountEl.textContent = buses.size);
  statusEl && (statusEl.textContent = 'En línea (simulación RT)');
}
initBuses();

function updatePopup(rec){
  const rc = ROUTES[rec.routeName]?.code || '—';
  rec.marker.bindPopup(`<b>${rec.id}</b><br>Ruta: ${rec.routeName} <span style="border:1px solid #2a3b6a;padding:1px 4px;border-radius:8px;background:#223059;color:#e6ebff">${rc}</span><br>Vel: ${rec.speedKmh} km/h`, { closeButton:false }).openPopup();
}
function updatePanel(rec){
  const near = nearestStop(rec.routeName, [rec.pos.lat, rec.pos.lng]);
  const etaMin = (rec.speedMs>0) ? Math.round( (near.dist / rec.speedMs) / 60 ) : '—';
  pImg.src = rec.img;
  panelTitle.textContent = rec.id;
  panelTime.textContent = new Date().toLocaleTimeString();
  pRoute.textContent = rec.routeName;
  const rc = ROUTES[rec.routeName]?.code || '—';
  const pRCEl = document.getElementById('p-routeCode'); if (pRCEl) pRCEl.textContent = rc;
  pSpeed.textContent = rec.speedKmh;
  pStop.textContent = `${near.name} (${Math.round(near.dist)} m)`;
  pEta.textContent = `${etaMin} min`;
}

function selectBus(id){
  selectedBusId = id;
  const rec = buses.get(id);
  if (!rec) return;
  updatePopup(rec);
  updatePanel(rec);
  map.setView([rec.pos.lat, rec.pos.lng], 16, { animate:true });
}

// ---- Tick movement ----
let lastTs = performance.now();
function tick(){
  const now = performance.now();
  const dt = Math.max(0.016, (now - lastTs)/1000);
  lastTs = now;

  buses.forEach(rec=>{
    const path = ROUTES[rec.routeName].path;
    let A = path[rec.segIdx], B = path[(rec.segIdx+1)%path.length];
    const distAB = haversine(A, B);
    const distMove = rec.speedMs * dt;
    const frac = Math.min(1, distMove / distAB);
    const lat = rec.pos.lat + (B[0]-A[0]) * frac;
    const lng = rec.pos.lng + (B[1]-A[1]) * frac;
    rec.pos = { lat, lng };
    if (frac>=1 || haversine([lat,lng], B) < 5){
      rec.segIdx = (rec.segIdx+1) % (path.length-1);
      A = path[rec.segIdx]; B = path[rec.segIdx+1];
      rec.pos = { lat:A[0], lng:A[1] };
    }
    rec.marker.setLatLng([rec.pos.lat, rec.pos.lng]);
  });

  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// ---- UI buttons ----
document.getElementById('btnLocate').addEventListener('click', ()=>{
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    pos=>{
      const { latitude, longitude } = pos.coords;
      L.marker([latitude, longitude], { icon: emojiMarker('📍', 22) }).addTo(map).bindTooltip('Estás aquí');
      map.setView([latitude, longitude], 15);
    },
    err=>{ console.warn(err); },
    { enableHighAccuracy:true, timeout:8000, maximumAge:0 }
  );
});
document.getElementById('btnFollow').addEventListener('click', ()=>{
  const el = document.getElementById('btnFollow');
  window.followSelected = !window.followSelected;
  el.style.borderColor = window.followSelected ? 'var(--accent)' : '#263152';
});

// ---- Keep bus count visible ----
setInterval(()=> busCountEl && (busCountEl.textContent = buses.size), 1000);


// ===== User POIs (click-to-add) =====
const userPoisLayer = L.layerGroup().addTo(map);
overlays["📝 Mis puntos"] = userPoisLayer;

// Persist in localStorage
const USER_POIS_KEY = "nix_user_pois_v1";
function loadUserPois(){
  try{ const arr = JSON.parse(localStorage.getItem(USER_POIS_KEY)||"[]");
    arr.forEach(p=> addUserPoi(p, false));
  }catch(e){ console.warn(e); }
}
function saveUserPois(){
  const arr=[];
  userPoisLayer.eachLayer(l=>{
    if(l.feature && l.feature.properties){
      const {name,cat,lat,lng} = l.feature.properties;
      arr.push({name,cat,lat,lng});
    }
  });
  localStorage.setItem(USER_POIS_KEY, JSON.stringify(arr));
}
function addUserPoi(p, save=true){
  const iconMap = {
    police:"🛡️", fire:"🔥", redcross:"➕", hospitals:"🏥", pharmacies24:"💊",
    parks:"🟡", atms:"🏧", gas:"⛽", markets:"🛒", universities:"🎓",
    accessibility:"♿", seniors:"👴", inclusive:"🤝", museums:"🏛️", stadiums:"🏟️",
    government:"🏢", hotels:"🛎️", taxis:"🚕", busTerminals:"🚌", transferCenters:"🔁",
    parkingAreas:"🅿️"
  };
  const marker = L.marker([p.lat, p.lng], { icon: emojiMarker(iconMap[p.cat]||"📌") }).addTo(userPoisLayer);
  marker.bindTooltip(`${p.name} (${p.cat})`);
  marker.feature = { type:"Feature", properties:{...p} };
  if (save) saveUserPois();
}
let addMode = false;
document.getElementById('btnAddPoi').addEventListener('click', ()=>{
  addMode = !addMode;
  document.getElementById('btnAddPoi').style.borderColor = addMode ? 'var(--accent)' : '#263152';
});
map.on('click', (e)=>{
  if (!addMode) return;
  const name = prompt('Nombre del punto:');
  if (!name) return;
  const cat = prompt('Categoría (police, fire, redcross, hospitals, pharmacies24, parks, atms, gas, markets, universities, accessibility, seniors, inclusive, museums, stadiums, government, hotels, taxis, busTerminals, transferCenters, parkingAreas):', 'hospitals');
  const p = { name, cat, lat:e.latlng.lat, lng:e.latlng.lng };
  addUserPoi(p, true);
});

document.getElementById('btnExport').addEventListener('click', ()=>{
  const data = localStorage.getItem(USER_POIS_KEY)||"[]";
  const blob = new Blob([data], {type:"application/json"});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = "mis_pois.json";
  a.click();
});
loadUserPois();
