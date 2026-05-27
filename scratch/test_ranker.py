import json
from routers.site_ranker import rank_sites, CustomSpot

print("Running site ranker schema test...")
try:
    spots = [
        CustomSpot(id="custom-1", name="Hanoi Dark Site", lat=21.0, lon=105.8, elevation=100, bortle=5)
    ]
    res = rank_sites(user_lat=20.88, user_lon=105.75, custom_spots=spots)
    print("Success! Results keys:", res.keys())
    print("Top 5 results:", [r["name"] for r in res.get("top5", [])])
except Exception as e:
    print("Error occurred:", e)
