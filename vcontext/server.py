"""Resident context service: many operations over one long-lived process.

The per-call CLI pays a Python interpreter start and a fresh SQLite open on
every operation, which is the wrong shape for a component that is consulted on
every model step. This service keeps one process, one connection per scope and
one in-process render cache alive for the whole session.

Protocol: one JSON object per line on stdin, one JSON object per line on stdout.

    request   {"id": 7, "scope": "<namespace:agent>", "op": "snapshot", "args": {}}
    response  {"id": 7, "ok": true,  "result": {...}}
              {"id": 7, "ok": false, "error": {"type": "ContextError", "message": "..."}}

Control operations need no scope: `_ping` and `_close`. Requests are processed
in arrival order; a scope becomes visible exactly when its scope string is used,
and the client derives that string from host-owned configuration and agent
identity, never from page content.
"""
import argparse
import json
import sys

from .core import ContextStore, ContextError, pack

MAX_REQUEST_BYTES = 2_000_000


class Service:
    def __init__(self, db, budget=8192, model=None, max_scopes=32):
        if not isinstance(budget, int) or isinstance(budget, bool) or budget < 128:
            raise ContextError('budget must be an integer >= 128')
        if not isinstance(max_scopes, int) or isinstance(max_scopes, bool) or max_scopes < 1:
            raise ContextError('max_scopes must be a positive integer')
        self.db, self.budget, self.model = db, budget, model
        self.max_scopes = max_scopes
        self._embedder = None
        self._stores = {}
        self._order = []
        self.closed = False

    @property
    def embedder(self):
        # Loading a semantic model is deferred until a scope actually needs it.
        if self.model and self._embedder is None:
            from .embedding import SentenceEmbedder
            self._embedder = SentenceEmbedder(self.model)
        return self._embedder

    def store(self, scope):
        if self.closed:
            raise ContextError('service is closed')
        store = self._stores.get(scope)
        if store is not None:
            self._touch(scope)
            return store
        while len(self._order) >= self.max_scopes:
            oldest = self._order.pop(0)
            self._stores.pop(oldest).close()
        store = ContextStore(self.db, scope, self.budget, self.embedder)
        self._stores[scope] = store
        self._order.append(scope)
        return store

    def _touch(self, scope):
        self._order.remove(scope)
        self._order.append(scope)

    def handle(self, request):
        if not isinstance(request, dict):
            raise ContextError('request must be an object')
        request_id = request.get('id')
        if type(request_id) is not int or isinstance(request_id, bool) or request_id < 0:
            raise ContextError('request id must be a nonnegative integer')
        operation = request.get('op')
        if not isinstance(operation, str) or not operation:
            raise ContextError('op is required')
        if operation == '_ping':
            return dict(request_id=request_id, pong=True, scopes=len(self._stores))
        if operation == '_close':
            self.close()
            return dict(request_id=request_id, closed=True)
        if not operation.replace('_', '').isalnum() or not operation.replace('_', '').isascii():
            raise ContextError('invalid operation name')
        scope = request.get('scope')
        if not isinstance(scope, str) or not scope or len(scope) > 512:
            raise ContextError('scope must be a nonempty string of at most 512 characters')
        arguments = request.get('args', {})
        if not isinstance(arguments, dict):
            raise ContextError('args must be an object')
        return dict(request_id=request_id, result=self.store(scope).dispatch(operation, arguments))


def encode(payload):
    return (pack(payload) + '\n').encode('utf-8')


def serve(service, stdin, stdout):
    for line in stdin:
        if len(line) > MAX_REQUEST_BYTES:
            stdout.write(encode(dict(id=-1, ok=False, error=dict(type='ContextError', message='request too large'))))
            stdout.flush()
            continue
        raw = line.strip()
        if not raw:
            continue
        request_id = -1
        try:
            request = json.loads(raw.decode('utf-8'))
            if isinstance(request, dict) and type(request.get('id')) is int:
                request_id = request['id']
            handled = service.handle(request)
            if 'result' in handled:
                response = dict(id=handled['request_id'], ok=True, result=handled['result'])
            else:
                response = dict(id=handled['request_id'], ok=True,
                                result={k: v for k, v in handled.items() if k != 'request_id'})
        except Exception as error:  # noqa: BLE001 - one bad request must not kill the service
            response = dict(id=request_id, ok=False,
                            error=dict(type=type(error).__name__, message=str(error)))
        stdout.write(encode(response))
        stdout.flush()
        if service.closed:
            return 0
    return 0


def main():
    parser = argparse.ArgumentParser(description='Resident agent virtual context service')
    parser.add_argument('--db', required=True)
    parser.add_argument('--budget', type=int, default=8192)
    parser.add_argument('--model', help='Optional local sentence-transformers model path or model name')
    parser.add_argument('--max-scopes', type=int, default=32, dest='max_scopes')
    args = parser.parse_args()
    service = Service(args.db, args.budget, args.model, args.max_scopes)
    try:
        return serve(service, sys.stdin.buffer, sys.stdout.buffer)
    finally:
        service.close()


if __name__ == '__main__':
    raise SystemExit(main())
