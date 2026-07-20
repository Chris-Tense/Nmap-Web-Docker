# Escaner de Red Nmap Calamar

Desarrollo creado con fines educativos, cuyo diseño rinde homenaje al mejor club del mundo: el Club Atlético Platense (Argentina)
Permite ejecutar perfiles de Nmap, lanzar comandos personalizados, visualizar resultados en vivo mediante WebSockets, cancelar escaneos en ejecución y exportar resultados en PDF.

---

## Características

- Interfaz web simple y rápida
- Ejecución de perfiles predefinidos de Nmap
- Comandos Nmap personalizados
- Salida en tiempo real mediante WebSocket
- Cancelación de escaneos activos
- Exportación de resultados a PDF
- Docker Ready
- Basado en Node.js + Express
- Compatible con Linux y Docker

---

## Capturas

### Escaneo en tiempo real

<img width="1891" height="837" alt="imagen" src="https://github.com/user-attachments/assets/cc876f2b-15e3-4e9d-bfe5-71fea43b4673" />

---

## Arquitectura

```text
Browser
   |
   +--> Express Server
           |
           +--> REST API
           +--> WebSocket
           +--> PDF Export
           |
           +--> Nmap
```

---

## Docker Hub

Imagen oficial:

https://hub.docker.com/r/christense/nmap-web

---

## Ejecución rápida

Crear un archivo:

```yaml
services:

  nmap-web:

    image: christense/nmap-web:latest

    container_name: nmap-web-calamar

    ports:
      - "5500:5500"

    cap_add:
      - NET_RAW
      - NET_ADMIN

    restart: unless-stopped
```

Levantar:

```bash
docker compose up -d
```

Abrir:

```text
http://IP_DEL_SERVIDOR:5500
```

---

## Instalación manual

Clonar repositorio:

```bash
git clone https://github.com/Chris-Tense/nmap-web.git

cd nmap-web
```

Construir imagen:

```bash
docker build -t nmap-web .
```

Ejecutar:

```bash
docker run -d \
-p 5500:5500 \
--cap-add=NET_RAW \
--cap-add=NET_ADMIN \
--name nmap-web \
nmap-web
```

---

## Perfiles incluidos

- Regular scan
- Quick Scan
- Intense Scan
- Intense scan plus UDP
- Service Scan
- OS Detection
- Intense scan all TCP ports
- Intense scan no ping
- Ping scan
- Quick scan plus
- Quick traceroute
- Slow comprehensive scan
- NSE HTTP Title
- NSE SSL Certificate
- NSE SMB Discovery
- NSE Vulnerability Scan

---

## Tecnologías utilizadas

- Node.js
- Express
- WebSocket
- PDFKit
- Nmap
- Docker

---

## Estructura del proyecto

```text
nmap-web
├── backend
│   ├── package.json
│   └── server.js
│
├── frontend
│   ├── app.js
│   ├── index.html
│   ├── style.css
│   └── platense1.png
│
└── reports
```

---

## Seguridad

Esta herramienta ejecuta Nmap desde un contenedor Docker.

Se recomienda utilizar únicamente en entornos autorizados y redes donde se tenga permiso para realizar análisis.

El autor no se responsabiliza por el uso indebido de la herramienta.

---

## Autor

Christian Iacobellis

GitHub:

https://github.com/Chris-Tense

Docker Hub:

https://hub.docker.com/r/christense/nmap-web

---

## Licencia

MIT License
