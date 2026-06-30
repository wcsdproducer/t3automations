const axios = require('axios');

async function getVimeoConfig(videoId) {
  const url = `https://player.vimeo.com/video/${videoId}/config`;
  try {
    const res = await axios.get(url, {
      headers: {
        'Referer': 'https://rentlocalsites.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const textTracks = res.data.request?.text_tracks || [];
    console.log(`Video ID ${videoId} text tracks:`, textTracks);
    return textTracks;
  } catch (err) {
    console.error(`Failed to get config for ${videoId}:`, err.message);
  }
  return [];
}

async function main() {
  const ids = [
    '561526119',
    '913573442',
    '1187468347',
    '769736537',
    '769701362',
    '913507704',
    '1125749239',
    '645988783',
    '1188518396',
    '771796965',
    '1112975584',
    '573943033',
    '566071513',
    '544847914'
  ];
  for (const id of ids) {
    await getVimeoConfig(id);
    await new Promise(r => setTimeout(r, 1000));
  }
}

main().catch(console.error);
