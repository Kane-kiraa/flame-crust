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

# Shared list to track subprocesses for clean shutdown
processes = []
processes_lock = threading.Lock()

def run_tunnel(port, name, url_list):
    print(f"Starting {name} tunnel on port {port}...")
    try:
        process = subprocess.Popen(
            [CLOUDFLARED_BIN, "tunnel", "--url", f"http://localhost:{port}"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        with processes_lock:
            processes.append(process)
    except Exception as e:
        print(f"❌ Failed to start {name} tunnel process: {e}")
        return

    # Read stderr to find the URL
    url_pattern = re.compile(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com")
    
    for line in process.stderr:
        match = url_pattern.search(line)
        if match and not url_list:
            url = match.group(0)
            print(f"✅ {name} Tunnel URL: {url}")
            url_list.append(url)
        # Keep reading stderr so the buffer doesn't fill up and cause a deadlock.
        # Only print logs that are actual ERR level logs to prevent confusing warning/info logs as errors.
        if " ERR " in line or " ERR |" in line or "| ERR " in line:
            print(f"[{name} Error] {line.strip()}")

def update_api_js(new_backend_url):
    print("Updating api.js with new backend URL...")
    try:
        with open(API_JS_PATH, "r") as f:
            content = f.read()
            
        # Replace the old trycloudflare URL with the new one (supporting both single and double quotes)
        pattern = r"['\"]https://[a-zA-Z0-9-]+\.trycloudflare\.com/api['\"]"
        replacement = f'"{new_backend_url}/api"'
        
        new_content = re.sub(pattern, replacement, content)
        
        with open(API_JS_PATH, "w") as f:
            f.write(new_content)
        print("✅ api.js updated successfully!")
    except Exception as e:
        print(f"❌ Failed to update api.js: {e}")

if __name__ == "__main__":
    # Clean up any existing cloudflared processes to avoid duplicates
    print("Cleaning up old cloudflared processes...")
    try:
        subprocess.run(["pkill", "-f", "cloudflared"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass

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
        if not t1.is_alive() or not t2.is_alive():
            print("❌ One of the tunnel threads exited before establishing a connection.")
            break
        time.sleep(1)
        
    if frontend_urls and backend_urls:
        frontend_url = frontend_urls[0]
        backend_url = backend_urls[0]
        
        update_api_js(backend_url)
        
        # Save the URLs to tunnels.json
        try:
            import json
            with open("tunnels.json", "w") as f:
                json.dump({"frontend": frontend_url, "backend": backend_url}, f)
            print("✅ Saved tunnel URLs to tunnels.json")
        except Exception as e:
            print(f"Failed to write tunnels.json: {e}")
        
        print("\n" + "="*50)
        print("🚀 ALL SYSTEMS GO! 🚀")
        print(f"👉 OPEN THIS ON YOUR PHONE: {frontend_url}")
        print("="*50 + "\n")
    
    print("Press Ctrl+C to stop both tunnels.")
    try:
        while True:
            if not t1.is_alive() or not t2.is_alive():
                print("\n❌ One of the tunnel processes has terminated unexpectedly.")
                break
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping tunnels...")
    finally:
        print("Cleaning up child processes...")
        with processes_lock:
            for p in processes:
                try:
                    p.terminate()
                    p.wait(timeout=2)
                except Exception:
                    try:
                        p.kill()
                    except Exception:
                        pass
        print("✅ Cleanup complete.")
