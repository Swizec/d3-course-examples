
import csv, gmaps
#from geocode import latlon, NoResultError
from gmaps import Geocoding

maps = Geocoding(api_key="AIzaSyClY-iZO_SPp0fZRgofnIgZ0Wl_dBXVrKQ")

STATES = ["AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"]

def fetch():
    with open("data/full-data.csv") as csvin:
        reader = csv.reader(csvin)

        with open("data/full-data-geodata.csv", "wb") as csvout:
            writer = csv.writer(csvout)

            head = reader.next()
            head += ['lat', 'lon']

            writer.writerow(head)

            candidates = (row for row in reader if row[2] != "" and row[2] in STATES)

            c = candidates.next()
            c += [v for (k, v) in
                    maps.geocode(c[1])[0]['geometry']['location'].items()]

            for row in candidates:
                try:
                    row += [v for (k, v) in
                            maps.geocode(row[1])[0]['geometry']['location'].items()]
                    print row
                    writer.writerow(row)
                except gmaps.errors.NoResults:
                    pass

                # try:
                #     row += latlon(row[1], center=True, throttle=0.1, round_digits=3)
                #     print row

                #     writer.writerow(row)
                # except NoResultError:
                #     pass

        # reader = csv.reader(csvfile)
        # writer = csv.writer(
        # reader.next()
        # candidates = (row for row in reader if row[2] != "" and row[2] in STATES)

        # for row in candidates:
        #     print row[1]

if __name__ == "__main__":
    #print latlon("Ljubljana, Slovenia", center=True, throttle=0.1, round_digits=3)
    fetch()
