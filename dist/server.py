import http.server
import socketserver
import os

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        requested_file = self.path.lstrip('/')
        if requested_file and os.path.exists(requested_file):
            return super().do_GET()
        self.path = '/index.html'
        return super().do_GET()

PORT = 8000
with socketserver.TCPServer(("", PORT), SPAHandler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()
