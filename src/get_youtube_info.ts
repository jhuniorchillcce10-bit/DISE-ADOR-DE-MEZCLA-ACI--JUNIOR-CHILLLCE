async function main() {
  const url = `https://www.youtube.com/watch?v=HMMEIjc2P7I`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8"
      }
    });
    const html = await res.text();
    const playerResponseMatch = html.match(/var ytInitialPlayerResponse\s*=\s*({[\s\S]*?});\s*(?:var|window|function|const|let|\r?\n)/);
    
    if (playerResponseMatch) {
      const jsonStr = playerResponseMatch[1];
      const playerResponse = JSON.parse(jsonStr);
      console.log("playabilityStatus:", playerResponse.playabilityStatus);
      console.log("messages:", playerResponse.messages);
    }
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}
main();
