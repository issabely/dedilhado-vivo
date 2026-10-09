// Cloudflare Pages Function: devolve só a região aproximada da visita (país, estado, cidade).
// O endereço IP não é devolvido nem guardado. Usado para estatística anônima de público.
export function onRequestGet({ request }) {
  const cf = request.cf || {};
  const body = JSON.stringify({ pais: cf.country || "", estado: cf.regionCode || "", cidade: cf.city || "" });
  return new Response(body, { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
