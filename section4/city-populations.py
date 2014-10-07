
import json, csv
from sets import Set

def cities():
    s = Set()
    for cluster in json.load(open("data/city-clusters.json")):
        for city in cluster:
            s.add(city.lower())
    return s

def populations():
    with open("data/city-populations.csv") as csvin:
        reader = csv.reader(csvin)

        head = reader.next()

        return {unicode(row[4].lower().replace(" (", ", ").replace(")", "")): row[9]
                for row in reader if len(row) == 11}

def save(cities, populations):
    stuff = {city: population
             for city, population in populations.iteritems()
             if city in cities}

    json.dump(stuff, open("data/city-populations.json", "w"))

if __name__ == "__main__":
    save(cities(), populations())
