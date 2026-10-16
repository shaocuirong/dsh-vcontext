"""One request per process: shell-free JSON bridge and independently usable CLI."""
import argparse
import json
import os
import sys

from .core import ContextStore, pack
from .embedding import SentenceEmbedder


def main():
    parser = argparse.ArgumentParser(description='Agent virtual context JSON API')
    parser.add_argument('--db', required=True)
    parser.add_argument('--scope', required=True)
    parser.add_argument('--budget', type=int, default=8192)
    parser.add_argument('--model', help='Optional local sentence-transformers model path or model name')
    parser.add_argument('operation', nargs='?', default='status')
    parser.add_argument('--json', default=None, help='JSON object; omitted means read stdin (empty = {})')
    args = parser.parse_args()
    try:
        raw = args.json if args.json is not None else sys.stdin.buffer.read(2_000_001).decode('utf-8')
        if len(raw.encode()) > 2_000_000:
            raise ValueError('request too large')
        arguments = json.loads(raw) if raw.strip() else {}
        embedder = SentenceEmbedder(args.model) if args.model else None
        with ContextStore(args.db, args.scope, args.budget, embedder) as store:
            result = store.dispatch(args.operation, arguments)
        sys.stdout.buffer.write((pack(dict(ok=True,result=result))+'\n').encode('utf-8'))
        return 0
    except Exception as error:
        sys.stdout.buffer.write((pack(dict(ok=False,error=dict(type=type(error).__name__,message=str(error))))+'\n').encode('utf-8'))
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
