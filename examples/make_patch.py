"""Generate an absolute-path Cordis patch; JSON is valid YAML."""
import argparse
import json
from pathlib import Path
import sys


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--db',required=True)
    parser.add_argument('--namespace',required=True)
    parser.add_argument('--output',default='cordis.local.yml')
    parser.add_argument('--budget',type=int,default=8192)
    parser.add_argument('--model',help='Optional local sentence-transformers model directory')
    args = parser.parse_args()
    project = Path(__file__).resolve().parents[1]
    config = dict(dbPath=str(Path(args.db).resolve()),namespace=args.namespace,
                  python=sys.executable,budget=args.budget)
    if args.model: config['model'] = args.model
    rows = [dict(insert=[dict(id='virtual-context',name=str(project/'index.mjs'),config=config)])]
    target = Path(args.output).resolve()
    with target.open('x',encoding='utf-8') as out:
        json.dump(rows,out,ensure_ascii=False,indent=2)
        out.write('\n')
    print(str(target))


if __name__ == '__main__': main()
