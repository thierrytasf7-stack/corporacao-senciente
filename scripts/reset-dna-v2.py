import json, urllib.request

url = "http://localhost:21341/api/v2/dna-arena/reset"
req = urllib.request.Request(url, data=b'{}', method='POST',
                              headers={'Content-Type': 'application/json'})
resp = urllib.request.urlopen(req, timeout=30)
data = json.loads(resp.read())
print(f"Reset result: {data}")
