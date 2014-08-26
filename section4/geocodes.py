
import csv, gmaps, geopy
#from geocode import latlon, NoResultError
#from gmaps import Geocoding
#from omgeo import Geocoder
from geopy.geocoders import Bing

#maps = Geocoding(api_key="AIzaSyB9lcJWc0pHQk89WF_MJ6OcyttOqx0t4LE")
#maps = Geocoding(api_key="AIzaSyBfpW7AtJNiLd1xCY6_Vh5Q7BS2d9wARgA")
#bing = omgeo.services.Bing(settings={"api_key": "AtvTgjJ5FOjkgB5I291TXiDZFVZ7XK2_o4mqIBekDtcg0tDSBqmJpfjJckYqd2la"})
#geocoder = Geocoder(sources=[['bing', {}],])

bing = Bing("AtvTgjJ5FOjkgB5I291TXiDZFVZ7XK2_o4mqIBekDtcg0tDSBqmJpfjJckYqd2la",
            timeout=20)

STATES = ["AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"]

LAST = """06/30/1971 14:00,Yellowstone National Park,WY,Egg,not known,Old photos from 1871 show what appears to be objects in the air.,12/12/2009,44.6204948425,-110.490531921""".split(",")

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
                    loc = bing.geocode(", ".join([row[1], row[2]]))
                except geopy.exc.GeocoderQueryError:
                    print "GEOCODER QUERY ERROR"
                    continue

                if loc:
                    row += [loc.latitude, loc.longitude]

                    print row

                    writer.writerow(row)
                # try:
                #     row += [v for (k, v) in
                #             maps.geocode(row[1])[0]['geometry']['location'].items()]
                #     print row
                #     writer.writerow(row)
                # except gmaps.errors.NoResults:
                #     pass

if __name__ == "__main__":
    fetch()
    print "Done."
