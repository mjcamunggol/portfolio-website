async function getDynamicFlashModel(apiKey) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  if (!data.models) return "gemini-3.5-flash-lite";

  // Filter for active Gemini Flash text models that support generateContent
  const flashModels = data.models
    .filter(m =>
      m.name.includes("gemini") &&
      m.name.includes("flash") &&
      !m.name.includes("image") &&
      !m.name.includes("tts") &&
      !m.name.includes("audio") &&
      m.supportedGenerationMethods?.includes("generateContent")
    )
    .map(m => m.name.replace("models/", ""))
    .sort()
    .reverse(); // Newest version numbers sort to the top

  return flashModels[0] || "gemini-3.5-flash-lite";
}

export async function onRequestPost(context) {
  try {
    const apiKey = context.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: { message: "GEMINI_API_KEY is missing in Cloudflare Environment Variables." } }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await context.request.json();

    // 1. Try the version-free alias first
    let model = "gemini-flash-latest";
    let response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    // 2. If alias is not found (404), auto-detect the newest Flash version number
    if (response.status === 404) {
      model = await getDynamicFlashModel(apiKey);
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
    }

    const data = await response.json();

    // Preserve the actual HTTP status from Gemini for easier debugging
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: { message: err.message } }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}