// ===== DATA MODELS =====
const parkingZones = [
    { id: 'fed-square',   name: "Fed Square",    coords: [-37.8180, 144.9691], currentAvail: 65, predicted30: 52, stressIndex: 42, totalSpots: 450, color: '#10b981' },
    { id: 'queen-vic',    name: "Queen Vic Mkt", coords: [-37.8076, 144.9568], currentAvail: 58, predicted30: 45, stressIndex: 48, totalSpots: 380, color: '#10b981' },
    { id: 'crown-casino', name: "Crown Casino",  coords: [-37.8236, 144.9583], currentAvail: 12, predicted30: 8,  stressIndex: 92, totalSpots: 600, color: '#ef4444' },
    { id: 'docklands',    name: "Docklands",     coords: [-37.8183, 144.9450], currentAvail: 18, predicted30: 12, stressIndex: 85, totalSpots: 520, color: '#ef4444' },
    { id: 'southbank',    name: "Southbank",     coords: [-37.8220, 144.9650], currentAvail: 22, predicted30: 18, stressIndex: 78, totalSpots: 400, color: '#dc2626' },
    { id: 'mcg',          name: "MCG Area",      coords: [-37.8200, 144.9834], currentAvail: 35, predicted30: 25, stressIndex: 65, totalSpots: 800, color: '#f59e0b' }
];

const hourlyPattern = [
    { hour: '6AM',  occupancy: 25 }, { hour: '7AM',  occupancy: 38 }, { hour: '8AM',  occupancy: 62 },
    { hour: '9AM',  occupancy: 78 }, { hour: '10AM', occupancy: 82 }, { hour: '11AM', occupancy: 85 },
    { hour: '12PM', occupancy: 88 }, { hour: '1PM',  occupancy: 86 }, { hour: '2PM',  occupancy: 82 },
    { hour: '3PM',  occupancy: 75 }, { hour: '4PM',  occupancy: 70 }, { hour: '5PM',  occupancy: 85 },
    { hour: '6PM',  occupancy: 90 }, { hour: '7PM',  occupancy: 75 }, { hour: '8PM',  occupancy: 65 },
    { hour: '9PM',  occupancy: 52 }, { hour: '10PM', occupancy: 42 }
];

const dailyPattern = [
    { day: 'Mon', avgOccupancy: 78 }, { day: 'Tue', avgOccupancy: 82 },
    { day: 'Wed', avgOccupancy: 80 }, { day: 'Thu', avgOccupancy: 85 },
    { day: 'Fri', avgOccupancy: 92 }, { day: 'Sat', avgOccupancy: 88 }, { day: 'Sun', avgOccupancy: 65 }
];

const cityEvents = [
    { name: 'AFL Grand Final',  date: 'Sep 30', type: 'sports',     predictedSurge: 165, parkingImpact: 'critical', affectedZones: ['mcg', 'southbank'] },
    { name: 'Night Market',     date: 'Oct 2',  type: 'market',     predictedSurge: 82,  parkingImpact: 'high',     affectedZones: ['queen-vic'] },
    { name: 'Music Festival',   date: 'Oct 5',  type: 'concert',    predictedSurge: 125, parkingImpact: 'critical', affectedZones: ['fed-square', 'southbank'] },
    { name: 'Tech Conference',  date: 'Oct 7',  type: 'conference', predictedSurge: 68,  parkingImpact: 'medium',   affectedZones: ['docklands'] },
    { name: 'Food Festival',    date: 'Oct 10', type: 'festival',   predictedSurge: 95,  parkingImpact: 'high',     affectedZones: ['crown-casino', 'southbank'] }
];

// ===== STATE =====
let currentTab = 'overview';
let isSimulating = false;
let selectedZone = parkingZones[0].id;
let map, eventLayer, markers = {};
let charts = {};

// ===== INITIALIZATION =====
lucide.createIcons();

// Initialize Map
map = L.map('map', {
    zoomControl: false,
    attributionControl: false
}).setView([-37.8136, 144.9631], 14);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
L.control.zoom({ position: 'bottomleft' }).addTo(map);

