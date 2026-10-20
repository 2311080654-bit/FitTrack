"""Descarga el catálogo público para seleccionar imágenes de ejercicios."""
import json
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
with urlopen('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json', timeout=30) as response:
    items = json.load(response)
ids = ['Barbell_Bench_Press_-_Medium_Grip', 'Pushups', 'Pullups', 'One-Arm_Dumbbell_Row', 'Bodyweight_Squat', 'Bodyweight_Walking_Lunge', 'Dumbbell_Bicep_Curl', 'Bench_Dips', 'Plank', 'Mountain_Climbers']
folder = ROOT / 'img' / 'exercises'
folder.mkdir(exist_ok=True)
for index, name in enumerate(ids, 1):
    for position in (0, 1):
        target = folder / f'{index}-{position}.jpg'
        if not target.exists():
            with urlopen(f'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/{name}/{position}.jpg', timeout=30) as response:
                target.write_bytes(response.read())
    print('Downloaded', name)
