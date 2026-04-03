import re

with open('Main.jsx', 'r') as f:
    content = f.read()

# Fix the JSX syntax error by adding comma before the comment
content = content.replace(
    '}\n\n      {/* Location Section */}\n      <section',
    '},\n      {/* Location Section */}\n      <section'
)

with open('Main.jsx', 'w') as f:
    f.write(content)
