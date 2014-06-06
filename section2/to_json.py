
from pyquery import PyQuery as pq
from bs4 import BeautifulSoup

def to_json(path):
    d = pq(filename=path)
    print d("tr").size()

if __name__ == "__main__":
    print to_json("./raw.html")
