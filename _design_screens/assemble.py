import json, re, os, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.dirname(ROOT)
NEW = os.path.join(ROOT, 'src')

src = open(os.path.join(PROJECT, 'index.html'), encoding='utf-8').read()

m = re.search(r'(<script type="application/json" id="screens">)(.*?)(</script>)', src, re.S)
if not m:
    print('could not find screens script'); sys.exit(1)
prefix_full = src[:m.start(2)]
json_blob = m.group(2)
suffix_from_closing_script = src[m.end(2):]  # starts with </script> ... rest of file

data = json.loads(json_blob)

overridden = []
for fname in sorted(os.listdir(NEW)):
    if not fname.endswith('.markup.html'):
        continue
    name = fname[:-len('.markup.html')]
    markup_path = os.path.join(NEW, fname)
    code_path = os.path.join(NEW, name + '.code.js')
    markup = open(markup_path, encoding='utf-8').read()
    code = open(code_path, encoding='utf-8').read() if os.path.exists(code_path) else data.get(name, {}).get('code', '\nclass Component extends DCLogic {\nrenderVals() {\nreturn {};\n}\n}\n')
    if name not in data:
        print('WARNING: unknown screen name', name); continue
    data[name]['markup'] = markup
    data[name]['code'] = code
    overridden.append(name)

print('Overrode screens:', overridden)

new_json_blob = json.dumps(data, ensure_ascii=False)
new_json_blob = new_json_blob.replace('</', '<\\/')

app_store = open(os.path.join(ROOT, 'app-store.js'), encoding='utf-8').read()
levels_json = open(os.path.join(ROOT, 'levels.json'), encoding='utf-8').read()
app_store_rendered = app_store.replace('__LEVELS_JSON__', levels_json)
engine = open(os.path.join(ROOT, 'engine.js'), encoding='utf-8').read()
i18n = open(os.path.join(ROOT, 'i18n.js'), encoding='utf-8').read()
audio = open(os.path.join(ROOT, 'audio.js'), encoding='utf-8').read()
LANG_DIR = os.path.join(ROOT, 'lang')
for fname in sorted(os.listdir(LANG_DIR)):
    if fname.endswith('.json'):
        table = json.load(open(os.path.join(LANG_DIR, fname), encoding='utf-8'))
        i18n += '\nApp.DICT[%s] = %s;' % (json.dumps(fname[:-5]), json.dumps(table, ensure_ascii=False).replace('</', '<\\/'))

# suffix_from_closing_script currently = "</script>\n<script>\n(function(){...})();\n</script>\n</body>\n</html>"
# Replace the OLD engine script body (between the second <script> and its </script>) with app_store+engine.
m2 = re.search(r'(</script>\s*<script>\s*)(.*?)(\s*</script>\s*</body>\s*</html>\s*)$', suffix_from_closing_script, re.S)
if not m2:
    print('could not find engine script block'); sys.exit(1)

new_suffix = suffix_from_closing_script[:m2.start(2)] + app_store_rendered + '\n' + i18n + '\n' + audio + '\n' + engine.rstrip('\n') + suffix_from_closing_script[m2.end(2):]

out = prefix_full + new_json_blob + new_suffix
out_path = os.path.join(PROJECT, 'index.html')
open(out_path, 'w', encoding='utf-8').write(out)
print('wrote', out_path, len(out), 'bytes')
