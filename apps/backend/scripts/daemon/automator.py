
import pyautogui
import time
import sys

# Fail-safe: Move mouse to top-left to abort
pyautogui.FAILSAFE = True

def automate_cursor():
    print("Automator: Waiting for Cursor to focus (5s)...")
    
    # Aggressive Window Focus for Windows
    if sys.platform == 'win32':
        import ctypes
        user32 = ctypes.windll.user32
        
        # EnumWindows to find window with "Cursor" in title
        found_hwnd = []
        def enum_cb(hwnd, result):
            length = user32.GetWindowTextLengthW(hwnd)
            buff = ctypes.create_unicode_buffer(length + 1)
            user32.GetWindowTextW(hwnd, buff, length + 1)
            if "Cursor" in buff.value and user32.IsWindowVisible(hwnd):
                found_hwnd.append(hwnd)
            return True
            
        WNDENUMPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_int, ctypes.c_int)
        user32.EnumWindows(WNDENUMPROC(enum_cb), 0)
        
        if found_hwnd:
            TARGET_HWND = found_hwnd[0] # Take first match
            # Force restore if minimized
            if user32.IsIconic(TARGET_HWND):
                user32.ShowWindow(TARGET_HWND, 9) # SW_RESTORE
            
            # Force foreground
            user32.SetForegroundWindow(TARGET_HWND)
            print(f"Automator: Forced focus to window HWND {TARGET_HWND}")
        else:
            print("Automator: Could not find 'Cursor' window to focus via API.")

    time.sleep(5)

    # 1. MANUAL FOCUS FAILSAFE
    # logic: We cannot reliably find the "Focus Chat" command without traversing the DOM or risking a toggle (close).
    # so we ask the user (or the environment state) to be ready.
    
    print("Automator: !!! PLEASE FOCUS CURSOR CHAT INPUT NOW !!!")
    for i in range(5, 0, -1):
        print(f"Automator: Pasting in {i}s...")
        time.sleep(1.0)
    
    # 2. Paste Prompt (Ctrl+V)
    print("Automator: Pasting Prompt...")
    pyautogui.hotkey('ctrl', 'v')
    time.sleep(0.5)

    # 3. Execute (Enter)
    print("Automator: Executing...")
    pyautogui.press('enter')
    
    print("Automator: Sequence Complete.")

if __name__ == "__main__":
    automate_cursor()
