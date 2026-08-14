import os
import re
import html
import subprocess
import markdown

def build_pdf():
    readme_md_path = os.path.abspath("README.md")
    readme_pdf_path = os.path.abspath("README.pdf")
    temp_html_path = os.path.abspath("temp_readme_render.html")

    with open(readme_md_path, "r", encoding="utf-8") as f:
        md_text = f.read()

    # Ensure clean title
    if not md_text.startswith("# InfraPulse"):
        md_text = "# InfraPulse\n\n**IT Asset Management & Workstation Compliance Audit Platform**  \n*Engineered by Prevoyance IT Solutions — Version 3.0.0*\n\n---\n\n" + md_text

    # Convert markdown to html with extensions
    html_body = markdown.markdown(md_text, extensions=["tables", "fenced_code"])

    # Convert fenced mermaid code blocks to <div class="mermaid">
    def replace_mermaid(match):
        code = match.group(1)
        code = html.unescape(code)
        return f'<div class="mermaid-container"><div class="mermaid">\n{code}\n</div></div>'

    html_body = re.sub(
        r'<pre><code class="language-mermaid">(.*?)</code></pre>',
        replace_mermaid,
        html_body,
        flags=re.DOTALL
    )

    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>InfraPulse Specification Document</title>
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
<style>
@page {{
    size: A4 portrait;
    margin: 15mm 15mm 15mm 15mm;
}}

* {{
    box-sizing: border-box;
}}

body {{
    font-family: Arial, Helvetica, sans-serif;
    color: #000000;
    line-height: 1.5;
    font-size: 9.5pt;
    background: #ffffff;
    padding: 0;
    margin: 0;
}}

/* Headings */
h1 {{
    font-size: 20pt;
    font-weight: bold;
    color: #000000;
    margin-top: 10px;
    margin-bottom: 12px;
    border-bottom: 2px solid #000000;
    padding-bottom: 6px;
    page-break-after: avoid;
}}

h2 {{
    font-size: 14pt;
    font-weight: bold;
    color: #000000;
    margin-top: 18px;
    margin-bottom: 10px;
    border-bottom: 1px solid #666666;
    padding-bottom: 4px;
    page-break-after: avoid;
}}

h3 {{
    font-size: 11pt;
    font-weight: bold;
    color: #000000;
    margin-top: 14px;
    margin-bottom: 6px;
    page-break-after: avoid;
}}

h4 {{
    font-size: 10pt;
    font-weight: bold;
    color: #000000;
    margin-top: 10px;
    margin-bottom: 4px;
    page-break-after: avoid;
}}

p {{
    margin: 0 0 10px 0;
}}

/* Links */
a {{
    color: #000000;
    text-decoration: underline;
}}

/* Tables */
table {{
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0 16px 0;
    font-size: 9pt;
    border: 1px solid #000000;
}}

tr {{
    page-break-inside: avoid;
}}

th {{
    background: #f0f0f0;
    color: #000000;
    font-weight: bold;
    text-align: left;
    padding: 6px 10px;
    border: 1px solid #000000;
}}

td {{
    padding: 6px 10px;
    border: 1px solid #cccccc;
    vertical-align: top;
    color: #000000;
}}

tr:nth-child(even) td {{
    background: #fafafa;
}}

/* Code & Pre */
code {{
    font-family: "Courier New", Courier, monospace;
    font-size: 8.5pt;
    background: #f4f4f4;
    color: #000000;
    padding: 1px 4px;
    border: 1px solid #cccccc;
    border-radius: 2px;
}}

pre {{
    background: #f9f9f9;
    color: #000000;
    padding: 10px 12px;
    font-family: "Courier New", Courier, monospace;
    font-size: 8.5pt;
    line-height: 1.4;
    overflow-x: auto;
    margin: 10px 0;
    page-break-inside: avoid;
    border: 1px solid #000000;
    border-radius: 3px;
}}

pre code {{
    background: none;
    color: inherit;
    padding: 0;
    border: none;
}}

/* Mermaid Containers */
.mermaid-container {{
    background: #ffffff;
    border: 1px solid #999999;
    border-radius: 4px;
    padding: 10px;
    margin: 12px 0;
    display: flex;
    justify-content: center;
    align-items: center;
    page-break-inside: avoid;
}}

.mermaid {{
    width: 100%;
    text-align: center;
}}

.mermaid svg {{
    max-width: 100% !important;
    height: auto !important;
    max-height: 350px !important;
}}

/* Lists */
ul, ol {{
    margin: 0 0 10px 0;
    padding-left: 20px;
}}

li {{
    margin-bottom: 3px;
}}

blockquote {{
    margin: 10px 0;
    padding: 8px 14px;
    background: #f5f5f5;
    border-left: 4px solid #000000;
    color: #000000;
    font-size: 9pt;
}}

hr {{
    border: none;
    border-top: 1px solid #000000;
    margin: 16px 0;
}}
</style>
</head>
<body>

{html_body}

<script>
mermaid.initialize({{
    startOnLoad: true,
    theme: 'neutral',
    flowchart: {{
        useMaxWidth: true,
        htmlLabels: false,
        curve: 'basis'
    }}
}});
</script>
</body>
</html>
"""

    with open(temp_html_path, "w", encoding="utf-8") as f:
        f.write(full_html)

    chrome_exe = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    if not os.path.exists(chrome_exe):
        chrome_exe = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

    cmd = [
        chrome_exe,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--no-pdf-header-footer",
        "--virtual-time-budget=6000",
        f"--print-to-pdf={readme_pdf_path}",
        temp_html_path
    ]

    print("Building minimal B&W README.pdf via Chrome Headless...")
    subprocess.run(cmd, check=True)
    print("Successfully generated README.pdf! File size:", os.path.getsize(readme_pdf_path))

    # Clean up temp html file
    if os.path.exists(temp_html_path):
        os.remove(temp_html_path)

if __name__ == "__main__":
    build_pdf()
