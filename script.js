const CONFIG = {
    API_URL: 'control-api.php',
    TWITCH_CHANNEL_NAME: 'ingame_14',
    PARENT_DOMAIN: window.location.hostname // Cambia esto por tu dominio real
};

async function fetchYouTubeData() {
    const url = `${CONFIG.API_URL}?action=fetch_youtube_live`;
    
    try {
    
        const response = await fetch(url);
        const data = await response.json();

        if(data.items && data.items.length > 0) {
            return data.items[0].id.videoId;
        }
        return null;
    }      
    catch (error) {
        console.error('Error fetching YouTube data:', error);
        return null;
    }   
};

async function fetchUltimoDirectoYouTube() {
    const url = `${CONFIG.API_URL}?action=fetch_youtube_last_stream`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return (data.items && data.items.length > 0) ? data.items[0].id.videoId : null;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};

async function fetchUltimoDirectoTwitch() {
    try {
        // Llamamos a la acción que acabamos de crear en el PHP
        const url = `${CONFIG.API_URL}?action=get_last_twitch_video`;
        const response = await fetch(url);
        const data = await response.json();
        
        // Twitch devuelve un array llamado 'data'
        if (data.data && data.data.length > 0) {
            return data.data[0].id; // Este es el ID del video grabado
        }
        return null;
    } catch (error) {
        console.error("Error buscando VOD de Twitch:", error);
        return null;
    }
}


async function fetchTwitchData() {
    try {
        const url = `${CONFIG.API_URL}?action=fetch_twitch_live`;
        const response = await fetch(url);
        const data = await response.json();

        if(data.data && data.data.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error fetching Twitch data:', error);
        return false;
    }
}

function mostrarEnPantalla(id, plataforma) {
    const contenedor = document.getElementById('video-slot');
    const hostActual = CONFIG.PARENT_DOMAIN;

    if (plataforma === 'youtube') {
        contenedor.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1" class="w-full h-full" allowfullscreen></iframe>`;
    } 
    else if (plataforma === 'twitch') {
        // Si hay ID, es un video grabado (VOD). Si no hay ID, es el directo del canal.
        const urlTwitch = id 
            ? `https://player.twitch.tv/?video=${id}&parent=${hostActual}&autoplay=true`
            : `https://player.twitch.tv/?channel=${CONFIG.TWITCH_CHANNEL_NAME}&parent=${hostActual}&autoplay=true`;
            
        contenedor.innerHTML = `<iframe src="${urlTwitch}" class="w-full h-full" allowfullscreen></iframe>`;
    }
}



// Banderas de estado para la interfaz
const estadoDirecto = {
    youtube_status: {
        texto: 'EN VIVO (YouTube)',
        dotClass: "dot-live-red",
        bannerClass: "border-red-500/50"
    },
    twitch_status: {
        texto: '● EN VIVO (Twitch)',
        dotClass: "dot-live-purple",
        bannerClass: "border-purple-500/50"
    },
    offline_status: {
        texto: 'OFFLINE',
        dotClass: "dot-offline-gray",
        bannerClass: "border-gray-500/50"
    }
};

function actualizarInterfazEstado(estadoKey) {
    const config = estadoDirecto[estadoKey];
    
    const banner = document.getElementById('status-banner');
    const dot = document.getElementById('status-dot');
    const texto = document.getElementById('status-text');

    if (config) {
        texto.innerText = config.texto;
        // Limpiamos clases viejas y ponemos las nuevas
        dot.className = `w-2 h-2 rounded-full ${config.dotClass}`;
        banner.className = `absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1 rounded-md bg-black/60 backdrop-blur-sm border ${config.bannerClass} transition-all duration-500`;
    }
}

async function sincronizarTodo() {
    // 1. Intentar YouTube Live
    const ytLiveId = await fetchYouTubeData();
    if (ytLiveId) {
        actualizarInterfazEstado('youtube_status');
        mostrarEnPantalla(ytLiveId, 'youtube');
        return 'live'; 
    }

    // 2. Intentar Twitch Live
    const esTwitchLive = await fetchTwitchData();
    if (esTwitchLive) {
        actualizarInterfazEstado('twitch_status');
        mostrarEnPantalla(null, 'twitch'); // Pasamos null porque mostrarEnPantalla usa el nombre del canal
        return 'live';
    }

    // 3. MODO OFFLINE (Si llegamos aquí, nadie está en vivo)
    actualizarInterfazEstado('offline_status');

    const ultimoYT = await fetchUltimoDirectoYouTube();
    if (ultimoYT) {
        mostrarEnPantalla(ultimoYT, 'youtube');
    } else {
        const ultimoTwitchId = await fetchUltimoDirectoTwitch();
        mostrarEnPantalla(ultimoTwitchId, 'twitch'); 
    }
    
    return 'offline';
}

document.addEventListener('DOMContentLoaded', () => {
    // Ya no necesitas llamar a dos funciones, solo al loop
    loopSincronizacion(); 
});

async function loopSincronizacion() {
    // Llamamos a la función maestra y guardamos si devolvió 'live' u 'offline'
    const resultado = await sincronizarTodo(); 
    
    // Ajustamos el tiempo según el resultado
    tiempoEspera = (resultado === 'live') ? 3600000 : 120000;

    console.log(`Sincronización completa. Próximo chequeo en: ${tiempoEspera / 60000} minutos.`);
    setTimeout(loopSincronizacion, tiempoEspera);
}