const DEFAULT_PROTECT_RECENT_PAGES = 2;
const MAX_PROTECT_RECENT_PAGES = 32;

function fail(code, message) {
  throw Object.assign(new Error(message), { code });
}

/**
 * Compute a page-level quota trial. This is a ledger preview, not an
 * enforcement mechanism: it only sums page bytes and protection classes.
 */
export function quotaTrial(plan, options = {}) {
  if (!plan || plan.format !== 'vctx-history-pages-v1' || !Array.isArray(plan.pages))
    fail('INVALID_INPUT', '历史分页计划无效。');
  const protectRecentPages = options.protect_recent_pages ?? DEFAULT_PROTECT_RECENT_PAGES;
  if (!Number.isSafeInteger(protectRecentPages) || protectRecentPages < 0
    || protectRecentPages > MAX_PROTECT_RECENT_PAGES)
    fail('INVALID_INPUT', 'protect_recent_pages 必须在 0 到 32 之间。');
  const recentStart = Math.max(0, (plan.total_pages ?? plan.pages.length) - protectRecentPages);
  let totalBytes = 0, protectedBytes = 0, eligibleBytes = 0;
  let protectedPages = 0, eligiblePages = 0;
  plan.pages.forEach((page, index) => {
    const bytes = Number.isSafeInteger(page.bytes) && page.bytes >= 0 ? page.bytes : 0;
    totalBytes += bytes;
    const eligible = page.sealed === true && page.tool_balanced === true && page.opaque !== true;
    const recent = index >= recentStart;
    if (!eligible || recent) {
      protectedBytes += bytes;
      protectedPages += 1;
    } else {
      eligibleBytes += bytes;
      eligiblePages += 1;
    }
  });
  return {
    pages: plan.pages.length,
    total_bytes: totalBytes,
    protected_bytes: protectedBytes,
    eligible_bytes: eligibleBytes,
    protected_pages: protectedPages,
    eligible_pages: eligiblePages,
  };
}

/**
 * Decide whether one page may be manually paged out. Protection is
 * conservative: last N pages and any open/unbalanced/opaque page are not
 * eligible unless allow_recent explicitly overrides only the recent window.
 */
export function planHistoryPageOut(plan, options = {}) {
  if (!plan || plan.format !== 'vctx-history-pages-v1' || !Array.isArray(plan.pages))
    fail('INVALID_INPUT', '历史分页计划无效。');
  if (!options || typeof options !== 'object' || Array.isArray(options))
    fail('INVALID_INPUT', '分页参数无效。');
  const pageId = options.page_id;
  if (typeof pageId !== 'string' || pageId.length === 0 || pageId.length > 64)
    fail('INVALID_INPUT', 'page_id 无效。');
  const protectRecentPages = options.protect_recent_pages ?? DEFAULT_PROTECT_RECENT_PAGES;
  if (!Number.isSafeInteger(protectRecentPages) || protectRecentPages < 0
    || protectRecentPages > MAX_PROTECT_RECENT_PAGES)
    fail('INVALID_INPUT', 'protect_recent_pages 必须在 0 到 32 之间。');
  const allowRecent = options.allow_recent === true;
  const index = plan.pages.findIndex(page => page.page_id === pageId);
  if (index < 0) fail('NOT_FOUND', '找不到该历史页面。');
  const page = plan.pages[index];
  const recent = protectRecentPages > 0 && index >= (plan.total_pages ?? plan.pages.length) - protectRecentPages;
  const eligible = page.sealed === true && page.tool_balanced === true && page.opaque !== true;
  const reason = !eligible
    ? (page.opaque ? 'OPAQUE' : page.sealed ? 'UNBALANCED' : 'OPEN')
    : (recent && !allowRecent ? 'PROTECTED' : null);
  return {
    page,
    index,
    eligible: reason === null,
    reason,
    quota_trial: quotaTrial(plan, { protect_recent_pages: protectRecentPages }),
  };
}
