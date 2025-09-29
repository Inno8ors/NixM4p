// ===================================================
// NixM4P – ULTRA SMOOTH: animación en tiempo real
// ===================================================
const MAP_START = [12.115, -86.236];
const map = L.map('map', { zoomControl:true, minZoom:5, maxZoom:19 }).setView(MAP_START, 14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'&copy; OpenStreetMap' }).addTo(map);

// Capas (sin clustering para que NUNCA desaparezcan)
const busesLayer = L.layerGroup().addTo(map);
const stopsLayer = L.layerGroup().addTo(map);
const routesLayer = L.layerGroup().addTo(map);

// Iconos
const arrowIcon = L.icon({ iconUrl:'assets/arrow.png', iconSize:[28,28], iconAnchor:[14,14] });

// Generador de DivIcon con imagen
function busDivIcon(imgPath){
  return L.divIcon({
    className: 'bus-marker',
    html: `<img src="${imgPath}" alt="bus"/>`,
    iconSize: [36,36],
    iconAnchor: [18,18],
    popupAnchor: [0,-18]
  });
}

// Rutas y paradas (demo)
const ROUTES = {
  "Ruta A": {
    color:"#9ca3af",
    path:[[12.142,-86.270],[12.137,-86.255],[12.130,-86.245],[12.125,-86.236],[12.120,-86.228]],
    stops:[
      {name:"Terminal Norte", coord:[12.142,-86.270]},
      {name:"Mercado Central", coord:[12.130,-86.245]},
      {name:"Parque Central", coord:[12.125,-86.236]},
      {name:"Hospital", coord:[12.120,-86.228]}
    ]
  },
  "Ruta B": {
    color:"#cbd5e1",
    path:[[12.110,-86.260],[12.111,-86.248],[12.113,-86.235],[12.118,-86.226],[12.125,-86.220]],
    stops:[
      {name:"U. Regional", coord:[12.111,-86.248]},
      {name:"Colegio", coord:[12.113,-86.235]},
      {name:"Plaza Sur", coord:[12.118,-86.226]},
      {name:"Terminal Sur", coord:[12.125,-86.220]}
    ]
  }
};

function drawRoutes(){
  routesLayer.clearLayers(); stopsLayer.clearLayers();
  Object.entries(ROUTES).forEach(([name, r])=>{
    L.polyline(r.path, { color:r.color, weight:4, opacity:.9 }).addTo(routesLayer);
    r.stops.forEach(s=> L.circleMarker(s.coord, {radius:5, color:'#38bdf8', weight:2, fill:true, fillOpacity:.9}).addTo(stopsLayer).bindTooltip(`${name}: ${s.name}`));
  });
}
drawRoutes();

// Panel
const statusEl = document.getElementById('status');
const busCountEl = document.getElementById('busCount');
const pImg = document.getElementById('p-img');
const panelTitle = document.getElementById('p-title');
const panelTime = document.getElementById('p-time');
const pRoute = document.getElementById('p-route');
const pSpeed = document.getElementById('p-speed');
const pStop = document.getElementById('p-stop');
const pEta = document.getElementById('p-eta');

let selectedBusId = null;
let followSelected = false;

// Estado de buses: animación suave
const BUS_IMAGES = ['assets/bus_a.png','assets/bus_b.png','assets/bus_c.png'];
const buses = new Map(); // id -> {marker, heading, img, data, anim}

const toRad = d=> d*Math.PI/180;
function haversine([lat1,lon1],[lat2,lon2]){
  const R=6371000, dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}
function nearestStop(routeName, coord){
  const r = ROUTES[routeName]; if (!r) return {name:'—', dist:Infinity};
  let best={name:'—', dist:Infinity};
  r.stops.forEach(s=>{ const d=haversine(coord, s.coord); if (d<best.dist) best={name:s.name, dist:d}; });
  return best;
}
function etaFrom(speedKmh, distMeters){
  const v = Math.max((speedKmh||0)*1000/3600, 0.1);
  const sec = distMeters / v; const m = Math.floor(sec/60), s = Math.round(sec%60);
  return `${m}m ${s}s`;
}

