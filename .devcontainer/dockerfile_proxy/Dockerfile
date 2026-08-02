FROM httpd:latest


# Copy your configuration assets directly over
COPY ./proxy_templates/httpd.conf /usr/local/apache2/conf/httpd.conf
COPY ./proxy_templates/proxy.conf /usr/local/apache2/conf/extra/proxy.conf
COPY ./proxy_templates/jwt_auth.lua /usr/local/apache2/conf/jwt_auth.lua