"""Extract Python declarations for the source handbook without importing project code."""
import ast
import json
import sys
from pathlib import Path


def extract(path):
    source = Path(path).read_text(encoding="utf-8-sig")
    tree = ast.parse(source)
    symbols = []

    def expression(node):
        return ast.get_source_segment(source, node) or ast.unparse(node)

    def owned(node):
        for child in ast.iter_child_nodes(node):
            if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef, ast.Lambda)):
                continue
            yield child
            yield from owned(child)

    def shape(node):
        if isinstance(node, ast.Dict):
            return "对象字段：" + "、".join(expression(k) if k else "...展开来源" for k in node.keys)
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "dict":
            return "对象字段：" + "、".join(k.arg or "...展开来源" for k in node.keywords)
        if isinstance(node, (ast.List, ast.ListComp)):
            return "列表"
        if isinstance(node, ast.Constant):
            return type(node.value).__name__
        return None

    def visit(node, parent=""):
        for child in ast.iter_child_nodes(node):
            if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef, ast.Lambda)):
                name = getattr(child, "name", "lambda@" + str(child.lineno))
                qualified = parent + "." + name if parent else name
                members = list(owned(child))
                args = ast.unparse(child.args) if hasattr(child, "args") else ""
                returns = [expression(n.value) for n in members if isinstance(n, ast.Return) and n.value]
                if isinstance(child, ast.Lambda):
                    returns.append(expression(child.body))
                symbols.append(dict(
                    name=qualified, short=name, kind=type(child).__name__, line=child.lineno,
                    end=child.end_lineno, signature=name + "(" + args + ")",
                    column=child.col_offset, endColumn=child.end_col_offset,
                    bases=[expression(n) for n in getattr(child, "bases", [])],
                    doc=ast.get_docstring(child) if not isinstance(child, ast.Lambda) else None,
                    params=[a.arg for a in [*getattr(getattr(child, "args", None), "posonlyargs", []),
                                           *getattr(getattr(child, "args", None), "args", []),
                                           *getattr(getattr(child, "args", None), "kwonlyargs", [])]]
                    + [a.arg for a in [getattr(getattr(child, "args", None), "vararg", None),
                                      getattr(getattr(child, "args", None), "kwarg", None)] if a],
                    returns=returns,
                    returnShapes=list(dict.fromkeys(s for n in members if isinstance(n, ast.Return) and n.value
                                                     for s in [shape(n.value)] if s)),
                    calls=list(dict.fromkeys(expression(n.func) for n in members if isinstance(n, ast.Call))),
                    errors=list(dict.fromkeys(expression(n.exc) for n in members if isinstance(n, ast.Raise) and n.exc)),
                    decorators=[expression(n) for n in getattr(child, "decorator_list", [])],
                    fields=list(dict.fromkeys(
                        str(key.value) for n in members if isinstance(n, ast.Dict)
                        for key in n.keys if isinstance(key, ast.Constant) and isinstance(key.value, str))),
                    tests=[]))
                visit(child, qualified)
            else:
                visit(child, parent)

    visit(tree)
    imports = [expression(n) for n in ast.walk(tree) if isinstance(n, (ast.Import, ast.ImportFrom))]
    return dict(symbols=symbols, imports=imports, doc=ast.get_docstring(tree))


def main():
    paths = json.load(sys.stdin)
    json.dump({path: extract(path) for path in paths}, sys.stdout, ensure_ascii=True)


if __name__ == "__main__":
    main()
