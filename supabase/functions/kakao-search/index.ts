import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const KAKAO_REST_KEY = Deno.env.get("KAKAO_REST_KEY")

serve(async (req) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  }

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers })
  }

  if (!KAKAO_REST_KEY) {
    console.error("KAKAO_REST_KEY is not configured")
    return new Response(
      JSON.stringify({ error: "search service is not configured" }),
      { status: 500, headers },
    )
  }

  try {
    const url = new URL(req.url)
    const query = url.searchParams.get("query") || ""
    const x = url.searchParams.get("x") || "126.5312"
    const y = url.searchParams.get("y") || "33.3617"
    const radius = url.searchParams.get("radius") || "40000"
    const size = url.searchParams.get("size") || "8"

    if (!query) {
      return new Response(
        JSON.stringify({ error: "query required" }),
        { status: 400, headers },
      )
    }

    const kakaoUrl = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&x=${x}&y=${y}&radius=${radius}&size=${size}`
    const kakaoRes = await fetch(kakaoUrl, {
      headers: { "Authorization": `KakaoAK ${KAKAO_REST_KEY}` },
    })
    const data = await kakaoRes.json()

    return new Response(JSON.stringify(data), {
      status: kakaoRes.status,
      headers,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error"
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers },
    )
  }
})
