
from pyquery import PyQuery as pq
from slugify import slugify

import urllib, os, urllib2

def download(url, file_name):
    u = urllib2.urlopen(url)
    f = open(file_name, 'wb')
    meta = u.info()
    file_size = int(meta.getheaders("Content-Length")[0])
    print "Downloading: %s Bytes: %s" % (file_name, file_size)

    file_size_dl = 0
    block_sz = 8192
    while True:
        buffer = u.read(block_sz)
        if not buffer:
            break

        file_size_dl += len(buffer)
        f.write(buffer)
        status = r"%10d  [%3.2f%%]" % (file_size_dl, file_size_dl * 100. / file_size)
        status = status + chr(8)*(len(status)+1)
        print status,

    f.close()

def scrape():
    d = pq(filename="state-index.html")

    links = [("http://www.nuforc.org/webreports/"+pq(a).attr("href"),
              pq(a).text())
              for a in d("table a")]

    for url, state in links:
        print state
        file = "./data/%s.html" % slugify(state)

        if not os.path.exists(file):
            download(url, file)
            #urllib.urlretrieve(url, file)
        else:
            print "Skip"

    print "Done."

if __name__ == "__main__":
    scrape()
