import requests
import json
try:
    resp = requests.get("https://api.open-meteo.com/v1/forecast?latitude=20.886355&longitude=105.755763&hourly=temperature_1000hPa,windspeed_1000hPa,winddirection_1000hPa")
    print(resp.text[:500])
except Exception as e:
    print(e)
