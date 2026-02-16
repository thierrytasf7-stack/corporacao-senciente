
import sys
import os
import json
import uuid
from datetime import datetime
from supabase import create_client, Client

# Load Env (Manual parsing simplistic version for this script)
# Load Env (Robust)
def load_env(path):
    env = {}
    print(f"DEBUG: Loading env from {path}")
    
    # Try multiple encodings
    encodings = ['utf-8', 'utf-16', 'latin-1', 'cp1252']
    lines = []
    
    for enc in encodings:
        try:
            with open(path, 'r', encoding=enc) as f:
                lines = f.readlines()
            print(f"DEBUG: Successfully read .env with {enc}")
            break
        except Exception as e:
            continue
            
    if not lines:
        print("⚠️ Failed to read .env with any common encoding.")
        return env

    for line in lines:
        line = line.strip()
        if not line or line.startswith('#'): continue
        if '=' in line:
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
            
    return env

# Setup Supabase
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ENV_PATH = os.path.join(ROOT_DIR, '.env')

# Fallback: Check if file exists, if not look in local dir (for testing)
if not os.path.exists(ENV_PATH):
    ENV_PATH = os.path.join(os.getcwd(), '.env')

ENV_VARS = load_env(ENV_PATH)

SUPABASE_URL = ENV_VARS.get('SUPABASE_URL') or ENV_VARS.get('VITE_SUPABASE_URL')
SUPABASE_KEY = ENV_VARS.get('SUPABASE_SERVICE_ROLE_KEY') or ENV_VARS.get('SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Missing Supabase Credentials in .env")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def send_pulse(summary):
    print(f"💓 Sending Pulse: {summary}")
    
    # 1. Read Task ID from local context file
    task_id = None
    task_file_path = os.path.join(ROOT_DIR, '.current_task_context')
    
    if os.path.exists(task_file_path):
        try:
            with open(task_file_path, 'r') as f:
                data = json.load(f)
                task_id = data.get('taskId')
        except:
            print("⚠️ Failed to read .current_task_context")
    
    # 2. Update Supabase
    if task_id:
        print(f"  -> Updating Task {task_id}")
        data = {
            "status": "completed",
            "result_log": summary
        }
        try:
            supabase.table("execution_queue").update(data).eq("id", task_id).execute()
            print("  ✅ Task Marked Completed.")
        except Exception as e:
            print(f"  ❌ Failed to update Supabase: {e}")
    else:
        print("  ⚠️ No Task ID found. Logging as generic event.")

    # 3. Log to persistent feed (ByteRover Simulation)
    rover_path = os.path.join(ROOT_DIR, 'knowledge', 'byterover_feed.md')
    os.makedirs(os.path.dirname(rover_path), exist_ok=True)
    with open(rover_path, 'a', encoding='utf-8') as f:
        f.write(f"\n## [{datetime.now().strftime('%Y-%m-%d %H:%M')}] PULSE RECEIVED\n")
        f.write(f"**Task ID**: {task_id or 'Unknown'}\n")
        f.write(f"**Summary**: {summary}\n")
        f.write("-" * 40 + "\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python feedback_pulse.py \"Summary message\"")
        sys.exit(1)
    
    msg = sys.argv[1]
    send_pulse(msg)
