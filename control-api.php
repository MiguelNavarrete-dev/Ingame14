<?php
    $CONFIG = [
        'YT_API_KEY' => 'AIzaSyA9fuyA3myqUe_6bgFl0527yZCgE3Z9OGs',
        'YT_CHANNEL_ID' => 'UCdSCF6z_wjSoNo-H2WR1rVQ',
        'TWITCH_CLIENT_ID' => 'gzk9fqigqj4na4qbvgzctx63zc0ele',
        'TWITCH_CLIENT_SECRET' => 'u2shbehaapt1bkfyrerb68n6yb6mu8',
        'TWITCH_CHANNEL_NAME' => 'ingame_14',
        'PARENT_DOMAIN' => 'localhost' 
    ];

    header('Content-Type: application/json');

    // --- LAS FUNCIONES ---

    function getYouTubeLive($config) {
        $url = "https://www.googleapis.com/youtube/v3/search?key={$config['YT_API_KEY']}&channelId={$config['YT_CHANNEL_ID']}&part=snippet,id&type=video&eventType=live";
        $response = @file_get_contents($url);
        return json_decode($response, true);
    }

    function getYouTubeLastStream($config) {
        $url = "https://www.googleapis.com/youtube/v3/search?key={$config['YT_API_KEY']}&channelId={$config['YT_CHANNEL_ID']}&part=snippet,id&type=video&order=date&maxResults=1";
        $response = @file_get_contents($url);
        return json_decode($response, true);
    }

    function getTwitchToken($config) {
        $ch = curl_init("https://id.twitch.tv/oauth2/token");
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
            'client_id' => $config['TWITCH_CLIENT_ID'],
            'client_secret' => $config['TWITCH_CLIENT_SECRET'],
            'grant_type' => 'client_credentials'
        ]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $res = curl_exec($ch);
        curl_close($ch);
        return json_decode($res, true);
    }

    function getTwitchLive($config, $token) {
        $ch = curl_init("https://api.twitch.tv/helix/streams?user_login={$config['TWITCH_CHANNEL_NAME']}");
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Client-ID: {$config['TWITCH_CLIENT_ID']}",
            "Authorization: Bearer " . $token['access_token']
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $res = curl_exec($ch);
        curl_close($ch);
        return json_decode($res, true);
    }

    function getTwitchLastVOD($config, $token) {
        // Para esto se suele usar el ID numérico, pero Helix permite buscar por 'user_id'
        // Si no tienes el ID, primero habría que obtenerlo, pero supongamos que lo tienes o lo buscas por login
        $ch = curl_init("https://api.twitch.tv/helix/videos?user_id={$config['TWITCH_USER_ID']}&type=archive&first=1"); 

        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Client-ID: {$config['TWITCH_CLIENT_ID']}",
            "Authorization: Bearer " . $token['access_token']
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $res = curl_exec($ch);
        curl_close($ch);
        return json_decode($res, true);
    }

    // --- LA LÓGICA DE CONTROL (EL "MENÚ") ---

    $action = $_GET['action'] ?? '';

    if ($action === 'fetch_youtube_live') {
        echo json_encode(getYouTubeLive($CONFIG));
    } 
    elseif ($action === 'fetch_youtube_last_stream') {
        echo json_encode(getYouTubeLastStream($CONFIG));
    }
    elseif ($action === 'fetch_twitch_live') {
        $token = getTwitchToken($CONFIG);
        echo json_encode(getTwitchLive($CONFIG, $token));
    } elseif ($action === 'get_last_twitch_video') {
        $token = getTwitchToken($CONFIG);
        echo json_encode(getTwitchLastVOD($CONFIG, $token));
    }
    else {
        echo json_encode(['error' => 'No se especificó una acción válida']);
    }
?>