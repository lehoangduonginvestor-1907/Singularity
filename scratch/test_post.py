import requests

url = "https://singularity-87br.onrender.com/api/site-ranker?user_lat=20.886355&user_lon=105.755763"
custom_spots = [
    {
        "id": "custom-12345",
        "name": "Test Custom Location",
        "lat": 21.0,
        "lon": 105.8,
        "elevation": 100,
        "bortle": 5,
        "description": "Custom spot"
    }
]

resp = requests.post(url, json=custom_spots)
print("Response code:", resp.status_code)
print("Response body:", resp.text)
