FROM node:26

# Optional tools 
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /opt && \
    git clone https://github.com/OpenVPN/easy-rsa.git /opt/easy-rsa && \
    ln -s /opt/easy-rsa/easyrsa3/easyrsa /usr/local/bin/easyrsa