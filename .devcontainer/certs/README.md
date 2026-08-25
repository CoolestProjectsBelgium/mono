# Generate SSL certificate

We are using easy-rsa to generate our certificate. <https://github.com/OpenVPN/easy-rsa>
The CA password in this example is "cool".
You need to add the `pki/ca.crt` file to your **host** browser/OS trust store (not only inside Docker).

Registration loads from `registration.coolestprojects.localhost` but calls the API at `api.coolestprojects.localhost`. Without trusting `ca.crt`, the browser blocks those API requests with `ERR_CERT_AUTHORITY_INVALID`.

**Windows:** `certutil -addstore -user Root .devcontainer\certs\pki\ca.crt` then restart the browser.

## Example flow

easyrsa init-pki
easyrsa build-ca
easyrsa build-server-full api.coolestprojects.localhost nopass
easyrsa build-server-full registration.coolestprojects.localhost nopass
easyrsa build-server-full voting.coolestprojects.localhost nopass
easyrsa build-server-full eventguide.coolestprojects.localhost nopass
easyrsa build-server-full admin.coolestprojects.localhost nopass
easyrsa build-server-full presentation.coolestprojects.localhost nopass