#!/usr/bin/env python
"""
run.py - tiny local web server for the workstation + analytics pages.

Usage:
  python3 run.py
  python3 run.py --host 0.0.0.0 --port 8000

Then open:
  http://localhost:8000/workstation.html
  http://localhost:8000/analytics.html
"""

import argparse
import http.server
import os
import socket
import socketserver
from pathlib import Path


class NoCacheRequestHandler(http.server.SimpleHTTPRequestHandler):
    # Keep logging a little quieter
    def log_message(self, fmt, *args):
        print("[http]", fmt % args)

    def end_headers(self):
        # Disable caching so edits show up immediately
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def guess_local_ips():
    ips = set()

    # Best-effort way to discover LAN IP
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ips.add(s.getsockname()[0])
        s.close()
    except Exception:
        pass

    # Fallback: hostname resolution (sometimes returns 127.0.0.1 only)
    try:
        host = socket.gethostname()
        for info in socket.getaddrinfo(host, None):
            ip = info[4][0]
            if ":" not in ip:  # skip IPv6 for simplicity
                ips.add(ip)
    except Exception:
        pass

    # Remove loopback if we have other options
    if len(ips) > 1 and "127.0.0.1" in ips:
        ips.remove("127.0.0.1")

    return sorted(ips)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1", help="Bind host (use 0.0.0.0 for LAN access)")
    parser.add_argument("--port", type=int, default=8000, help="Port to serve on")
    args = parser.parse_args()

    here = Path(__file__).resolve().parent
    os.chdir(here)

    # Nice sanity check
    for needed in ["workstation.html", "analytics.html"]:
        if not (here / needed).exists():
            print(f"[warn] {needed} not found in {here}")

    with socketserver.TCPServer((args.host, args.port), NoCacheRequestHandler) as httpd:
        httpd.allow_reuse_address = True
        print("\n✅ Serving:", here)
        print(f"✅ Local:   http://localhost:{args.port}/workstation.html")
        print(f"✅ Local:   http://localhost:{args.port}/analytics.html")

        if args.host == "0.0.0.0":
            ips = guess_local_ips()
            for ip in ips:
                print(f"✅ LAN:     http://{ip}:{args.port}/workstation.html")
                print(f"✅ LAN:     http://{ip}:{args.port}/analytics.html")

        print("\nPress Ctrl+C to stop.\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopping...")


if __name__ == "__main__":
    main()