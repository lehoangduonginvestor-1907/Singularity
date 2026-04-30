import pandas as pd
from astroquery.simbad import Simbad
import warnings
warnings.filterwarnings('ignore')

custom_simbad = Simbad()
custom_simbad.add_votable_fields('ra(d)', 'dec(d)')
custom_simbad.TIMEOUT = 60

messier_list = [f"M {i}" for i in range(1, 111)]

print("Querying 110 Messier objects from SIMBAD...")
try:
    result = custom_simbad.query_objects(messier_list)
    if result is not None:
        df = result.to_pandas()
        
        df_clean = pd.DataFrame({
            'Name': [f"Messier {i}" for i in range(1, 111)],
            'RA': df['ra'],
            'Dec': df['dec']
        })
        
        df_clean.to_csv("catalog.csv", index=False)
        print("Successfully created catalog.csv with", len(df_clean), "objects!")
    else:
        print("Error: No data returned.")
except Exception as e:
    print("Error during query:", e)
