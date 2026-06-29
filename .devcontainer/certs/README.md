# Generate SSL certificate

We are using easy-rsa to generate our certificate. <https://github.com/OpenVPN/easy-rsa>
The CA password in this example is "cool".
You need to add the ca.crt file to your browsers trust store.

## Example flow

easyrsa init-pki
easyrsa build-ca
easyrsa build-server-full api.coolestprojects.localhost nopass
easyrsa build-server-full registration.coolestprojects.localhost nopass
easyrsa build-server-full voting.coolestprojects.localhost nopass
easyrsa build-server-full eventguide.coolestprojects.localhost nopass
easyrsa build-server-full admin.coolestprojects.localhost nopass
easyrsa build-server-full presentation.coolestprojects.localhost nopass