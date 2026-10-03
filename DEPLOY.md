# Despliegue

Boider es una web estática y se publica en dos sitios con los mismos ficheros:

| Dónde | URL | Cómo se actualiza |
|---|---|---|
| GitHub Pages | https://taridepaco.github.io/Boider/ | Automáticamente con cada push a `master` (*Settings → Pages → Deploy from a branch → master → / (root)*). |
| PC de casa | https://boider.taridepaco.com.es | Por el túnel de Cloudflare `viser`, con los pasos de abajo. |

Todas las rutas son relativas, así que la web funciona igual en la raíz de un dominio que bajo `/Boider/`.

## boider.taridepaco.com.es (túnel de Cloudflare en WSL)

```
Navegador ── HTTPS ── Cloudflare ── túnel «viser» ──► cloudflared (WSL) ──► http://localhost:8002
                                                                             python3 -m http.server en 127.0.0.1
```

- **Servicio:** `boider.service`. Usuario de sistema `boider` y aislamiento de systemd igual que el de Viser.
- **Ficheros servidos:** `/opt/boider`. Es una copia que hace `deploy/install.sh`, nunca el repo entero.
- **Puerto:** `8002`, solo en `127.0.0.1`.
- **Caché:** Cloudflare guarda JS y CSS durante 4 h. Por eso `install.sh` cambia cada `?v=dev` de `index.html` por un hash del contenido, y tras cada actualización se piden ficheros nuevos.

Los comandos con `sudo` se ejecutan en WSL desde la raíz del repo, clonado por ejemplo en `~/Boider`.

### 1. Comprobar que el puerto está libre

```sh
ss -ltn | grep ':8002 ' || echo "8002 libre"
```

Si está ocupado, elige otro y cámbialo en `deploy/boider.service` y en la entrada del túnel.

### 2. Usuario de sistema y ficheros

```sh
sudo useradd --system --no-create-home --shell /usr/sbin/nologin boider
sudo deploy/install.sh
```

### 3. Unidad de systemd

```sh
sudo cp deploy/boider.service /etc/systemd/system/boider.service
sudo systemctl daemon-reload
sudo systemctl enable --now boider
curl -sI http://127.0.0.1:8002/ | head -1    # HTTP/1.0 200 OK
```

### 4. Entrada en el túnel

Edita la configuración con `sudo nano /etc/cloudflared/config.yml` y añade la entrada **antes** de la regla 404, sin tocar las demás:

```yaml
ingress:
  - hostname: viser.taridepaco.com.es
    service: http://localhost:8000
  - hostname: boider.taridepaco.com.es
    service: http://localhost:8002
  - service: http_status:404
```

```sh
cloudflared tunnel ingress validate --config /etc/cloudflared/config.yml
```

### 5. DNS

Ejecútalo como tu usuario, sin sudo:

```sh
cloudflared tunnel route dns viser boider.taridepaco.com.es
```

### 6. Reiniciar el túnel y comprobar

```sh
sudo systemctl restart cloudflared
systemctl status boider cloudflared --no-pager
curl -sI https://boider.taridepaco.com.es/ | head -1
curl -sI https://viser.taridepaco.com.es/login.html | head -1   # Viser sigue bien
systemd-analyze security boider
```

## Actualizar

```sh
git pull
sudo deploy/install.sh
```

No hace falta reiniciar nada, porque el servidor lee los ficheros en cada petición.

## Volver atrás

1. Quita la entrada `boider` de `/etc/cloudflared/config.yml` y ejecuta `sudo systemctl restart cloudflared`.
2. `sudo systemctl disable --now boider && sudo rm /etc/systemd/system/boider.service`
3. `sudo rm -rf /opt/boider && sudo userdel boider`
4. Borra el registro `CNAME` `boider` en el panel de Cloudflare.
