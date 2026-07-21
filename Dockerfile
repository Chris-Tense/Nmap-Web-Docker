FROM debian:12

ENV TZ=America/Argentina/Buenos_Aires

RUN apt-get update && \
    apt-get install -y \
    nmap \
    nodejs \
    npm \
    procps \
    curl \
    tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

WORKDIR /app

COPY . .

WORKDIR /app/backend

RUN npm install

EXPOSE 5500

CMD ["node", "server.js"]
