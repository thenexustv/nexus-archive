# Plan 13: Podman Setup on Ubuntu 24.04 VPS

- **Date**: 2026-02-08
- **Status**: done

## Context

The VPS runs Ubuntu 24.04 LTS (upgraded from 22.04) and needs a container runtime for nexus-archive (and future sites/apps). Docker is not installed. Podman was chosen over Docker for its daemonless architecture — no background daemon process that can crash and take all containers down with it.

Ubuntu 24.04 ships **Podman 4.9+** from the default repos, which includes all the modern features: Quadlet, `podman compose`, and pasta networking.

## Key concepts explained

### Rootless containers

By default, Podman runs containers as your regular (non-root) user. The container processes have no elevated privileges on the host — even if someone escapes the container, they're just an unprivileged user. This is a security advantage over Docker, which requires a root daemon.

For rootless to work, the OS needs to map fake "root inside the container" to a real unprivileged user on the host. This is done via **subuid/subgid** mappings — a range of user IDs reserved for your containers. Ubuntu sets these up automatically when you create a user, but we verify them in the setup steps below.

### Lingering

Normally, systemd kills all of a user's background processes when they log out (i.e., when you disconnect SSH). **Lingering** tells systemd to keep that user's services running even with no active sessions. Without it, your containers would stop every time you close your SSH connection.

### Quadlet

Quadlet is Podman's way of integrating with **systemd** (the system/service manager on Linux). Instead of manually running `podman run ...` commands, you write a simple `.container` file that describes what to run. Systemd then manages the container's lifecycle — starting it on boot, restarting it on failure, and providing logs via `journalctl`.

A `.container` file looks like a systemd unit but with a `[Container]` section instead of writing out the full `podman run` command yourself. When you run `systemctl daemon-reload`, Podman's Quadlet generator reads these files and creates real systemd services from them automatically.

Think of it as: **"systemd-native Docker Compose"** — one file per container, managed by the OS's service manager.

### Pasta networking

**Pasta** (Pack A Subtle Tap Abstraction) is the modern network backend for rootless Podman. It replaced the older `slirp4netns`. It's faster and copies the host's network config (DNS, routes) into the container automatically. You don't need to configure it — Podman 4.9+ uses it by default. For containers bound to localhost behind a reverse proxy, the performance difference is minimal, but it's the better default.

## Architecture

```
Internet → Apache (ports 80/443, TLS termination)
             → 127.0.0.1:4321 (rootless Podman container)
```

- Apache handles TLS and public-facing ports (configured in Plan 12)
- Containers bind to localhost high ports only
- Each app gets its own Quadlet `.container` file, managed as a systemd user service
- All containers run rootless under a dedicated `deploy` user

## Installation steps

### 1. Install Podman and Docker compatibility

```bash
sudo apt update
sudo apt install -y podman podman-compose podman-docker
sudo apt remove -y docker-compose
```

What each package does:
- **`podman`** — the container runtime
- **`podman-compose`** — reads `docker-compose.yml` files and translates them into Podman commands
- **`podman-docker`** — installs a `/usr/bin/docker` symlink that points to `podman`, so `docker build`, `docker run`, `docker ps`, etc. all just work (they call Podman under the hood)

**Important:** Remove the old `docker-compose` package (Python-based v1). Ubuntu may have it installed, and `podman compose` will prefer it over `podman-compose` if it exists. The old v1 tries to connect to a Docker daemon socket and fails. After removing it, `podman compose` correctly delegates to `podman-compose`.

### 2. Create a dedicated deploy user

Run containers under a dedicated user rather than your personal account or root:

```bash
sudo useradd -m -s /bin/bash deploy
```

Verify subuid/subgid mappings exist (Ubuntu usually creates these automatically):

```bash
grep deploy /etc/subuid || echo "deploy:100000:65536" | sudo tee -a /etc/subuid
grep deploy /etc/subgid || echo "deploy:100000:65536" | sudo tee -a /etc/subgid
```

These lines mean: "the `deploy` user can use 65,536 fake user IDs starting at 100000 for its containers." This is what makes rootless user namespace mapping work.

### 3. Enable lingering

```bash
sudo loginctl enable-linger deploy
```

This tells systemd: "keep the `deploy` user's services running even when nobody is logged in as `deploy`." Without this, containers stop when you disconnect SSH.

Verify it worked:

```bash
loginctl show-user deploy -p Linger
# Expected: Linger=yes
```

