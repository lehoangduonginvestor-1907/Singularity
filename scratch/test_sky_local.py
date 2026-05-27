from fastapi.testclient import TestClient
from main import app

client = TestClient(app)
resp = client.get("/api/global-sky?lat=20.886355&lon=105.755763")
print("Status:", resp.status_code)
if resp.status_code == 200:
    data = resp.json()
    print("Zenith metrics:", data.get("zenith_metrics"))
    print("Moon metrics:", data.get("moon_metrics"))
    print("Featured target:", data.get("featured_target"))
else:
    print("Error body:", resp.text)
