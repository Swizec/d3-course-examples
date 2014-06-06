
import json
from pyquery import PyQuery as pq

CELL_NAMES = ["time", "city", "state", "shape", "duration", "summary", "posted"]

def parse_one(row):
    return dict(zip(CELL_NAMES, [pq(td).text() for td in row.find("td")]))

def to_json(path):
    d = pq(filename=path)
    d("tr:first").remove()

    data = [parse_one(pq(tr)) for tr in d("tr")]
    open("triangle_ufos.json", "w").write(json.dumps(data))

if __name__ == "__main__":
    print to_json("./raw.html")