### 4. Set XDG_RUNTIME_DIR

Podman needs this environment variable to find its runtime directory. It's set automatically in interactive SSH sessions, but not always in systemd service contexts:

```bash
# Add to ~deploy/.bashrc
echo 'export XDG_RUNTIME_DIR=/run/user/$(id -u)' | sudo tee -a /home/deploy/.bashrc
```

## Running nexus-archive

### Build and start (first time, using compose)

```bash
sudo su - deploy
cd /srv/www/thenexus.tv/app  # wherever the repo is cloned

podman compose build
podman compose up -d
```

### Verify the container works

```bash
curl http://localhost:4321/_health
# Expected: "ok"

podman ps
# Expected: nexus-archive container running
```

### Set up Quadlet for auto-start

Once you've verified the container works, create a Quadlet file so systemd manages it permanently.

Create the directory:

```bash
mkdir -p ~/.config/containers/systemd/
```

Create the Quadlet file:

```bash
cat > ~/.config/containers/systemd/nexus-archive.container << 'EOF'
[Unit]
Description=nexus-archive (thenexus.tv)
After=local-fs.target

[Container]
Image=localhost/nexus-simple_nexus-archive:latest
PublishPort=127.0.0.1:4321:4321
Environment=HOST=0.0.0.0
Environment=PORT=4321
HealthCmd=curl -sf http://localhost:4321/_health
HealthInterval=30s
HealthTimeout=5s
HealthRetries=3
HealthStartPeriod=10s

[Service]
Restart=always
TimeoutStartSec=900

[Install]
WantedBy=default.target
EOF
```

What each line does:
- **`Image=`** — which container image to run (the one built by `podman compose build`)
- **`PublishPort=127.0.0.1:4321:4321`** — bind port 4321 to localhost only (Apache proxies to this)
- **`Environment=`** — environment variables passed to the container
- **`HealthCmd=`** — how to check if the container is healthy
- **`Restart=always`** — systemd restarts the container if it crashes
- **`WantedBy=default.target`** — start on boot

Activate it:

```bash
systemctl --user daemon-reload
systemctl --user enable nexus-archive  # auto-start on boot
systemctl --user start nexus-archive   # start now
```

Check status:

```bash
systemctl --user status nexus-archive
```

View logs:

```bash
journalctl --user -u nexus-archive -f
```

### Stop using compose for runtime

Once the Quadlet service is running, you no longer need `podman compose up`. Compose is still useful for **building** the image (`podman compose build`), but systemd via Quadlet handles **running** it. This is the key difference from a Docker workflow:

| Action | Docker workflow | Podman + Quadlet workflow |
|--------|----------------|--------------------------|
| Build image | `docker compose build` | `podman compose build` |
| Start container | `docker compose up -d` | `systemctl --user start nexus-archive` |
| Stop container | `docker compose down` | `systemctl --user stop nexus-archive` |
| View logs | `docker compose logs -f` | `journalctl --user -u nexus-archive -f` |
| Auto-start on boot | Requires daemon + restart policy | Built-in (`enable` + lingering) |
| Restart on crash | Requires daemon | Built-in (`Restart=always`) |

## Rebuilding after code changes

When you deploy a new version:

```bash
sudo su - deploy
cd /srv/www/thenexus.tv/app

git pull
podman compose build
systemctl --user restart nexus-archive
```

The Quadlet service will stop the old container and start a new one from the freshly built image.

## Adding future sites/apps

For each new site:

1. Set up its repo with a `Dockerfile` and `docker-compose.yml`
2. Build the image: `podman compose build`
3. Create a new Quadlet file in `~/.config/containers/systemd/<app-name>.container` with a unique `PublishPort`
4. `systemctl --user daemon-reload && systemctl --user enable --now <app-name>`
5. Add an Apache `ProxyPass` vhost for the new domain (like Plan 12)

Each container is independently managed by systemd. No shared daemon means one container's issues don't affect others.

## Verification checklist

- `podman --version` — shows 4.9+
- `docker --version` — shows podman (via podman-docker symlink)
- `podman compose version` — works
- `loginctl show-user deploy -p Linger` — shows `Linger=yes`
- `systemctl --user status nexus-archive` — active (running)
- `curl http://localhost:4321/_health` — returns "ok"
- Container auto-starts after `sudo reboot`
- Apache proxies to container successfully (Plan 12 verification)