// Simulador con objetivo y animación
const IDs = Array.from({length:14}, (_,i)=>`bus${100+i}`);
function pickImg(id){ return BUS_IMAGES[id % BUS_IMAGES.length]; }
function randomTargetAlong(route){
  const path = ROUTES[route].path;
  const idx = (Math.random()*path.length)|0;
  const jitter = 0.0015;
  const base = path[idx];
  return [base[0] + (Math.random()-0.5)*jitter, base[1] + (Math.random()-0.5)*jitter];
}
function scheduleTargetUpdate(){
  IDs.forEach((id, idx)=>{
    const rec = buses.get(id);
    const route = (idx%2===0)?'Ruta A':'Ruta B';
    const target = randomTargetAlong(route);
    const speed = 20 + Math.random()*25;
    const heading = Math.random()*360;
    // crea si no existe
    if (!rec){
      const img = pickImg(idx);
      const marker = L.marker(target, { icon: busDivIcon(img), zIndexOffset: 1000 }).addTo(busesLayer);
      marker.on('click', ()=> selectBus(id));
      buses.set(id, { marker, heading, img, data:{ id, route, speed, lat:target[0], lng:target[1], ts: Date.now() }, anim:{ from: target, to: target, t: 1, duration: 1000 } });
    } else {
      // actualizar target
      rec.anim.from = [rec.data.lat, rec.data.lng];
      rec.anim.to = target;
      rec.anim.t = 0;
      rec.anim.duration = 1200; // ms
      rec.data.speed = Math.round(speed);
      rec.heading = heading;
      rec.data.ts = Date.now();
      rec.data.route = route;
    }
  });
  statusEl.textContent = 'En línea (simulación)';
}
// cada 1.2s nuevo objetivo
setInterval(scheduleTargetUpdate, 1200);
scheduleTargetUpdate();

// Animación 60fps
function lerp(a,b,t){ return a + (b-a)*t; }
function animate(){
  const now = performance.now();
  buses.forEach(rec=>{
    const { anim, data, marker } = rec;
    if (anim.t < 1){
      // ease out cubic
      anim.t = Math.min(1, anim.t + (16/anim.duration));
      const tt = 1 - Math.pow(1-anim.t, 3);
      const lat = lerp(anim.from[0], anim.to[0], tt);
      const lng = lerp(anim.from[1], anim.to[1], tt);
      data.lat = lat; data.lng = lng;
      marker.setLatLng([lat,lng]);
      if (followSelected && selectedBusId === data.id){
        map.panTo([lat,lng], { animate: true, duration: 0.25 });
      }
      // actualizar popup si está abierto
      if (marker.isPopupOpen()){
        updatePopup(rec);
      }
      // actualizar panel si es seleccionado
      if (selectedBusId === data.id){
        updatePanel(rec);
      }
    }
  });
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// Popup y panel
function updatePopup(rec){
  const near = nearestStop(rec.data.route, [rec.data.lat, rec.data.lng]);
  const eta = etaFrom(rec.data.speed, near.dist);
  rec.data.nextStop = near.name;
  rec.data.distToStop = Math.round(near.dist);
  rec.data.eta = eta;
  rec.marker.bindPopup(`
    <div style="display:flex;gap:10px;align-items:center">
      <img src="${rec.img}" alt="bus" style="width:58px;height:58px;border-radius:10px;border:1px solid #ddd" />
      <div>
        <div style="font-weight:700">${rec.data.id}</div>
        <div>Ruta: ${rec.data.route}</div>
        <div>Vel: ${rec.data.speed} km/h</div>
        <div>Próx. parada: ${near.name}</div>
        <div>ETA: ${eta}</div>
      </div>
    </div>
  `, { autoClose: false, closeOnClick: false });
}
function updatePanel(rec){
  pImg.src = rec.img;
  panelTitle.textContent = rec.data.id;
  panelTime.textContent = new Date(rec.data.ts).toLocaleTimeString();
  pRoute.textContent = rec.data.route;
  pSpeed.textContent = `${rec.data.speed} km/h`;
  const near = nearestStop(rec.data.route, [rec.data.lat, rec.data.lng]);
  const eta = etaFrom(rec.data.speed, near.dist);
  pStop.textContent = `${near.name} (${Math.round(near.dist)} m)`;
  pEta.textContent = eta;
}

// Selección bus
function selectBus(id){
  selectedBusId = id;
  const rec = buses.get(id); if (!rec) return;
  rec.marker.openPopup();
  updatePopup(rec);
  updatePanel(rec);
  rec.marker.bringToFront();
  map.setView([rec.data.lat, rec.data.lng], 16, { animate:true });
}

// Geolocalización usuario
document.getElementById('btnLocate').addEventListener('click', ()=>{
  if(!navigator.geolocation){ alert('Geolocalización no soportada'); return; }
  navigator.geolocation.getCurrentPosition(
    pos=>{
      const { latitude, longitude } = pos.coords;
      L.marker([latitude, longitude], { icon: arrowIcon, zIndexOffset: 500 }).addTo(map).bindPopup('Estás aquí').openPopup();
      map.setView([latitude, longitude], 16, { animate:true });
    },
    err=> alert('No se pudo obtener ubicación: '+err.message),
    { enableHighAccuracy:true, timeout:8000, maximumAge:0 }
  );
});

// Seguir bus seleccionado
document.getElementById('btnFollow').addEventListener('click', ()=>{
  followSelected = !followSelected;
  document.getElementById('btnFollow').style.borderColor = followSelected ? 'var(--accent)' : '#263152';
});

// Conteo
setInterval(()=>{
  busCountEl && (busCountEl.textContent = buses.size);
}, 500);
