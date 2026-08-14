import os
import re
import json

project_root = "."

stats = {
    "files": {},
    "total_python_lines": 0,
    "fastapi_imports": [],
    "app_instances": [],
    "endpoints": [],
    "pydantic_models": [],
    "static_mounts": [],
    "middleware": [],
    "uvicorn_references": [],
    "frontend_api_calls": []
}

# Regex patterns
endpoint_regex = re.compile(r"@app\.(get|post|put|delete|patch|options|head|websocket|on_event)\s*\(\s*[\"']([^\"']+)[\"']")
class_model_regex = re.compile(r"class\s+(\w+)\s*\((?:BaseModel|.*BaseModel.*)\)")

for root, dirs, files in os.walk(project_root):
    for d in [".git", "venv", "__pycache__", ".gemini", "node_modules"]:
        if d in dirs:
            dirs.remove(d)
            
    for file in files:
        filepath = os.path.join(root, file)
        relpath = os.path.relpath(filepath, project_root).replace("\\", "/")
        
        # Scan python files
        if file.endswith(".py"):
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                lines = f.readlines()
                line_count = len(lines)
                stats["total_python_lines"] += line_count
                stats["files"][relpath] = line_count
                
                for idx, line in enumerate(lines, 1):
                    sline = line.strip()
                    if "fastapi" in line.lower():
                        stats["fastapi_imports"].append({"file": relpath, "line": idx, "content": sline})
                    if "FastAPI(" in line:
                        stats["app_instances"].append({"file": relpath, "line": idx, "content": sline})
                    if "app.mount(" in line or "StaticFiles(" in line:
                        stats["static_mounts"].append({"file": relpath, "line": idx, "content": sline})
                    if "add_middleware" in line or "CORSMiddleware" in line:
                        stats["middleware"].append({"file": relpath, "line": idx, "content": sline})
                    if "uvicorn" in line.lower():
                        stats["uvicorn_references"].append({"file": relpath, "line": idx, "content": sline})
                        
                    m_ep = endpoint_regex.search(line)
                    if m_ep:
                        stats["endpoints"].append({
                            "file": relpath,
                            "line": idx,
                            "method": m_ep.group(1).upper(),
                            "path": m_ep.group(2),
                            "content": sline
                        })
                    
                    m_mod = class_model_regex.search(line)
                    if m_mod:
                        stats["pydantic_models"].append({
                            "file": relpath,
                            "line": idx,
                            "model_name": m_mod.group(1)
                        })

        # Scan scripts, powershell, docs, requirements for FastAPI / Uvicorn references
        elif file.endswith((".ps1", ".txt", ".md", ".json", ".sh", ".html", ".js")):
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                if "fastapi" in content.lower() or "uvicorn" in content.lower():
                    stats["uvicorn_references"].append({"file": relpath, "content_match": "References FastAPI/Uvicorn"})

print("=== FASTAPI ANALYSIS REPORT ===")
print(f"Total Python Files: {len(stats['files'])}")
print(f"Total Python Lines: {stats['total_python_lines']}")
print(f"File Breakdowns: {json.dumps(stats['files'], indent=2)}")
print(f"FastAPI Endpoints Count: {len(stats['endpoints'])}")
print("\nEndpoints list:")
for ep in stats["endpoints"]:
    print(f"  Line {ep['line']:4d} | {ep['method']:6s} | {ep['path']}")

print(f"\nPydantic Request/Response Models Count: {len(stats['pydantic_models'])}")
print("Models:", [m['model_name'] for m in stats['pydantic_models']])

print(f"\nFastAPI Imports found: {len(stats['fastapi_imports'])}")
for imp in stats['fastapi_imports']:
    print(f"  {imp['file']}:{imp['line']} -> {imp['content']}")

print(f"\nFastAPI App Instances: {len(stats['app_instances'])}")
for inst in stats['app_instances']:
    print(f"  {inst['file']}:{inst['line']} -> {inst['content']}")

with open("scratch/fastapi_report.json", "w", encoding="utf-8") as f:
    json.dump(stats, f, indent=2)
