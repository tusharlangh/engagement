import re

with open("src/app/page.tsx", "r") as f:
    content = f.read()

# Replace clamp with the minimum size (the first argument)
content = re.sub(r'clamp\(\s*([0-9.]+px)\s*,\s*[^,]+,\s*[^)]+\)', r'\1', content)

# Remove responsive tailwind classes (sm:, md:, lg:, xl:, 2xl:)
# Handles standard classes and arbitrary values like md:max-h-[40vh]
# We'll use a regex that matches word boundary, then prefix:, then anything up to space or quote
content = re.sub(r'\b(sm|md|lg|xl|2xl):[A-Za-z0-9\-\[\]\.\/]+', '', content)

# Clean up any double spaces left behind by class removal
content = re.sub(r' {2,}', ' ', content)

with open("src/app/page.tsx", "w") as f:
    f.write(content)

print("Modification complete")
