# Proxette

Proxette is a reverse proxy that restrict access to services so that are only
available to authenticated users with the appropriate role.

Proxette authenticates users against the MyGov Authentication service, and
proxies allowed requests to the appropriate service.
It is intended to run behind nginx but in front of the service being secured.

## Usage

The web server should proxy requests to Proxette, specifying the following
headers:

* Authorization: the Authorization header provided by the client.
* X-Proxy-Roles: a space-separated list of roles allowed to access the resource.
* X-Proxy-Target: the URL of the upstream service.

X-Proxy-Target is the URL of the upstream service to be secured, for example:
`http://localhost:8888/`. The protocol is optional, for example:
`localhost:8888` is equivalent to the previous example.

## Example

The following nginx configuration allows anonymous access to the Feedback
service, except that DELETE requests require the user to be signed in with the
`admin` role.

    location /feedback {
      set $roles '';
      if ($request_method = DELETE) {
       set $roles admin;
      }
      proxy_pass       http://localhost:8001/feedback;
      proxy_set_header X-Proxy-Roles  $roles;
      proxy_set_header X-Proxy-Target http://localhost:8087;
    }
