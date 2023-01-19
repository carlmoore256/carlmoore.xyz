from astropy import units as u
from astropy.coordinates import SkyCoord, Distance
import numpy as np
import json

with open('./data/The10pcSample.json') as f:
    data = json.load(f)

starCoords = []

for d in data:
    ra = float(d["RA"])
    dec = float(d["DEC"])
    dist = Distance(parallax=float(d["PARALLAX"])*u.mas)
    coord = SkyCoord(ra=ra*u.degree, dec=dec*u.degree, distance=dist, frame='icrs')

    d["x"] = coord.cartesian.x.value
    d["y"] = coord.cartesian.y.value
    d["z"] = coord.cartesian.z.value
    d["distance"] = dist.value

    g_code = d["G_CODE"]
    magnitude = 25.46 # highest mag on the list

    # two cases for the magnitude code (G_CODE)
    if g_code == "2" or g_code == "3":
      # Gaia Gband magnitude measure
      magnitude = float(d["G"])
    elif g_code == "10" or g_code == "20":
      # Gaia Gband magnitude estimate
      magnitude = float(d["G_ESTIMATE"])

    d["mag"] = magnitude
    d["norm_mag"] = np.interp(magnitude, [-1.49 ,25.46], [1, 0])

    starCoords.append(d)

with open('./data/starData.json', 'w') as f:
    json.dump(starCoords, f, indent=3)


# c = SkyCoord(ra=10.625*u.degree, dec=41.2*u.degree, frame='icrs')
