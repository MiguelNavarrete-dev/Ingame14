const CONFIG = {
    YT_API_KEY: 'AIzaSyA9fuyA3myqUe_6bgFl0527yZCgE3Z9OGs',
    YT_CHANNEL_ID: 'UCdSCF6z_wjSoNo-H2WR1rVQ',
    TWITCH_CLIENT_ID: 'gzk9fqigqj4na4qbvgzctx63zc0ele',
    TWITCH_CLIENT_SECRET: 'u2shbehaapt1bkfyrerb68n6yb6mu8',
    TWITCH_CHANNEL_NAME: 'ingame_14',
    PARENT_DOMAIN: 'localhost' // Cambia esto por tu dominio real
};

async function fetchYouTubeData() {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${CONFIG.YT_API_KEY}&channelId=${CONFIG.YT_CHANNEL_ID}&part=snippet,id&type=video&eventType=live&maxResults=1`;
    
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
    const url = `https://www.googleapis.com/youtube/v3/search?key=${CONFIG.YT_API_KEY}&channelId=${CONFIG.YT_CHANNEL_ID}&part=snippet,id&type=video&order=date&maxResults=1`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if(data.items && data.items.length > 0) {
            return data.items[0].id.videoId; // Retorna el ID del último video subido
        }
        return null;
    } catch (error) {
        console.error('Error fetching YouTube data:', error);
        return null;
    }
};

async function fetchUltimoDirectoTwitch() {
    const token = await getTwitchToken(); // El que ya tienes funcionando
    const url = `https://api.twitch.tv/helix/videos?user_id=${CONFIG.TWITCH_CHANNEL_NAME}`; // Esto busca el último video subido (puede ser directo o VOD)

    try {
        const response = await fetch(url, {
            headers: {
                'Client-ID': CONFIG.TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            return data.data[0].id; // Retorna el ID del último stream guardado
        }
        return null;
    } catch (error) {
        console.error("Error buscando VOD de Twitch:", error);
        return null;
    }
}

async function getTwitchToken() {
    const url = `https://id.twitch.tv/oauth2/token?client_id=${CONFIG.TWITCH_CLIENT_ID}&client_secret=${CONFIG.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`;
    
    try {
        const response = await fetch(url, { method: 'POST' });
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Error fetching Twitch token:', error);
        return null;
    }
}

async function fetchTwitchData() {
    try {
        const token = await getTwitchToken();
        const url = `https://api.twitch.tv/helix/streams?user_login=${CONFIG.TWITCH_CHANNEL_NAME}`;
        const response = await fetch(url, {
            headers: {
                'Client-ID': CONFIG.TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${token}`
            }
        });
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
    const contenedor = document.getElementById('video-slot'); // El ID de tu div principal
    
    if (plataforma === 'youtube') {
        contenedor.innerHTML = `
            <iframe src="https://www.youtube.com/embed/${id}?autoplay=1&mute=0" 
                    class="w-full h-full" 
                    allowfullscreen></iframe>`;
    } else if (plataforma === 'twitch') {
        const hostActual = window.location.hostname; // MOMENTANEO: Esto es para desarrollo local, en producción debes usar tu dominio real
        contenedor.innerHTML = `
            <iframe src="https://player.twitch.tv/?channel=${CONFIG.TWITCH_CHANNEL_NAME}&parent=${hostActual}&autoplay=true" 
                    class="w-full h-full" 
                    allowfullscreen></iframe>`;
    } 
}

async function inicializarReproductor() {
    // 1. YouTube Live
    const ytLiveId = await fetchYouTubeData();
    if (ytLiveId) {
        mostrarEnPantalla(ytLiveId, 'youtube');
        return; // Detiene el flujo si encontró directo
    }

    // 2. Twitch Live
    const esTwitchLive = await fetchTwitchData(); // Aquí ya funciona getTwitchToken
    if (esTwitchLive) {
        mostrarEnPantalla(null, 'twitch');
        return; // Detiene el flujo si encontró directo
    }



    let idParaMostrar = await fetchUltimoDirectoYouTube();

    if (idParaMostrar) {
        // Si la API encontró el último video con éxito
        mostrarEnPantalla(idParaMostrar, 'youtube');
    } else{
        const ultimoDirectoId = await fetchUltimoDirectoTwitch();
        mostrarEnPantalla(ultimoDirectoId, 'twitch');
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
        texto: 'EN VIVO (Twitch)',
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

async function inicializarStreamer() {
    // 1. Intentar YouTube Live
   const ytVideoId = await fetchYouTubeData();
   if (ytVideoId) {
       actualizarInterfazEstado('youtube_status');
       // Aquí llamarías a la función que pone el iframe de YT
       return; 
   }

    // 2. Si no hay YT, intentar Twitch
    const twitchLive = await fetchTwitchData(); 
    if (twitchLive) {
        actualizarInterfazEstado('twitch_status');
        // Aquí llamarías a la función que pone el iframe de Twitch
        return;
    }

    // 3. Si nada funciona, modo Offline
    actualizarInterfazEstado('offline_status');
    // Aquí cargarías el último video subido
}

document.addEventListener('DOMContentLoaded', async () => {
    // Obtenemos el estado una sola vez
    const estado = await inicializarStreamer(); 
    
    // Se lo pasamos al reproductor para que no tenga que volver a preguntar a la API
    await inicializarReproductor(estado); 
});

// Variable para controlar el tiempo del próximo chequeo
let tiempoEspera = 120000; // 2 minutos por defecto

async function loopSincronizacion() {
    // 1. Ejecutamos la lógica que ya tienes
    const resultado = await inicializarReproductor(); 
    
    // 2. Ajustamos el "reloj" según lo que encontramos
    // Si inicializarReproductor nos dice que hay alguien en vivo:
    if (resultado === 'live') {
        tiempoEspera = 3600000; // Cambiamos a 1 hora (ahorro de cuota)
    } else {
        tiempoEspera = 120000; // Volvemos a 2 minutos (búsqueda activa)
    }

    // 3. Programamos la siguiente ejecución
    setTimeout(loopSincronizacion, tiempoEspera);
}

// Arrancamos el ciclo por primera vez
loopSincronizacion();