"""Vesta-inspired advisory placement, not a KV-cache transport implementation."""
import math


def choose_executor(holder, executors, page_bytes, congestion=0.0, pages=None):
    if not isinstance(holder, str) or not holder:
        raise ValueError("holder required")
    if not isinstance(page_bytes, int) or isinstance(page_bytes, bool) or page_bytes < 0:
        raise ValueError("page_bytes must be nonnegative integer")
    if not math.isfinite(congestion) or congestion < 0:
        raise ValueError("congestion must be finite and nonnegative")
    ranked = []
    seen = set()
    if pages is not None:
        if not isinstance(pages,list) or any(not isinstance(p,dict) or not isinstance(p.get('id'),str)
            or type(p.get('bytes')) is not int or p['bytes'] < 0 for p in pages):
            raise ValueError('pages must contain id and nonnegative integer bytes')
        if len({p['id'] for p in pages}) != len(pages):
            raise ValueError('duplicate page ids')
    for node in executors:
        identity = node['id']
        if not isinstance(identity, str) or not identity or identity in seen:
            raise ValueError("executor ids must be unique nonempty strings")
        seen.add(identity)
        queue = float(node['queue_ms'])
        compute = float(node['compute_ms'])
        bandwidth = float(node['bytes_per_ms'])
        if any(not math.isfinite(x) for x in [queue, compute, bandwidth]) or min(queue, compute) < 0 or bandwidth <= 0:
            raise ValueError("invalid executor metrics")
        cached = node.get('cached_page_ids', [])
        if not isinstance(cached,list) or any(not isinstance(p,str) for p in cached):
            raise ValueError('cached_page_ids must be a list of strings')
        missing = (sum(p['bytes'] for p in pages if p['id'] not in cached)
                   if pages is not None else page_bytes)
        if identity == holder:
            missing = 0
        transfer = missing / bandwidth
        added_work = compute + transfer
        ranked.append(dict(id=identity, queue_ms=queue, missing_bytes=missing, transfer_ms=transfer,
                           score_ms=queue + (1+congestion)*added_work))
    if not ranked:
        raise ValueError("at least one executor required")
    ranked.sort(key=lambda x: (x['score_ms'], x['id']))
    return dict(holder=holder, executor=ranked[0]['id'], candidates=ranked,
                advisory=True, formula="queue_ms + (1 + congestion) * (compute_ms + transfer_ms)")
