import urllib.request
import os

dest_dir = r"c:\Users\Windows\Documents\New folder\interstellar_web\frontend\public"
os.makedirs(dest_dir, exist_ok=True)

videos = {
    "gargantua_stationary.webm": "https://svs.gsfc.nasa.gov/vis/a010000/a013300/a013326/BH_AccretionDisk_Sim_Stationary_WebSize.webm",
    "gargantua_stationary.mp4": "https://svs.gsfc.nasa.gov/vis/a010000/a013300/a013326/BH_AccretionDisk_Sim_Stationary_WebSize.mp4",
    "gargantua_orbit.webm": "https://svs.gsfc.nasa.gov/vis/a010000/a013300/a013326/BH_Accretion_Disk_Sim_360_1080.webm",
    "gargantua_orbit.mp4": "https://svs.gsfc.nasa.gov/vis/a010000/a013300/a013326/BH_Accretion_Disk_Sim_360_1080.mp4"
}

for name, url in videos.items():
    path = os.path.join(dest_dir, name)
    print(f"Downloading {name} from {url}...")
    try:
        urllib.request.urlretrieve(url, path)
        print(f"Successfully downloaded to {path} (Size: {os.path.getsize(path) / 1024 / 1024:.2f} MB)")
    except Exception as e:
        print(f"Error downloading {name}: {e}")

print("All downloads finished!")
