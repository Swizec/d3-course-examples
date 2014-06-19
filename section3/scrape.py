
from pyquery import PyQuery as pq
from slugify import slugify
import urllib

def scrape():
    d = pq(filename="state-index.html")

    links = [("http://www.nuforc.org/webreports/"+pq(a).attr("href"),
              pq(a).text())
              for a in d("table a")]

    for url, state in links:
        print state
        urllib.urlretrieve(url,
                           "./data/%s.html" % slugify(state))

    print "Done."

if __name__ == "__main__":
    scrape()
