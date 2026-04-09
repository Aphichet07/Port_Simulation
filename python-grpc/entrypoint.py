"""
Entrypoint สำหรับ Docker container
โหลด user script แล้วรันใน sandbox
"""
import os
import sys
import traceback

def main():
    script_path = "/app/user_script.py"

    if not os.path.exists(script_path):
        print("[ERROR] ไม่พบ user_script.py", flush=True)
        sys.exit(1)

    bot_id = os.environ.get("BOT_ID", "unknown")
    print(f"[BOT {bot_id}] Starting...", flush=True)

    try:
        with open(script_path, "r") as f:
            code = f.read()

        # รัน user script ใน restricted globals
        exec(code, {"__builtins__": __builtins__})

    except KeyboardInterrupt:
        print(f"[BOT {bot_id}] Stopped by user", flush=True)
    except Exception:
        print(f"[BOT {bot_id}] Error:", flush=True)
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
