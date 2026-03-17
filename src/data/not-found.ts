import { readFileSync } from "node:fs";
import { join } from "node:path";

let notFoundHtml: string | null = null;

function load404(): string {
  if (notFoundHtml === null) {
    try {
      const clientDir =
        import.meta.env.PROD
          ? join(process.cwd(), "dist", "client")
          : join(process.cwd(), "dist", "client");
      notFoundHtml = readFileSync(join(clientDir, "404.html"), "utf-8");
    } catch {
      notFoundHtml = "<h1>Not Found</h1>";
    }
  }
  return notFoundHtml;
}

export function notFoundResponse(): Response {
  return new Response(load404(), {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
