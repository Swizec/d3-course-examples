
import csv, gmaps
#from geocode import latlon, NoResultError
from gmaps import Geocoding

maps = Geocoding(api_key="AIzaSyClY-iZO_SPp0fZRgofnIgZ0Wl_dBXVrKQ")

STATES = ["AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"]

#LAST = """02/23/2012 20:20,Phoenix,AZ,Fireball,30 Sec,"02/23/2012  Phoenix, AZ   Fireballs  30 sec  2 fireballs circling around in night sky near airport    02/24/2012",03/13/201""".split(",")
LAST = """04/09/2014 08:00,Santee,CA,Light,15 seconds,Orange ball in sky in Santee Ca,04/11/2014,32.8383828,-116.9739167""".split(",")

def fetch():
    with open("data/full-data.csv") as csvin:
        reader = csv.reader(csvin)

        with open("data/full-data-geodata.csv", "ab") as csvout:
            writer = csv.writer(csvout)

            head = reader.next()
            head += ['lat', 'lon']

            #writer.writerow(head)

            candidates = (row for row in reader if row[2] != "" and row[2] in STATES)

            for row in candidates:
                if row[0] == LAST[0] and row[1] == LAST[1] and row[2] == LAST[2]:
                    break

            for row in candidates:
                try:
                    row += [v for (k, v) in
                            maps.geocode(row[1])[0]['geometry']['location'].items()]
                    print row
                    writer.writerow(row)
                except gmaps.errors.NoResults:
                    pass

if __name__ == "__main__":
    fetch()
