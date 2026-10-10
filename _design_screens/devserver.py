"""Local preview server with live reload.

Serves the project root like `python3 -m http.server`, but every HTML page it
serves gets a small script that polls /__mtime and reloads the page when
index.html changes (e.g. after assemble.py runs), returning to the screen that
was open. index.html on disk is never modified.

Usage: python3 _design_screens/devserver.py [port]   (default 8765)
"""
import http.server
import os
import sys

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WATCH = os.path.join(PROJECT, 'index.html')

RELOAD_SNIPPET = b"""
<script>
(function () {
  var KEY = '__dev_screen';
  try {
    var back = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    if (back && window.go && window.__views && window.__views[back]) window.go(back);
  } catch (e) {}
  var last = null;
  setInterval(function () {
    fetch('/__mtime', { cache: 'no-store' }).then(function (r) { return r.text(); }).then(function (m) {
      if (last === null) { last = m; return; }
      if (m !== last) {
        try {
          var on = Object.keys(window.__views || {}).filter(function (n) { return window.__views[n].box.classList.contains('on'); })[0];
          if (on && on !== 'Splash') sessionStorage.setItem(KEY, on);
        } catch (e) {}
        location.reload();
      }
    }).catch(function () {});
  }, 700);
})();
</script>
"""


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PROJECT, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_GET(self):
        path = self.path.split('?', 1)[0]
        if path == '/__mtime':
            body = str(os.path.getmtime(WATCH)).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if path == '/':
            path = '/index.html'
        if path.endswith('.html'):
            file = os.path.join(PROJECT, path.lstrip('/'))
            if os.path.isfile(file):
                html = open(file, 'rb').read()
                i = html.rfind(b'</body>')
                html = html[:i] + RELOAD_SNIPPET + html[i:] if i != -1 else html + RELOAD_SNIPPET
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(html)))
                self.end_headers()
                self.wfile.write(html)
                return
        super().do_GET()

    def log_message(self, *args):
        pass


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    print('Serving %s at http://localhost:%d/index.html (live reload)' % (PROJECT, port))
    http.server.ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
