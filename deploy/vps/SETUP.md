# Deploy user setup

One-time setup on the VPS so deploys can be triggered over SSH without handing
out a general-purpose shell. Everything here runs as root on the server except
where noted.

The key is pinned to a single script, and that script's only privileged action
is one fixed `docker compose up -d --build`. It cannot open a shell, forward a
port, run `docker compose down`, remove a volume, prune, or touch any other
project on the box.

## 1. One canonical checkout

The compose project name comes from the directory name, so two checkouts of
this repo would fight over the same containers and host port. Pick one
location and have both you and the deploy key use it.

```bash
adduser --disabled-password --gecos "" deploy
mv ~/portfolio /home/deploy/portfolio        # or clone fresh
chown -R deploy:deploy /home/deploy/portfolio
```

`.env` lives in that directory and is not in git, so carry it over.

The deploy user needs read access to the GitHub repo. If it is private, add a
read-only deploy key to `/home/deploy/.ssh/` and the repo's Deploy Keys page.

## 2. Install the scripts

Both are owned by root and not writable by `deploy`. That is what makes the
pin meaningful - if `deploy` could edit them, it could run anything.

```bash
install -o root -g root -m 0755 portfolio-deploy     /usr/local/bin/portfolio-deploy
install -o root -g root -m 0755 portfolio-compose-up /usr/local/bin/portfolio-compose-up
```

## 3. Grant exactly one root action

```bash
visudo -f /etc/sudoers.d/portfolio-deploy
```

```
deploy ALL=(root) NOPASSWD: /usr/local/bin/portfolio-compose-up
```

Note what this deliberately avoids: adding `deploy` to the `docker` group.
Docker group membership is equivalent to root over every container on the
host. This box also serves praxis-app.org, so that is not hypothetical.

## 4. Install the key

Generate the keypair on the laptop, not the server, and use a fresh one - not
`droplet_rsa` or `id_rsa`, which reach other hosts:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/agent-1 -C "portfolio deploy"
```

Then on the server, as root, with the contents of `agent-1.pub`:

```bash
mkdir -p /home/deploy/.ssh && chmod 700 /home/deploy/.ssh
cat >> /home/deploy/.ssh/authorized_keys <<'KEY'
restrict,command="/usr/local/bin/portfolio-deploy" ssh-ed25519 AAAA... portfolio deploy
KEY
chown -R deploy:deploy /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

`restrict` disables port, agent and X11 forwarding plus pty allocation.
`command=` overrides whatever the client asks for, so the branch name arrives
as `SSH_ORIGINAL_COMMAND` and nothing else can run.

## 5. Point the laptop at it

Add to `~/.ssh/config`:

```
Host portfolio-deploy
  HostName forrestwilkins.com
  User deploy
  IdentityFile ~/.ssh/agent-1
  IdentitiesOnly yes
```

## 6. Verify the restriction actually holds

```bash
ssh portfolio-deploy main     # should deploy
ssh portfolio-deploy whoami   # should NOT print a username
```

The second command should be treated as a branch name and rejected. If it
prints `deploy`, the `command=` option is not applied - stop and fix it.

## Deploying by hand afterwards

The script works without SSH too, so `yeet` can become a thin wrapper and both
paths stay identical:

```bash
alias yeet='/usr/local/bin/portfolio-deploy'      # defaults to main
alias yeet_branch='/usr/local/bin/portfolio-deploy'   # takes a branch name
```
