import os
import re

def convert_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace imports
    # import { a, b } from 'c';
    content = re.sub(r"import\s+\{([^}]+)\}\s+from\s+['\"]([^'\"]+)['\"];", r"const {\1} = require('\2');", content)
    # import a from 'b';
    content = re.sub(r"import\s+([a-zA-Z0-9_]+)\s+from\s+['\"]([^'\"]+)['\"];", r"const \1 = require('\2');", content)

    # 2. Replace exports
    content = re.sub(r"export\s+const\s+([a-zA-Z0-9_]+)\s*=", r"exports.\1 =", content)
    
    # export class Name
    def replace_class(m):
        class_name = m.group(1)
        return f"class {class_name}"
    
    classes = re.findall(r"export\s+class\s+([a-zA-Z0-9_]+)", content)
    content = re.sub(r"export\s+class\s+([a-zA-Z0-9_]+)", replace_class, content)
    
    if classes:
        for c in classes:
            content += f"\nexports.{c} = {c};\n"

    # 3. Replace Firebase config import
    content = re.sub(r"const\s+\{\s*db\s*\}\s*=\s*require\([^)]+config/firebase[^)]+\);", r"const admin = require('firebase-admin');\nconst db = admin.firestore();", content)

    # 4. Remove firebase/firestore import
    content = re.sub(r"const\s+\{[^}]+\}\s*=\s*require\('firebase/firestore'\);", r"// removed firestore import", content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def walk_dir(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".js"):
                convert_file(os.path.join(root, file))

if __name__ == "__main__":
    walk_dir(r"C:\SSR Team\functions\src\engine")
