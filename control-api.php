<?php
// api-control.php
header('Content-Type: application/json');

// 1. Configuramos las llaves (Nadie las ve desde fuera)
$config = [
    "youtube" => [
        "key" => "TU_YOUTUBE_KEY",
        "channel" => "ID_CANAL"
    ],
    "twitch" => [
        "client_id" => "TU_CLIENT_ID",
        "token" => "TU_BEARER_TOKEN",
        "user" => "nombre_streamer"
    ]
];

// 2. Leemos qué plataforma quiere el JS (?platform=youtube o ?platform=twitch)
$platform = $_GET['platform'] ?? '';

if ($platform === 'youtube') {
    // EN VIVO
    $urlLive = "https://www.googleapis.com/youtube/v3/search?part=snippet&channelId={$config['youtube']['channel']}&type=video&eventType=live&key={$config['youtube']['key']}";
    
    $response = file_get_contents($urlLive);
    $data = json_decode($response, true);

    // VOD
    if (empty($data['items'])) {
        $urlVod = "https://www.googleapis.com/youtube/v3/search?key={$config['youtube']['key']}&channelId={$config['youtube']['channel']}&part=snippet,id&type=video&order=date&maxResults=1";
        echo file_get_contents($urlVod);
    } else {
        echo $response;
    }
}
elseif ($platform === 'twitch') {
    $header = "Client-ID: {$config['twitch']['client_id']}\r\n" .
              "Authorization: Bearer {$config['twitch']['token']}\r\n";
    
    // EN VIVO
    $urlLive = "https://api.twitch.tv/helix/streams?user_login={$config['twitch']['user']}";
    $response = file_get_contents($urlLive, false, stream_context_create([
        "http" => ["header" => $header]
    ]));
    
    $data = json_decode($response, true);

    // VOD
    if (empty($data['data'])) {
        $urlVod = "https://api.twitch.tv/helix/videos?user_id={$config['twitch']['user_id']}&first=1&type=archive";
        echo file_get_contents($urlVod, false, stream_context_create([
            "http" => ["header" => $header]
        ]));
    } else {
        echo $response;
    }
}
?>