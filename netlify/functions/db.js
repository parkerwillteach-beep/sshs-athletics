const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

async function supabase(method, path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Prefer": method === "POST" ? "return=representation" : "",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : null };
}

exports.handler = async function (event) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  try {
    const { action, event: ev, id } = event.body ? JSON.parse(event.body) : {};

    // GET all manual events
    if (event.httpMethod === "GET") {
      const { status, data } = await supabase("GET", "events?order=date.asc", null);
      return { statusCode: status, headers, body: JSON.stringify(data) };
    }

    // POST — create new event
    if (action === "create") {
      const { status, data } = await supabase("POST", "events", ev);
      return { statusCode: status, headers, body: JSON.stringify(data) };
    }

    // PUT — update existing event
    if (action === "update") {
      const { status, data } = await supabase("PATCH", `events?id=eq.${id}`, ev);
      return { statusCode: status, headers, body: JSON.stringify(data) };
    }

    // DELETE — remove event
    if (action === "delete") {
      const { status, data } = await supabase("DELETE", `events?id=eq.${id}`, null);
      return { statusCode: status, headers, body: JSON.stringify(data || {}) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: "Unknown action" }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
