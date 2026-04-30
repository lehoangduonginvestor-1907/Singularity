import os
import subprocess

directory = r'c:\Users\Admin\Documents\New folder\interstellar_web\physics'
files = ['air_mass.py', 'geometry.py', 'scattering.py', 'thermodynamics.py', 'turbulence.py', 'lunar_penalty.py']

for f in files:
    path = os.path.join(directory, f)
    print(f"\n{'='*40}\nRunning {f}...\n{'='*40}")
    result = subprocess.run(['python', path], capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print("ERRORS:", result.stderr)
