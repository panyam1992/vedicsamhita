
from skyfield.api import load, pi
from skyfield.framelib import ecliptic_J2000
import math

ts = load.timescale()
eph = load('de421.bsp')
sun = eph['sun']
earth = eph['earth']
moon = eph['moon']

def get_ecliptic_lon(t, body):
    astrometric = earth.at(t).observe(body)
    lat, lon, distance = astrometric.frame_latlon(ecliptic_J2000)
    return (lon.degrees + 360) % 360

# We need Lahiri Ayanamsa roughly to match Nirayana
# In 2028, Lahiri is ~ 24.23 degrees
def get_nirayana_lon(t, body):
    tropical = get_ecliptic_lon(t, body)
    ayanamsa = 24.23  # approx
    return (tropical - ayanamsa + 360) % 360

print('Scanning from Dec 1, 2028 to Feb 28, 2029...')
for day in range(1, 90):
    t = ts.utc(2028, 12, day, 0)
    sun_n = get_nirayana_lon(t, sun)
    moon_n = get_nirayana_lon(t, moon)
    diff = (moon_n - sun_n + 360) % 360
    
    rashi = math.floor(sun_n / 30)
    print(t.utc_strftime('%Y-%m-%d'), f'Sun: {sun_n:.2f} (Rashi {rashi}), Moon: {moon_n:.2f}, Diff: {diff:.2f}')

