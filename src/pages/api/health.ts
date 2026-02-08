export const prerender = false;

export function GET() {
  return Response.json({ status: "ok", time: Date.now() });
}
