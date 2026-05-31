/* ==========================================================================
   WeatherVerse // Neo-Meteorological Dashboard Engine (Vanilla JS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // UI Elements Caching
    // ----------------------------------------------------------------------
    
    // Core Layout
    const loader = document.getElementById('loader');
    const systemTimeEl = document.getElementById('system-time');
    const connectionStatusEl = document.getElementById('connection-status');
    const statusTextEl = document.getElementById('status-text');
    
    // API Configuration Panel
    const apiPanel = document.getElementById('api-panel');
    const apiToggleBtn = document.getElementById('api-toggle-btn');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiBtn = document.getElementById('save-api-btn');
    
    // Search & Geolocation
    const citySearchInput = document.getElementById('city-search');
    const searchBtn = document.getElementById('search-btn');
    const locateBtn = document.getElementById('locate-btn');
    const errorBanner = document.getElementById('error-banner');
    const errorMessage = document.getElementById('error-message');
    
    // Central Display Card
    const locationNameEl = document.getElementById('location-name');
    const currentTempEl = document.getElementById('current-temp');
    const weatherDescriptionEl = document.getElementById('weather-description');
    const primaryWeatherSvg = document.getElementById('primary-weather-svg');
    const moodTextEl = document.getElementById('mood-text');
    
    // Secondary Sensor Displays
    const feelsLikeValEl = document.getElementById('feels-like-val');
    const humidityValEl = document.getElementById('humidity-val');
    const windValEl = document.getElementById('wind-val');
    const visibilityValEl = document.getElementById('visibility-val');
    const sunriseValEl = document.getElementById('sunrise-val');
    const sunsetValEl = document.getElementById('sunset-val');
    const sunTrackerDot = document.getElementById('sun-tracker-dot');
    
    // Interactive Temperature Gauge
    const tempGaugeFill = document.getElementById('temp-gauge-fill');
    const tempGaugeNeedle = document.getElementById('temp-gauge-needle');
    const tempMinEl = document.getElementById('temp-min');
    const tempMaxEl = document.getElementById('temp-max');
    
    // Circular AQI Gauge
    const aqiProgressCircle = document.getElementById('aqi-progress-circle');
    const aqiValEl = document.getElementById('aqi-val');
    const aqiStatusText = document.getElementById('aqi-status-text');
    const aqiRatingText = document.getElementById('aqi-rating-text');
    
    // Background Overlays
    const weatherBg = document.getElementById('weather-bg');
    const particleContainer = document.getElementById('particle-container');
    const lightningOverlay = document.getElementById('lightning-overlay');
    
    // Presets
    const presetButtons = document.querySelectorAll('.preset-btn');

    // ----------------------------------------------------------------------
    // State Variables
    // ----------------------------------------------------------------------
    let openWeatherKey = localStorage.getItem('openweather_api_key') || '';
    let appState = {
        isSimulated: !openWeatherKey,
        currentCity: 'Neo-Tokyo',
        currentTimeInterval: null,
        lightningInterval: null
    };

    // Initialize API Key input if saved
    if (openWeatherKey) {
        apiKeyInput.value = openWeatherKey;
        updateConnectionHUD(true);
    } else {
        updateConnectionHUD(false);
    }

    // ----------------------------------------------------------------------
    // Futuristic Pre-populated Cyberpunk Cities (Simulation Mode Database)
    // ----------------------------------------------------------------------
    const simulatedCities = {
        'neo-tokyo': {
            name: 'NEO-TOKYO',
            temp: 24,
            tempMin: 21,
            tempMax: 28,
            condition: 'Clear',
            description: 'CLEAR STARRY NIGHT',
            feelsLike: 23.5,
            humidity: 55,
            windSpeed: 8.2,
            visibility: 10.0,
            aqi: 1,
            pm25: 6.2,
            sunrise: '04:50',
            sunset: '18:55',
            mood: 'System output at high efficiency. Twinkling skies promote cognitive stability 🌃'
        },
        'nova-london': {
            name: 'NOVA-LONDON',
            temp: 14,
            tempMin: 11,
            tempMax: 17,
            condition: 'Clouds',
            description: 'FLOATING NEON FOG',
            feelsLike: 13.0,
            humidity: 82,
            windSpeed: 16.5,
            visibility: 4.5,
            aqi: 2,
            pm25: 14.8,
            sunrise: '05:12',
            sunset: '20:45',
            mood: 'Drizzle scanning imminent. Perfect day to refuel on synthetic coffee ☕'
        },
        'cyber-denver': {
            name: 'CYBER-DENVER',
            temp: 10,
            tempMin: 7,
            tempMax: 12,
            condition: 'Rain',
            description: 'NANITE ACID RAIN',
            feelsLike: 8.5,
            humidity: 94,
            windSpeed: 22.8,
            visibility: 2.5,
            aqi: 3,
            pm25: 22.1,
            sunrise: '05:44',
            sunset: '19:58',
            mood: 'Cybernetic rain shields active. Grab a warm brew and synchronize grids 🌧️'
        },
        'neo-delhi': {
            name: 'NEO-DELHI',
            temp: 34,
            tempMin: 30,
            tempMax: 38,
            condition: 'Thunderstorm',
            description: 'PLASMA THUNDERSTORM',
            feelsLike: 39.2,
            humidity: 76,
            windSpeed: 30.5,
            visibility: 6.0,
            aqi: 5,
            pm25: 154.2,
            sunrise: '05:24',
            sunset: '19:15',
            mood: 'Extreme electrical discharge warning. Stay indoors and lock neural interfaces ⚡'
        },
        'neo-paris': {
            name: 'NEO-PARIS',
            temp: 19,
            tempMin: 16,
            tempMax: 22,
            condition: 'Clouds',
            description: 'AMBIENT HAZY CLOUDS',
            feelsLike: 18.8,
            humidity: 62,
            windSpeed: 11.2,
            visibility: 8.0,
            aqi: 4,
            pm25: 41.5,
            sunrise: '06:01',
            sunset: '21:35',
            mood: 'Soft neon glow filtering through floating layers. A balanced, calm day ☁️'
        }
    };

    // ----------------------------------------------------------------------
    // Main UI Render Pipeline
    // ----------------------------------------------------------------------
    function renderWeatherDashboard(data) {
        // Location & Main Metrics
        locationNameEl.textContent = data.name.toUpperCase();
        currentTempEl.textContent = Math.round(data.temp);
        weatherDescriptionEl.textContent = data.description.toUpperCase();
        
        // Mood Box Rendering
        moodTextEl.textContent = data.mood;

        // Details Widgets
        feelsLikeValEl.textContent = `${data.feelsLike.toFixed(1)}°C`;
        humidityValEl.textContent = `${data.humidity}%`;
        windValEl.textContent = `${data.windSpeed.toFixed(1)} km/h`;
        visibilityValEl.textContent = `${data.visibility.toFixed(1)} km`;
        sunriseValEl.textContent = data.sunrise;
        sunsetValEl.textContent = data.sunset;

        // Render Animated Icon in Header Badge
        renderWeatherIcon(data.condition);

        // Update Dynamic Particles & Theme
        applyWeatherBackground(data.condition);

        // Update Temperature Gauge
        updateTemperatureGauge(data.temp, data.tempMin, data.tempMax);

        // Update SVG Circular AQI Progress Bar
        updateAqiCircle(data.aqi, data.pm25);

        // Update SVG Solar Tracker Coordinates
        updateSolarTracker(data.sunrise, data.sunset);
    }

    // ----------------------------------------------------------------------
    // Temperature Gauge Calculation
    // ----------------------------------------------------------------------
    function updateTemperatureGauge(temp, min, max) {
        // Range from -20C to 50C
        const minScale = -20;
        const maxScale = 50;
        const range = maxScale - minScale;
        
        // Calculate percentage position
        let percentage = ((temp - minScale) / range) * 100;
        percentage = Math.max(0, Math.min(100, percentage)); // Clamp between 0 and 100
        
        // Apply styling transitions
        tempGaugeFill.style.width = `${percentage}%`;
        tempGaugeNeedle.style.left = `${percentage}%`;
        
        // Label statistics
        tempMinEl.textContent = `${Math.round(min)}°C`;
        tempMaxEl.textContent = `${Math.round(max)}°C`;
    }

    // ----------------------------------------------------------------------
    // Air Quality Index (AQI) SVG Circle Math
    // ----------------------------------------------------------------------
    function updateAqiCircle(aqi, pm25) {
        // Total circumference of circle with r="40" is 2 * pi * 40 = 251.2
        const totalCircumference = 251.2;
        
        // Map 1-5 to percentage levels
        let ratio = 0.2; // default aqi = 1
        let aqiStatus = 'STABLE';
        let aqiColor = 'var(--color-cyan)';
        
        switch (aqi) {
            case 1:
                ratio = 0.2;
                aqiStatus = 'OPTIMAL ATMOSPHERE';
                aqiColor = 'var(--color-cyan)';
                break;
            case 2:
                ratio = 0.4;
                aqiStatus = 'STABLE ATMOSPHERE';
                aqiColor = 'var(--color-green)';
                break;
            case 3:
                ratio = 0.6;
                aqiStatus = 'MODERATE IMPURITY';
                aqiColor = 'var(--color-orange)';
                break;
            case 4:
                ratio = 0.8;
                aqiStatus = 'HEAVY CONTAMINATION';
                aqiColor = 'var(--color-pink)';
                break;
            case 5:
                ratio = 1.0;
                aqiStatus = 'HAZARDOUS TOXIN ALERT';
                aqiColor = 'var(--color-red)';
                break;
        }

        const strokeDashOffset = totalCircumference - (totalCircumference * ratio);
        
        // Apply styles to svg progress circle
        aqiProgressCircle.style.strokeDashoffset = strokeDashOffset;
        aqiProgressCircle.style.stroke = aqiColor;
        aqiProgressCircle.style.filter = `drop-shadow(0 0 6px ${aqiColor})`;
        
        // Display overlays
        aqiValEl.textContent = aqi;
        aqiStatusText.textContent = aqiStatus;
        aqiStatusText.style.color = aqiColor;
        aqiStatusText.style.textShadow = `0 0 8px ${aqiColor}55`;
        
        aqiRatingText.textContent = `STATUS INDEX ${aqi} (PM2.5: ${pm25.toFixed(1)} µg/m³)`;
    }

    // ----------------------------------------------------------------------
    // SVG Solar Tracker Coordinate Placement
    // ----------------------------------------------------------------------
    function updateSolarTracker(sunriseStr, sunsetStr) {
        try {
            // Get current time object in minutes
            const now = new Date();
            const currentMins = now.getHours() * 60 + now.getMinutes();
            
            // Parse Sunrise/Sunset strings (format "HH:MM")
            const riseParts = sunriseStr.split(':');
            const setParts = sunsetStr.split(':');
            
            const riseMins = parseInt(riseParts[0]) * 60 + parseInt(riseParts[1]);
            const setMins = parseInt(setParts[0]) * 60 + parseInt(setParts[1]);
            
            let ratio = 0;
            if (currentMins >= riseMins && currentMins <= setMins) {
                ratio = (currentMins - riseMins) / (setMins - riseMins);
            } else if (currentMins > setMins) {
                ratio = 1; // Sun set
            } else {
                ratio = 0; // Sun has not risen yet
            }
            
            // Map ratio to angle along the arc (180 degrees down to 0 degrees)
            const angleInRad = Math.PI - (ratio * Math.PI);
            
            // Arc center in SVG viewbox: CX=100, CY=70. Radius RX=80.
            const cx = 100;
            const cy = 70;
            const radius = 80;
            
            const sunX = cx + radius * Math.cos(angleInRad);
            const sunY = cy - radius * Math.sin(angleInRad);
            
            // Apply attributes to SVG dot
            sunTrackerDot.setAttribute('cx', sunX);
            sunTrackerDot.setAttribute('cy', sunY);
            
            // Adjust glowing style based on daylight
            if (ratio > 0 && ratio < 1) {
                sunTrackerDot.setAttribute('fill', 'var(--color-cyan)');
                sunTrackerDot.style.filter = 'drop-shadow(0 0 6px var(--color-cyan))';
                sunTrackerDot.setAttribute('r', '5');
            } else {
                // Sun below horizon
                sunTrackerDot.setAttribute('fill', 'rgba(255,255,255,0.25)');
                sunTrackerDot.style.filter = 'none';
                sunTrackerDot.setAttribute('r', '3');
            }
        } catch (e) {
            console.error('Solar tracking coordinate calculation failed', e);
        }
    }

    // ----------------------------------------------------------------------
    // Custom SVGs Animated Icon Generator
    // ----------------------------------------------------------------------
    function renderWeatherIcon(condition) {
        let svgContent = '';
        
        switch (condition) {
            case 'Clear':
                svgContent = `
                    <circle class="sun-body animated-pulse" cx="32" cy="32" r="12" fill="none" stroke="currentColor" stroke-width="3"></circle>
                    <line class="sun-ray" x1="32" y1="8" x2="32" y2="14" stroke="currentColor" stroke-width="3" stroke-linecap="round"></line>
                    <line class="sun-ray" x1="32" y1="50" x2="32" y2="56" stroke="currentColor" stroke-width="3" stroke-linecap="round"></line>
                    <line class="sun-ray" x1="8" y1="32" x2="14" y2="32" stroke="currentColor" stroke-width="3" stroke-linecap="round"></line>
                    <line class="sun-ray" x1="50" y1="32" x2="56" y2="32" stroke="currentColor" stroke-width="3" stroke-linecap="round"></line>
                    <line class="sun-ray" x1="15" y1="15" x2="19.24" y2="19.24" stroke="currentColor" stroke-width="3" stroke-linecap="round"></line>
                    <line class="sun-ray" x1="44.76" y1="44.76" x2="49" y2="49" stroke="currentColor" stroke-width="3" stroke-linecap="round"></line>
                    <line class="sun-ray" x1="15" y1="49" x2="19.24" y2="44.76" stroke="currentColor" stroke-width="3" stroke-linecap="round"></line>
                    <line class="sun-ray" x1="44.76" y1="19.24" x2="49" y2="15" stroke="currentColor" stroke-width="3" stroke-linecap="round"></line>
                `;
                primaryWeatherSvg.style.color = 'var(--color-cyan)';
                break;
            case 'Clouds':
                svgContent = `
                    <path class="animated-pulse" d="M18 40a10 10 0 0 1 10-10h1.8a14 14 0 1 1 25.2-4 10 10 0 1 1-7 14H18a10 10 0 0 1 0-20z" fill="none" stroke="currentColor" stroke-width="3"></path>
                    <path d="M12 30a7 7 0 0 1 6-6h1.2a10 10 0 1 1 18-3" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2"></path>
                `;
                primaryWeatherSvg.style.color = 'var(--color-blue)';
                break;
            case 'Rain':
                svgContent = `
                    <path d="M18 36a10 10 0 0 1 10-10h1.8a14 14 0 1 1 25.2-4 10 10 0 1 1-7 14H18" fill="none" stroke="currentColor" stroke-width="3"></path>
                    <line class="rain-line-1" x1="22" y1="44" x2="18" y2="52" stroke="var(--color-cyan)" stroke-width="2.5" stroke-linecap="round"></line>
                    <line class="rain-line-2" x1="32" y1="46" x2="28" y2="54" stroke="var(--color-cyan)" stroke-width="2.5" stroke-linecap="round"></line>
                    <line class="rain-line-3" x1="42" y1="44" x2="38" y2="52" stroke="var(--color-cyan)" stroke-width="2.5" stroke-linecap="round"></line>
                `;
                primaryWeatherSvg.style.color = '#fff';
                // Add keyframes for icon raindrops falling inside the icon
                if (!document.getElementById('icon-rain-style')) {
                    const style = document.createElement('style');
                    style.id = 'icon-rain-style';
                    style.innerHTML = `
                        .rain-line-1 { animation: icon-rain 1s infinite linear; }
                        .rain-line-2 { animation: icon-rain 1s infinite linear 0.3s; }
                        .rain-line-3 { animation: icon-rain 1s infinite linear 0.6s; }
                        @keyframes icon-rain {
                            0% { stroke-dasharray: 2 10; stroke-dashoffset: 0; }
                            100% { stroke-dasharray: 2 10; stroke-dashoffset: -12; }
                        }
                    `;
                    document.head.appendChild(style);
                }
                break;
            case 'Thunderstorm':
                svgContent = `
                    <path d="M18 36a10 10 0 0 1 10-10h1.8a14 14 0 1 1 25.2-4 10 10 0 1 1-7 14H18" fill="none" stroke="currentColor" stroke-width="3"></path>
                    <polygon class="lightning-bolt" points="30,42 22,50 28,50 20,60 34,48 28,48" fill="var(--color-pink)" stroke="var(--color-pink)" stroke-width="1"></polygon>
                `;
                primaryWeatherSvg.style.color = '#fff';
                if (!document.getElementById('icon-lightning-style')) {
                    const style = document.createElement('style');
                    style.id = 'icon-lightning-style';
                    style.innerHTML = `
                        .lightning-bolt { animation: icon-bolt 1.5s infinite steps(2); }
                        @keyframes icon-bolt {
                            0%, 100% { opacity: 0.2; filter: brightness(0.5); }
                            50% { opacity: 1; filter: drop-shadow(0 0 5px var(--color-pink)); }
                        }
                    `;
                    document.head.appendChild(style);
                }
                break;
            default:
                // Fallback for snow/mist/haze (mapped to Clouds)
                svgContent = `
                    <path d="M18 36a10 10 0 0 1 10-10h1.8a14 14 0 1 1 25.2-4 10 10 0 1 1-7 14H18" fill="none" stroke="currentColor" stroke-width="3"></path>
                    <circle cx="24" cy="46" r="1.5" fill="currentColor"></circle>
                    <circle cx="32" cy="48" r="1.5" fill="currentColor"></circle>
                    <circle cx="40" cy="46" r="1.5" fill="currentColor"></circle>
                `;
                primaryWeatherSvg.style.color = 'var(--color-cyan)';
        }
        primaryWeatherSvg.innerHTML = svgContent;
    }

    // ----------------------------------------------------------------------
    // Background Dynamic Particles Generators
    // ----------------------------------------------------------------------
    function applyWeatherBackground(condition) {
        // Reset classes and intervals
        weatherBg.className = 'weather-bg';
        particleContainer.innerHTML = '';
        if (appState.lightningInterval) {
            clearInterval(appState.lightningInterval);
            appState.lightningInterval = null;
        }

        switch (condition) {
            case 'Clear':
                weatherBg.classList.add('clear-sky');
                generateStarBackground();
                break;
            case 'Clouds':
                weatherBg.classList.add('cloudy-sky');
                generateCloudBackground();
                break;
            case 'Rain':
                weatherBg.classList.add('rainy-sky');
                generateRainBackground();
                break;
            case 'Thunderstorm':
                weatherBg.classList.add('thunderstorm-sky');
                generateRainBackground(); // Heavy rain falling during storm
                initializeLightningOverlay();
                break;
            default:
                weatherBg.classList.add('clear-sky');
                generateStarBackground();
        }
    }

    // 1. Starry Night generator
    function generateStarBackground() {
        const starCount = 65;
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // Random horizontal/vertical coords
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            
            // Random diameters between 1px and 3.5px
            const size = Math.random() * 2.5 + 1;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            
            // Random twinkle speed
            star.style.animationDuration = `${Math.random() * 4 + 2}s`;
            star.style.animationDelay = `${Math.random() * 3}s`;
            
            // Slight neon glow to make stars cyan-ish
            if (Math.random() > 0.6) {
                star.style.backgroundColor = 'var(--color-cyan)';
                star.style.boxShadow = '0 0 4px var(--color-cyan)';
            }
            
            particleContainer.appendChild(star);
        }
    }

    // 2. Cloud generator
    function generateCloudBackground() {
        const cloudCount = 6;
        for (let i = 0; i < cloudCount; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'cyber-cloud';
            
            // Vary sizes
            const width = Math.random() * 200 + 150;
            const height = width * 0.4;
            cloud.style.width = `${width}px`;
            cloud.style.height = `${height}px`;
            
            // Positions
            cloud.style.top = `${Math.random() * 55}%`;
            cloud.style.left = `${Math.random() * -100}%`; // Start off-screen left
            
            // Parallax float speeds
            cloud.style.animationDuration = `${Math.random() * 60 + 50}s`;
            cloud.style.animationDelay = `${Math.random() * -60}s`; // Stagger startup positions
            
            // Vary opacities
            cloud.style.opacity = Math.random() * 0.35 + 0.15;
            
            // Neon accent border
            if (Math.random() > 0.5) {
                cloud.style.borderColor = 'rgba(139, 92, 246, 0.12)';
            }
            
            particleContainer.appendChild(cloud);
        }
    }

    // 3. Rain drop generator
    function generateRainBackground() {
        const dropCount = 55;
        for (let i = 0; i < dropCount; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            
            // Random horizontal offsets
            drop.style.left = `${Math.random() * 100}%`;
            drop.style.top = `${Math.random() * -10}%`; // start above window
            
            // Random slanting angle
            const slant = Math.random() * 10 - 5;
            drop.style.transform = `rotate(${slant}deg)`;
            
            // Rain fall rates
            drop.style.animationDuration = `${Math.random() * 0.8 + 0.7}s`;
            drop.style.animationDelay = `${Math.random() * 1.5}s`;
            
            // Translucent lengths
            drop.style.height = `${Math.random() * 20 + 25}px`;
            drop.style.opacity = Math.random() * 0.5 + 0.3;
            
            particleContainer.appendChild(drop);
        }
    }

    // 4. Storm Lightning Overlay flash triggers
    function initializeLightningOverlay() {
        // Trigger a flash cycle at random intervals
        appState.lightningInterval = setInterval(() => {
            if (Math.random() > 0.45) {
                triggerLightningFlash();
            }
        }, 4000);
    }

    function triggerLightningFlash() {
        lightningOverlay.classList.add('lightning-flash');
        setTimeout(() => {
            lightningOverlay.classList.remove('lightning-flash');
        }, 1200);
    }

    // ----------------------------------------------------------------------
    // Search Resolution & Simulated/Live Router
    // ----------------------------------------------------------------------
    async function executeSearch(cityQuery) {
        if (!cityQuery || cityQuery.trim() === '') return;
        const normalizedQuery = cityQuery.trim().toLowerCase();
        
        showLoader(true);
        hideError();

        // 1. SIMULATED PATH
        if (appState.isSimulated) {
            setTimeout(() => {
                // If it matches pre-set cyberpunk preset
                if (simulatedCities[normalizedQuery]) {
                    renderWeatherDashboard(simulatedCities[normalizedQuery]);
                    updatePresetButtonState(simulatedCities[normalizedQuery].name);
                    showLoader(false);
                } else {
                    // Generate a gorgeous dynamic randomized cyberpunk profile for ANY searched city!
                    const simulatedProfile = generateSimulatedCityData(cityQuery);
                    renderWeatherDashboard(simulatedProfile);
                    updatePresetButtonState(simulatedProfile.name);
                    showLoader(false);
                }
            }, 800);
        } 
        // 2. LIVE OPENWEATHERMAP PATH
        else {
            try {
                const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(normalizedQuery)}&appid=${openWeatherKey}&units=metric`;
                const response = await fetch(weatherUrl);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('GRID ACCESS ERROR: TARGET TERMINAL NOT RESOLVED.');
                    } else if (response.status === 401) {
                        throw new Error('LINK AUTH FAILURE: INVALID API CREDENTIALS.');
                    } else {
                        throw new Error(`GRID FAULT: CODE ${response.status}`);
                    }
                }
                
                const weatherData = await response.json();
                
                // Fetch corresponding Air Pollution Index (AQI) using coordinates
                const lat = weatherData.coord.lat;
                const lon = weatherData.coord.lon;
                
                let aqiVal = 2; // fallbacks
                let pm25Val = 12.5;
                
                try {
                    const pollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${openWeatherKey}`;
                    const pollResponse = await fetch(pollutionUrl);
                    if (pollResponse.ok) {
                        const pollData = await pollResponse.json();
                        aqiVal = pollData.list[0].main.aqi; // 1-5 scale
                        pm25Val = pollData.list[0].components.pm2_5; // PM2.5 measurement
                    }
                } catch (e) {
                    console.warn('AQI atmospheric connection degraded. Reverting to prediction algorithms.', e);
                }
                
                // Parse OWM fields to fit our clean custom dashboard data object
                const sunsetTimeStr = formatUnixTime(weatherData.sys.sunset, weatherData.timezone);
                const sunriseTimeStr = formatUnixTime(weatherData.sys.sunrise, weatherData.timezone);
                
                // Map OWM conditions into simplified categories (Clear, Clouds, Rain, Thunderstorm)
                let matchedCondition = 'Clear';
                const owmMain = weatherData.weather[0].main;
                if (owmMain === 'Clear') matchedCondition = 'Clear';
                else if (owmMain === 'Clouds' || owmMain === 'Atmosphere' || owmMain === 'Mist' || owmMain === 'Haze' || owmMain === 'Fog') matchedCondition = 'Clouds';
                else if (owmMain === 'Rain' || owmMain === 'Drizzle' || owmMain === 'Snow') matchedCondition = 'Rain';
                else if (owmMain === 'Thunderstorm') matchedCondition = 'Thunderstorm';
                
                const quoteText = selectMoodQuote(matchedCondition, weatherData.main.temp);
                
                const resolvedData = {
                    name: weatherData.name.toUpperCase(),
                    temp: weatherData.main.temp,
                    tempMin: weatherData.main.temp_min,
                    tempMax: weatherData.main.temp_max,
                    condition: matchedCondition,
                    description: weatherData.weather[0].description,
                    feelsLike: weatherData.main.feels_like,
                    humidity: weatherData.main.humidity,
                    windSpeed: weatherData.wind.speed * 3.6, // m/s to km/h
                    visibility: weatherData.visibility / 1000, // m to km
                    aqi: aqiVal,
                    pm25: pm25Val,
                    sunrise: sunriseTimeStr,
                    sunset: sunsetTimeStr,
                    mood: quoteText
                };
                
                renderWeatherDashboard(resolvedData);
                updatePresetButtonState(resolvedData.name);
                showLoader(false);
                
            } catch (err) {
                showLoader(false);
                showError(err.message || 'GRID TIMEOUT: CONNECTION INTERRUPTED.');
            }
        }
    }

    // ----------------------------------------------------------------------
    // Geolocation API Auto-detect Coordinates
    // ----------------------------------------------------------------------
    function handleGeolocationDetect() {
        showLoader(true);
        hideError();

        if (!navigator.geolocation) {
            showLoader(false);
            showError('GEOLOCATION SYSTEM DEPLETED. HARDWARE NOT RESPONSIVE.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // 1. SIMULATED HUD PATH
                if (appState.isSimulated) {
                    setTimeout(() => {
                        const localData = {
                            name: `LOCAL NODE [${lat.toFixed(2)}N, ${lon.toFixed(2)}E]`,
                            temp: 22,
                            tempMin: 18,
                            tempMax: 26,
                            condition: 'Clear',
                            description: 'LOCAL NEURAL GRID ONLINE',
                            feelsLike: 21.8,
                            humidity: 60,
                            windSpeed: 10.4,
                            visibility: 10.0,
                            aqi: 2,
                            pm25: 11.2,
                            sunrise: '05:30',
                            sunset: '19:40',
                            mood: 'Successfully localized terminal. Local atmospheric grids matched simulation protocols.'
                        };
                        renderWeatherDashboard(localData);
                        updatePresetButtonState('');
                        showLoader(false);
                    }, 1000);
                } 
                // 2. LIVE PATH
                else {
                    try {
                        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherKey}&units=metric`;
                        const response = await fetch(weatherUrl);
                        if (!response.ok) throw new Error('COORDINATES NOT RESOLVED BY WEB GRID.');
                        
                        const weatherData = await response.json();
                        
                        let aqiVal = 2;
                        let pm25Val = 12.0;
                        try {
                            const pollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${openWeatherKey}`;
                            const pollResponse = await fetch(pollutionUrl);
                            if (pollResponse.ok) {
                                const pollData = await pollResponse.json();
                                aqiVal = pollData.list[0].main.aqi;
                                pm25Val = pollData.list[0].components.pm2_5;
                            }
                        } catch (e) {
                            console.warn('AQI sensor sync lost.', e);
                        }

                        const sunsetTimeStr = formatUnixTime(weatherData.sys.sunset, weatherData.timezone);
                        const sunriseTimeStr = formatUnixTime(weatherData.sys.sunrise, weatherData.timezone);
                        
                        let matchedCondition = 'Clear';
                        const owmMain = weatherData.weather[0].main;
                        if (owmMain === 'Clear') matchedCondition = 'Clear';
                        else if (owmMain === 'Clouds' || owmMain === 'Atmosphere' || owmMain === 'Mist' || owmMain === 'Haze' || owmMain === 'Fog') matchedCondition = 'Clouds';
                        else if (owmMain === 'Rain' || owmMain === 'Drizzle' || owmMain === 'Snow') matchedCondition = 'Rain';
                        else if (owmMain === 'Thunderstorm') matchedCondition = 'Thunderstorm';
                        
                        const quoteText = selectMoodQuote(matchedCondition, weatherData.main.temp);

                        const resolvedData = {
                            name: `LOCAL TERMINAL // ${weatherData.name.toUpperCase()}`,
                            temp: weatherData.main.temp,
                            tempMin: weatherData.main.temp_min,
                            tempMax: weatherData.main.temp_max,
                            condition: matchedCondition,
                            description: weatherData.weather[0].description,
                            feelsLike: weatherData.main.feels_like,
                            humidity: weatherData.main.humidity,
                            windSpeed: weatherData.wind.speed * 3.6,
                            visibility: weatherData.visibility / 1000,
                            aqi: aqiVal,
                            pm25: pm25Val,
                            sunrise: sunriseTimeStr,
                            sunset: sunsetTimeStr,
                            mood: quoteText
                        };
                        
                        renderWeatherDashboard(resolvedData);
                        updatePresetButtonState('');
                        showLoader(false);
                        
                    } catch (err) {
                        showLoader(false);
                        showError(err.message || 'GRID TIMEOUT: GEOLOC DEGRADATION.');
                    }
                }
            },
            (error) => {
                showLoader(false);
                let message = 'GEOLOCATION SYSTEM LINK OFFLINE.';
                if (error.code === error.PERMISSION_DENIED) {
                    message = 'GRID POSITION BLOCK: PERMISSION DECLINED.';
                }
                showError(message);
            }
        );
    }

    // ----------------------------------------------------------------------
    // Random Cyber-City Weather Profile Generator (Simulation Mode)
    // ----------------------------------------------------------------------
    function generateSimulatedCityData(cityName) {
        // Base a predictable hash on the city name to keep returns relatively stable
        let hash = 0;
        for (let i = 0; i < cityName.length; i++) {
            hash = cityName.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const conditions = ['Clear', 'Clouds', 'Rain', 'Thunderstorm'];
        const condition = conditions[Math.abs(hash) % conditions.length];
        
        // Generate beautiful cyberpunk values
        let temp = (Math.abs(hash) % 36) - 5; // -5 to 30
        let aqi = (Math.abs(hash) % 5) + 1; // 1-5
        let humidity = (Math.abs(hash) % 40) + 50; // 50-90
        let wind = (Math.abs(hash) % 25) + 5; // 5-30
        let visibility = 10.0;
        let pm25 = 5.0;
        let description = 'STABLE NET';
        
        if (condition === 'Clear') {
            temp = Math.max(15, temp);
            description = 'GLOWING CHROMATIC DAY';
            visibility = 10.0;
            pm25 = 4.2 * aqi;
        } else if (condition === 'Clouds') {
            description = 'MOVING DATA CLOUDS';
            visibility = 7.5;
            pm25 = 8.5 * aqi;
        } else if (condition === 'Rain') {
            temp = Math.min(18, temp);
            description = 'LIQUID SCANNING SHOWER';
            visibility = 3.2;
            pm25 = 11.2 * aqi;
        } else if (condition === 'Thunderstorm') {
            temp = Math.max(20, temp);
            description = 'ELECTRO-STATIC EXPLOSIONS';
            visibility = 5.0;
            pm25 = 26.8 * aqi;
        }

        const moodQuote = selectMoodQuote(condition, temp);

        return {
            name: `CYBER-${cityName.toUpperCase()}`,
            temp: temp,
            tempMin: temp - 3,
            tempMax: temp + 4,
            condition: condition,
            description: description,
            feelsLike: temp - (humidity > 70 ? -1.5 : 1),
            humidity: humidity,
            windSpeed: wind,
            visibility: visibility,
            aqi: aqi,
            pm25: pm25,
            sunrise: '05:30',
            sunset: '20:15',
            mood: `${moodQuote} [SIMULATION CODE: #${Math.abs(hash).toString(16).substring(0, 4)}]`
        };
    }

    // ----------------------------------------------------------------------
    // Meteorological Motivational Status Selector
    // ----------------------------------------------------------------------
    function selectMoodQuote(condition, temp) {
        if (condition === 'Clear') {
            if (temp > 28) return 'Optimal thermal energy. Ideal cycles for neural workspace deployment ☀️';
            return 'Perfect starry night. Grid diagnostics complete and ready for processing 🌌';
        } else if (condition === 'Clouds') {
            return 'Moderate atmospheric densities. Balance cognitive load evenly ☁️';
        } else if (condition === 'Rain') {
            return 'Precipitation particles high. Refuel batteries with coffee and relax ☕';
        } else if (condition === 'Thunderstorm') {
            return 'High electromagnetic interference. Avoid external connections and secure grid ⚡';
        }
        return 'Balanced atmosphere. Standby for standard neurological diagnostics.';
    }

    // ----------------------------------------------------------------------
    // UI Helpers
    // ----------------------------------------------------------------------
    function showLoader(show) {
        if (show) loader.classList.remove('hidden');
        else loader.classList.add('hidden');
    }

    function showError(msg) {
        errorMessage.textContent = msg.toUpperCase();
        errorBanner.classList.remove('hidden');
    }

    function hideError() {
        errorBanner.classList.add('hidden');
    }

    function updateConnectionHUD(isLive) {
        const dot = connectionStatusEl.querySelector('.status-dot');
        
        if (isLive) {
            dot.className = 'status-dot live';
            statusTextEl.textContent = 'LIVE FEED LINK';
            appState.isSimulated = false;
        } else {
            dot.className = 'status-dot simulated';
            statusTextEl.textContent = 'SIMULATION MODE';
            appState.isSimulated = true;
        }
    }

    function updatePresetButtonState(cityName) {
        presetButtons.forEach(btn => {
            const presetCity = btn.getAttribute('data-city').toLowerCase().replace(' ', '');
            const targetCity = cityName.toLowerCase().replace(' ', '').replace('cyber-', '').replace('neo-', '');
            
            if (presetCity.includes(targetCity) || targetCity.includes(presetCity)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Helper to format OWM Unix sunrise/sunset values
    function formatUnixTime(unixTime, offsetSeconds) {
        try {
            // Convert to local time of the queried location using offset
            const date = new Date((unixTime + offsetSeconds) * 1000);
            
            // Format to HH:MM string in UTC (since the offset already shifts it to local coordinates)
            const hours = String(date.getUTCHours()).padStart(2, '0');
            const minutes = String(date.getUTCMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        } catch (e) {
            return '12:00';
        }
    }

    // ----------------------------------------------------------------------
    // Interactive Event Listeners
    // ----------------------------------------------------------------------
    
    // 1. API Accordion Toggle
    apiToggleBtn.addEventListener('click', () => {
        apiPanel.classList.toggle('collapsed');
        apiPanel.classList.toggle('expanded');
    });

    // 2. Save API Key
    saveApiBtn.addEventListener('click', () => {
        const inputKey = apiKeyInput.value.trim();
        if (inputKey) {
            openWeatherKey = inputKey;
            localStorage.setItem('openweather_api_key', inputKey);
            updateConnectionHUD(true);
            
            // Collapse panel with neat visual feedback
            setTimeout(() => {
                apiPanel.classList.add('collapsed');
                apiPanel.classList.remove('expanded');
            }, 300);

            // Execute search on current location to sync live data
            executeSearch(appState.currentCity);
        } else {
            // If saved blank, clear and return to simulation mode
            openWeatherKey = '';
            localStorage.removeItem('openweather_api_key');
            updateConnectionHUD(false);
            executeSearch(appState.currentCity);
        }
    });

    // 3. Search triggers
    searchBtn.addEventListener('click', () => {
        const query = citySearchInput.value;
        if (query) {
            appState.currentCity = query;
            executeSearch(query);
        }
    });

    citySearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = citySearchInput.value;
            if (query) {
                appState.currentCity = query;
                executeSearch(query);
            }
        }
    });

    // 4. Geolocation Locate trigger
    locateBtn.addEventListener('click', () => {
        handleGeolocationDetect();
    });

    // 5. Preset quick-toggles
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const cityName = btn.getAttribute('data-city');
            appState.currentCity = cityName;
            executeSearch(cityName);
        });
    });

    // ----------------------------------------------------------------------
    // Continuous HUD Grid Time Updates
    // ----------------------------------------------------------------------
    function startHUDClock() {
        if (appState.currentTimeInterval) clearInterval(appState.currentTimeInterval);
        
        function updateClock() {
            const d = new Date();
            const formatVal = (num) => String(num).padStart(2, '0');
            const timeStr = `GRID TIME // ${formatVal(d.getHours())}:${formatVal(d.getMinutes())}:${formatVal(d.getSeconds())}`;
            systemTimeEl.textContent = timeStr;
        }
        
        updateClock();
        appState.currentTimeInterval = setInterval(updateClock, 1000);
    }

    // ----------------------------------------------------------------------
    // Init Launch
    // ----------------------------------------------------------------------
    startHUDClock();
    // Load default Neo-Tokyo simulation data
    renderWeatherDashboard(simulatedCities['neo-tokyo']);
});
