import subprocess
import re
import time
import os
import threading

FRONTEND_PORT = 3000
BACKEND_PORT = 8080
CLOUDFLARED_BIN = "./frontend/cloudflared"
API_JS_PATH = "./frontend/src/lib/api.js"

# Ensure cloudflared exists
if not os.path.exists(CLOUDFLARED_BIN):
    print("Downloading cloudflared...")
    subprocess.run(["curl", "-L", "--output", CLOUDFLARED_BIN, "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64"])
    os.chmod(CLOUDFLARED_BIN, 0o755)

def run_tunnel(port, name, url_list):
    print(f"Starting {name} tunnel on port {port}...")
    # Cloudflare prints to stderr
    process = subprocess.Popen(
        [CLOUDFLARED_BIN, "tunnel", "--url", f"http://localhost:{port}"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Read stderr to find the URL
    url_pattern = re.compile(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com")
    
    for line in process.stderr:
        match = url_pattern.search(line)
        if match and not url_list:
            url = match.group(0)
            print(f"✅ {name} Tunnel URL: {url}")
            url_list.append(url)
        # Keep reading stderr so the buffer doesn't fill up and cause a deadlock
        if "ERR" in line or "error" in line.lower():
            print(f"[{name} Error] {line.strip()}")

def update_api_js(new_backend_url):
    print("Updating api.js with new backend URL...")
    with open(API_JS_PATH, "r") as f:
        content = f.read()
        
    # Replace the old trycloudflare URL with the new one
    pattern = r"\"https://[a-zA-Z0-9-]+\.trycloudflare\.com/api\""
    replacement = f'"{new_backend_url}/api"'
    
    new_content = re.sub(pattern, replacement, content)
    
    with open(API_JS_PATH, "w") as f:
        f.write(new_content)
    print("✅ api.js updated successfully!")

if __name__ == "__main__":
    frontend_urls = []
    backend_urls = []
    
    # Start threads to run both tunnels simultaneously
    t1 = threading.Thread(target=run_tunnel, args=(FRONTEND_PORT, "Frontend", frontend_urls))
    t2 = threading.Thread(target=run_tunnel, args=(BACKEND_PORT, "Backend", backend_urls))
    
    t1.daemon = True
    t2.daemon = True
    
    t1.start()
    t2.start()
    
    # Wait until both URLs are found
    print("Waiting for tunnels to establish...")
    while not frontend_urls or not backend_urls:
        time.sleep(1)
        
    frontend_url = frontend_urls[0]
    backend_url = backend_urls[0]
    
    update_api_js(backend_url)
    
    print("\n" + "="*50)
    print("🚀 ALL SYSTEMS GO! 🚀")
    print(f"👉 OPEN THIS ON YOUR PHONE: {frontend_url}")
    print("="*50 + "\n")
    
    print("Press Ctrl+C to stop both tunnels.")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping tunnels...")