// Add heat blobs
const heatBlobs = [
    { coords: [-37.8220, 144.9650], color: '#ef4444', radius: 800 },
    { coords: [-37.8076, 144.9568], color: '#f59e0b', radius: 600 },
    { coords: [-37.8102, 144.9628], color: '#f59e0b', radius: 500 }
];

heatBlobs.forEach(blob => {
    L.circle(blob.coords, {
        radius: blob.radius,
        stroke: false,
        fillColor: blob.color,
        fillOpacity: 0.4,
        className: 'heat-glow'
    }).addTo(map);
});

// Event heatmap (hidden initially)
eventLayer = L.circle([-37.8200, 144.9834], {
    radius: 1200,
    stroke: false,
    fillColor: '#7f1d1d',
    fillOpacity: 0.0,
    className: 'heat-glow'
}).addTo(map);

// Add parking zone markers
parkingZones.forEach(zone => {
    const customIcon = L.divIcon({
        className: 'custom-pin',
        html: `<div class="custom-marker-bubble" style="width: 44px; height: 44px; border-color: ${zone.color}">
                <span class="bubble-val">${zone.currentAvail}%</span>
                <span class="bubble-label">Avail</span>
               </div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
    });
    const marker = L.marker(zone.coords, { icon: customIcon }).addTo(map);
    marker.on('click', () => selectZone(zone.id));
    markers[zone.id] = marker;
});

// ===== TAB SWITCHING =====
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const tab = this.dataset.tab;
        switchTab(tab);
    });
});

function switchTab(tab) {
    currentTab = tab;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        }
    });

    // Update panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`${tab}-panel`).classList.add('active');

    // Initialize charts based on tab
    if (tab === 'predictions') {
        initPredictionsPanel();
    } else if (tab === 'analytics') {
        initAnalyticsCharts();
    } else if (tab === 'events') {
        initEventsPanel();
    }

    lucide.createIcons();
}

// ===== SIMULATION =====
function toggleSimulation() {
    const btn = document.getElementById('simBtn');
    const psiVal = document.getElementById('val-psi');
    const eventBar = document.getElementById('event-bar');
    const eventText = document.getElementById('event-status-text');

    isSimulating = !isSimulating;

    if (isSimulating) {
        btn.classList.add('active');
        btn.innerHTML = `<i data-lucide="loader"></i> Event Live...`;

        psiVal.innerText = "89";
        psiVal.style.color = "#dc2626";

        eventBar.style.width = "95%";
        eventBar.style.background = "#dc2626";
        eventText.innerText = "Critical";
        eventText.style.color = "#b91c1c";
        eventText.className = "insight-status status-critical";

        eventLayer.setStyle({ fillOpacity: 0.6 });
        map.flyTo([-37.8200, 144.9834], 14, { duration: 1.5 });

    } else {
        btn.classList.remove('active');
        btn.innerHTML = `<i data-lucide="zap"></i> Simulate Event`;

        psiVal.innerText = "58";
        psiVal.style.color = "#ea580c";

        eventBar.style.width = "10%";
        eventBar.style.background = "#10b981";
        eventText.innerText = "Low";
        eventText.style.color = "#10b981";
        eventText.className = "insight-status status-low";

        eventLayer.setStyle({ fillOpacity: 0.0 });
        map.flyTo([-37.8136, 144.9631], 14, { duration: 1.5 });
    }
    lucide.createIcons();
}

// ===== CITY SELECTOR =====
function toggleCityMenu() {
    document.getElementById('cityMenu').classList.toggle('show');
}

function selectCity(city) {
    document.getElementById('currentCity').innerText = city;
    document.getElementById('mapLabel').innerText = city;
    document.getElementById('cityMenu').classList.remove('show');

    const cityCoords = {
        'Melbourne': [-37.8136, 144.9631],
        'Sydney':    [-33.8688, 151.2093],
        'Mumbai':    [19.0760, 72.8777],
        'New York':  [40.7128, -74.0060]
    };

    if (cityCoords[city]) {
        map.setView(cityCoords[city], 14);
    }
}

function filterCity() {
    const input = document.getElementById('citySearch');
    const filter = input.value.toUpperCase();
    const div = document.getElementById('cityMenu');
    const options = div.getElementsByClassName('city-option');

    for (let i = 0; i < options.length; i++) {
        const txtValue = options[i].textContent || options[i].innerText;
        options[i].style.display = txtValue.toUpperCase().indexOf(filter) > -1 ? "" : "none";
    }
}

// Close menu when clicking outside
window.onclick = function (event) {
    if (!event.target.matches('.city-btn') && !event.target.closest('.city-container')) {
        document.getElementById('cityMenu').classList.remove('show');
    }
};

// ===== ZONE SELECTION =====
function selectZone(zoneId) {
    selectedZone = zoneId;
    const zone = parkingZones.find(z => z.id === zoneId);
    if (zone) {
        map.flyTo(zone.coords, 15, { duration: 1 });
        if (currentTab === 'predictions') {
            initPredictionsPanel();
        }
    }
}

// ===== PREDICTIONS PANEL =====
function initPredictionsPanel() {
    // Zone pills
    const pillsContainer = document.getElementById('zonePills');
    pillsContainer.innerHTML = parkingZones.map(zone => `
        <button class="zone-pill ${zone.id === selectedZone ? 'active' : ''}" 
                onclick="selectZone('${zone.id}')"
                style="${zone.id !== selectedZone ? `background: white; color: #4b5563;` : ''}">
            <span class="zone-dot" style="background: ${zone.color};"></span>
            ${zone.name}
        </button>
    `).join('');

    // Prediction chart
    const zone = parkingZones.find(z => z.id === selectedZone);
    const ctx = document.getElementById('predictionChart');

    if (charts.prediction) {
        charts.prediction.destroy();
    }

    const timeSlots = [];
    let availability = zone.currentAvail;
    for (let i = 0; i <= 90; i += 10) {
        availability -= Math.random() * 8;
        timeSlots.push({ time: `+${i}min`, availability: Math.max(5, availability) });
    }

    charts.prediction = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeSlots.map(t => t.time),
            datasets: [{
                label: 'Predicted Availability %',
                data: timeSlots.map(t => t.availability),
                borderColor: zone.color,
                backgroundColor: zone.color + '20',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, max: 100 }
            }
        }
    });

    // Zone details
    document.getElementById('zoneDetails').innerHTML = `
        <div style="padding: 1rem;">
            <div style="margin-bottom: 1rem;">
                <div style="font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Current Status</div>
                <div style="font-size: 2rem; font-weight: 700; color: ${zone.color};">${zone.currentAvail}%</div>
            </div>
            <div style="margin-bottom: 1rem;">
                <div style="font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Total Spots</div>
                <div style="font-size: 1.5rem; font-weight: 700;">${zone.totalSpots}</div>
            </div>
            <div style="margin-bottom: 1rem;">
                <div style="font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Stress Index</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: ${zone.stressIndex > 70 ? '#ef4444' : '#f59e0b'};">${zone.stressIndex}/100</div>
            </div>
        </div>
    `;

    // AI Insights
    document.getElementById('aiInsights').innerHTML = `
        <div style="padding: 1rem;">
            <div style="padding: 0.75rem; background: #fef2f2; border-left: 3px solid #ef4444; border-radius: 6px; margin-bottom: 1rem;">
                <div style="font-weight: 600; color: #991b1b; margin-bottom: 0.25rem;">⚠️ High Demand Alert</div>
                <div style="font-size: 0.85rem; color: #7f1d1d;">Expect ${Math.round((zone.currentAvail - zone.predicted30) * 1.5)}% drop in next 30 minutes</div>
            </div>
            <div style="padding: 0.75rem; background: #fffbeb; border-left: 3px solid #f59e0b; border-radius: 6px;">
                <div style="font-weight: 600; color: #92400e; margin-bottom: 0.25rem;">💡 Recommendation</div>
                <div style="font-size: 0.85rem; color: #78350f;">Consider nearby alternatives with better availability</div>
            </div>
        </div>
    `;

    lucide.createIcons();
}

// ===== ANALYTICS CHARTS =====
function initAnalyticsCharts() {
    // Hourly chart
    if (charts.hourly) charts.hourly.destroy();
    charts.hourly = new Chart(document.getElementById('hourlyChart'), {
        type: 'line',
        data: {
            labels: hourlyPattern.map(h => h.hour),
            datasets: [{
                label: 'Occupancy %',
                data: hourlyPattern.map(h => h.occupancy),
                borderColor: '#3b82f6',
                backgroundColor: '#3b82f620',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });

    // Daily chart
    if (charts.daily) charts.daily.destroy();
    charts.daily = new Chart(document.getElementById('dailyChart'), {
        type: 'bar',
        data: {
            labels: dailyPattern.map(d => d.day),
            datasets: [{
                label: 'Avg Occupancy %',
                data: dailyPattern.map(d => d.avgOccupancy),
                backgroundColor: dailyPattern.map(d => d.avgOccupancy > 85 ? '#ef4444' : '#10b981')
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });

    // Zone comparison chart
    if (charts.zone) charts.zone.destroy();
    charts.zone = new Chart(document.getElementById('zoneChart'), {
        type: 'radar',
        data: {
            labels: parkingZones.map(z => z.name),
            datasets: [{
                label: 'Availability',
                data: parkingZones.map(z => z.currentAvail),
                borderColor: '#10b981',
                backgroundColor: '#10b98120'
            }, {
                label: 'Stress Index',
                data: parkingZones.map(z => z.stressIndex),
                borderColor: '#ef4444',
                backgroundColor: '#ef444420'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { r: { beginAtZero: true, max: 100 } }
        }
    });

    // Traffic flow chart
    if (charts.traffic) charts.traffic.destroy();
    const trafficData = [
        { route: 'CG Road',     inflow: 420, outflow: 280 },
        { route: 'Riverfront',  inflow: 350, outflow: 320 },
        { route: 'SG Highway',  inflow: 480, outflow: 380 },
        { route: 'Ashram Road', inflow: 390, outflow: 310 }
    ];
    charts.traffic = new Chart(document.getElementById('trafficChart'), {
        type: 'bar',
        data: {
            labels: trafficData.map(t => t.route),
            datasets: [{
                label: 'Inflow',
                data: trafficData.map(t => t.inflow),
                backgroundColor: '#3b82f6'
            }, {
                label: 'Outflow',
                data: trafficData.map(t => t.outflow),
                backgroundColor: '#10b981'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });
}

// ===== EVENTS PANEL =====
function initEventsPanel() {
    // Event chart
    if (charts.event) charts.event.destroy();
    charts.event = new Chart(document.getElementById('eventChart'), {
        type: 'bar',
        data: {
            labels: cityEvents.map(e => e.name),
            datasets: [{
                label: 'Demand Surge %',
                data: cityEvents.map(e => e.predictedSurge),
                backgroundColor: cityEvents.map(e =>
                    e.parkingImpact === 'critical' ? '#ef4444' :
                    e.parkingImpact === 'high' ? '#f59e0b' : '#10b981'
                )
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });

    // Event list
    const eventIcons = {
        concert: 'music',
        sports: 'trophy',
        festival: 'party-popper',
        market: 'shopping-bag',
        conference: 'presentation'
    };

    document.getElementById('eventList').innerHTML = cityEvents.map(event => `
        <div style="padding: 1rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="background: ${event.parkingImpact === 'critical' ? '#fef2f2' : '#fffbeb'}; padding: 0.75rem; border-radius: 8px;">
                    <i data-lucide="${eventIcons[event.type] || 'calendar'}" size="20" style="color: ${event.parkingImpact === 'critical' ? '#dc2626' : '#d97706'};"></i>
                </div>
                <div>
                    <div style="font-weight: 700; color: #1f2937;">${event.name}</div>
                    <div style="font-size: 0.85rem; color: #64748b;">${event.date} • ${event.type}</div>
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 700; font-size: 1.25rem; color: ${event.parkingImpact === 'critical' ? '#dc2626' : '#d97706'};">+${event.predictedSurge}%</div>
                <div style="font-size: 0.75rem; color: #64748b; text-transform: uppercase;">${event.parkingImpact}</div>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

// Initialize icons on first load
lucide.createIcons();
