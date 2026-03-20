// src/app/api/download-pdf/route.js

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return new Response("Missing url parameter", { status: 400 });
  }

  // Only allow downloads from your Supabase storage bucket
  if (!url.startsWith("https://") || !url.includes("supabase.co")) {
    return new Response("Invalid URL", { status: 403 });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return new Response("Failed to fetch file", { status: 502 });
    }

    const buffer = await response.arrayBuffer();
    const filename = url.split("/").pop() || "statement.pdf";

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.byteLength.toString(),
      },
    });
  } catch (err) {
    console.error("PDF proxy error:", err);
    return new Response("Server error", { status: 500 });
  }
}