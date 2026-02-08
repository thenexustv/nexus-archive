# Plan 12: Apache Reverse Proxy Configuration

- **Date**: 2026-02-08
- **Status**: done

## Context

The nexus-archive Docker container (from Plan 11) listens on `127.0.0.1:4321`. Apache on the VPS needs to reverse proxy to it instead of serving static files from a DocumentRoot. Apache already handles TLS termination via Let's Encrypt/certbot.

### How the two Apache files work

- **`thenexus.tv.conf`** (port 80) — HTTP-only vhost. Its only job is to 301 redirect all traffic to HTTPS. Certbot added the rewrite rules. **Keep this as-is.**
- **`thenexus.tv-le-ssl.conf`** (port 443) — The real HTTPS vhost. This is the one that needs to change from `DocumentRoot` to `ProxyPass`. Certbot created this file and manages the SSL cert lines at the bottom. **Modify this one only.**

Both files are enabled (symlinked in `sites-enabled/`). This is standard certbot behavior.

## Changes

### File: `/etc/apache2/sites-available/thenexus.tv-le-ssl.conf`

Replace the `DocumentRoot`, `DirectoryIndex`, and `<Directory>` block with proxy directives:

```apache
<IfModule mod_ssl.c>
<VirtualHost *:443>

    ServerAdmin ryan@thenexus.tv
    ServerName thenexus.tv

    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:4321/
    ProxyPassReverse / http://127.0.0.1:4321/

    ErrorLog /srv/www/thenexus.tv/logs/error.log
    CustomLog /srv/www/thenexus.tv/logs/access.log combined

    Include /etc/letsencrypt/options-ssl-apache.conf
    SSLCertificateFile /etc/letsencrypt/live/thenexus.tv/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/thenexus.tv/privkey.pem
</VirtualHost>
</IfModule>
```

What changed:
- Removed `DocumentRoot`, `DirectoryIndex`, and the entire `<Directory>` block (no longer serving files from disk)
- Removed duplicate `ServerAlias thenexus.tv` (same as `ServerName`, not needed)
- Removed the commented-out rewrite rules (dead code from certbot)
- Added `ProxyPreserveHost On` — forwards the original `Host: thenexus.tv` header to Astro
- Added `ProxyPass / http://127.0.0.1:4321/` — forwards all requests to the container
- Added `ProxyPassReverse / http://127.0.0.1:4321/` — rewrites `Location` headers in responses

### File: `/etc/apache2/sites-available/thenexus.tv.conf` (port 80)

**No changes needed.** It already redirects HTTP → HTTPS correctly.

## Files created

- `apache/thenexus.tv.conf` — Reference copy of the port 80 vhost (HTTP → HTTPS redirect), saved as-is
- `apache/thenexus.tv-le-ssl.conf` — Updated port 443 vhost with proxy configuration
- `.dev/plans/plan12.md` — This plan

These are reference copies — the actual files live at `/etc/apache2/sites-available/` on the VPS. Having them in the repo means the config is version-controlled and can be copied to the server during deployment.

## Steps to deploy on the VPS

```bash
# 1. Enable required Apache modules (may already be enabled)
sudo a2enmod proxy proxy_http

# 2. Copy the SSL vhost config
sudo cp apache/thenexus.tv-le-ssl.conf /etc/apache2/sites-available/thenexus.tv-le-ssl.conf

# 3. Test Apache config syntax
sudo apachectl configtest
# Expected: "Syntax OK"

# 4. Reload Apache (graceful, no downtime)
sudo systemctl reload apache2

# 5. Verify the proxy works
curl -I https://thenexus.tv/
# Expected: HTTP/2 200, served by Astro via the container
```

## Verification

- `curl -I https://thenexus.tv/` — returns 200 with HTML
- `curl -I https://thenexus.tv/api/health` — returns 200 "ok"
- `curl -I http://thenexus.tv/` — returns 301 redirect to HTTPS (unchanged behavior)
- Apache error log shows no proxy errors
- Let's Encrypt cert renewal still works (`sudo certbot renew --dry-run`)
