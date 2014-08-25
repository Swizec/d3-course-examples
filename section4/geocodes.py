
import csv, gmaps
#from geocode import latlon, NoResultError
from gmaps import Geocoding

maps = Geocoding(api_key="AIzaSyB9lcJWc0pHQk89WF_MJ6OcyttOqx0t4LE")

STATES = ["AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"]

LAST = """04/07/2014 12:54,Pleasanton,CA,Sphere,2 seconds,"Description: Two spherical objects, as if anchored together. Summary: Unusual object entering the atmosphere.Color: Two blue ob",04/11/2014,37.6624312,-121.8746789""".split(",")

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
