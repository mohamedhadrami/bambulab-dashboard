import requests
import json

url = "https://e.bambulab.com/query.php?lang=en"
response = requests.get(url)

if response.status_code == 200:
    data = response.json()

    device_errors = data['data']['device_error']['en']
    hms_errors = data['data']['device_hms']['en']

    def format_ecode(ecode):
        # Add underscore every 4 characters
        return '_'.join([ecode[i:i+4] for i in range(0, len(ecode), 4)])

    ts_map = "export const DEVICE_ERROR = {\n"
    for error in device_errors:
        ecode = format_ecode(error["ecode"])
        intro = error["intro"].replace('"', '\\"')
        ts_map += f'  "{ecode}": "{intro}",\n'
    ts_map += "};\n"

    ts_map += "\nexport const HMS_ERROR = {\n"
    for error in hms_errors:
        ecode = format_ecode(error["ecode"])
        intro = error["intro"].replace('"', '\\"')
        ts_map += f'  "{ecode}": "{intro}",\n'
    ts_map += "};"

    with open('../types/bambuApi/HmsError.ts', 'w', encoding='utf-8') as file:
        file.write(ts_map)

    print("TypeScript constant map has been written to HmsError.ts")
else:
    print(f"Failed to fetch data. Status code: {response.status_code}")
