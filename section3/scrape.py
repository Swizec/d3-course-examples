
from pyquery import PyQuery as pq
from slugify import slugify

import urllib, os, urllib2

def scrape():
    d = pq(filename="state-index.html")

    links = [("http://www.nuforc.org/webreports/"+pq(a).attr("href"),
              pq(a).text())
              for a in d("table a")]

    for url, state in links:
        print state
        file = "./data/%s.html" % slugify(state)

        if not os.path.exists(file):
            urllib.urlretrieve(url, file)
        else:
            print "Skip"

    print "Done."

if __name__ == "__main__":
    scrape()
