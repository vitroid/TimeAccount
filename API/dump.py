import yaml
from deta import Deta

config = yaml.safe_load(open("config.yaml"))
deta = Deta(config["deta_project_key"])

print("AUTH")
auth = deta.Base("auth")
fetch_res = auth.fetch({})
for item in fetch_res.items:
    print(item)

print("ACTION")
actions = deta.Base("actions")
fetch_res = actions.fetch({})
for item in fetch_res.items:
    print(item)
