
import json
from pprint import pprint
from hcluster import linkage, dendrogram, pdist

def cluster():
    data = json.load(open("./data/clustering-data.json"))

    vectors = [ufo['vector'] for ufo in data]

    distances = pdist(vectors)

    print distances


if __name__ == "__main__":
    cluster()
