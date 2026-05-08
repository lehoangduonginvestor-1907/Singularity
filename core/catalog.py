"""
Catalog — Single source of truth for the astronomical object catalog.
Previously duplicated in main.py and app.py.
"""
import pandas as pd


def get_catalog() -> pd.DataFrame:
    """
    Load the astronomical object catalog.
    Includes planets, Messier objects, and select NGC objects.
    """
    data = [
        # Planets
        {"Name": "Jupiter", "RA": 0.0, "Dec": 0.0, "Type": "Planet", "Magnitude": -2.5},
        {"Name": "Saturn", "RA": 0.0, "Dec": 0.0, "Type": "Planet", "Magnitude": 0.5},
        {"Name": "Mars", "RA": 0.0, "Dec": 0.0, "Type": "Planet", "Magnitude": -1.0},
        {"Name": "Venus", "RA": 0.0, "Dec": 0.0, "Type": "Planet", "Magnitude": -4.0},

        # Nebulae & Clusters
        {"Name": "Orion Nebula (M42)", "RA": 83.822, "Dec": -5.391, "Type": "Nebula", "Magnitude": 4.0},
        {"Name": "Pleiades (M45)", "RA": 56.75, "Dec": 24.116, "Type": "Open Cluster", "Magnitude": 1.6},
        {"Name": "Hercules Cluster (M13)", "RA": 250.422, "Dec": 36.46, "Type": "Globular Cluster", "Magnitude": 5.8},
        {"Name": "Lagoon Nebula (M8)", "RA": 270.925, "Dec": -24.38, "Type": "Nebula", "Magnitude": 6.0},
        {"Name": "Dumbbell Nebula (M27)", "RA": 299.901, "Dec": 22.716, "Type": "Planetary Nebula", "Magnitude": 7.5},
        {"Name": "Ring Nebula (M57)", "RA": 283.396, "Dec": 33.029, "Type": "Planetary Nebula", "Magnitude": 8.8},
        {"Name": "Crab Nebula (M1)", "RA": 83.633, "Dec": 22.014, "Type": "Supernova Remnant", "Magnitude": 8.4},
        {"Name": "Eagle Nebula (M16)", "RA": 274.7, "Dec": -13.8, "Type": "Nebula", "Magnitude": 6.0},
        {"Name": "Omega Centauri (NGC 5139)", "RA": 201.697, "Dec": -47.479, "Type": "Globular Cluster", "Magnitude": 3.9},
        {"Name": "Tarantula Nebula (NGC 2070)", "RA": 84.676, "Dec": -69.1, "Type": "Nebula", "Magnitude": 8.0},

        # Galaxies
        {"Name": "Andromeda Galaxy (M31)", "RA": 10.684, "Dec": 41.269, "Type": "Galaxy", "Magnitude": 3.4},
        {"Name": "Triangulum Galaxy (M33)", "RA": 23.462, "Dec": 30.66, "Type": "Galaxy", "Magnitude": 5.7},
        {"Name": "Sombrero Galaxy (M104)", "RA": 189.997, "Dec": -11.623, "Type": "Galaxy", "Magnitude": 8.0},
        {"Name": "Whirlpool Galaxy (M51)", "RA": 202.469, "Dec": 47.195, "Type": "Galaxy", "Magnitude": 8.4},
        {"Name": "Bode's Galaxy (M81)", "RA": 148.888, "Dec": 69.065, "Type": "Galaxy", "Magnitude": 6.9},
        {"Name": "Cigar Galaxy (M82)", "RA": 148.969, "Dec": 69.679, "Type": "Galaxy", "Magnitude": 8.4},
    ]
    return pd.DataFrame(data)


# Module-level singleton — loaded once
df_catalog = get_catalog()
