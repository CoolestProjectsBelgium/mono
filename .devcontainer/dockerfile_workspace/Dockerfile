FROM node:26

# Optional tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Puppeteer (used by apps/api for presentation PDF export) needs both the Chrome
# binary itself (cached via the puppeteer-cache volume, downloaded at container
# start by start.sh) and, since the base image ships no browser runtime deps, the
# shared libraries Chrome links against at launch (e.g. libnspr4/libnss3) —
# without these it downloads fine but fails with "error while loading shared
# libraries" at launch time. Baked in here rather than installed by start.sh so
# it's a cached image layer instead of an apt-get run on every container start.
RUN apt-get update -qq && apt-get install -y --no-install-recommends \
    libnspr4 libnss3 libdrm2 libgbm1 libxkbcommon0 libxcomposite1 libxdamage1 \
    libxfixes3 libxrandr2 libpango-1.0-0 libpangocairo-1.0-0 libcairo2 \
    libasound2t64 libatk1.0-0t64 libatk-bridge2.0-0t64 libcups2t64 libgtk-3-0t64 libglib2.0-0t64 \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /opt && \
    git clone https://github.com/OpenVPN/easy-rsa.git /opt/easy-rsa && \
    ln -s /opt/easy-rsa/easyrsa3/easyrsa /usr/local/bin/easyrsa