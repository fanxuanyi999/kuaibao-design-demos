// 演示数据来自设计稿；上线时通过真实活动接口替换。
const sampleRows = Array.from({ length: 8 }, (_, index) => index % 2 === 0
  ? { id: '4895582', qq: '111**45', status: '已开通' }
  : { id: '5088138', qq: '111**45发…', status: '未开通' });
const rows = document.querySelector('#winner-rows');
sampleRows.forEach(item => {
  const tr = document.createElement('tr');
  [item.id, item.qq, item.status].forEach(value => {
    const td = document.createElement('td'); td.textContent = value; tr.append(td);
  });
  rows.append(tr);
});
let toastTimer;
function notify(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message; toast.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.hidden = true; }, 3000);
}
async function copy(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const field = document.createElement('textarea'); field.value = text;
    field.style.cssText = 'position:fixed;opacity:0'; document.body.append(field); field.select();
    const success = document.execCommand('copy'); field.remove(); return success;
  }
}
document.querySelector('#copy-id').addEventListener('click', async () => notify(await copy('45498792') ? '快爆ID已复制' : '快爆ID：45498792，请长按复制'));
document.querySelectorAll('[data-pending]').forEach(button => button.addEventListener('click', () => notify(button.dataset.pending)));
document.querySelector('#back').addEventListener('click', () => { if (history.length > 1) history.back(); else notify('当前已是活动首页'); });
document.querySelector('#more').addEventListener('click', () => document.querySelector('#share').click());
document.querySelector('#share').addEventListener('click', async () => {
  const text = '我已获得王者荣耀世界 S2赛季测试资格！';
  try {
    if (navigator.share && location.protocol !== 'file:') await navigator.share({ title: document.title, text, url: location.href });
    else notify(await copy(text) ? '资格分享文案已复制' : text);
  } catch (error) { if (error.name !== 'AbortError') notify('暂时无法分享，请稍后重试'); }
});
document.querySelector('#search-form').addEventListener('submit', event => {
  event.preventDefault();
  const input = document.querySelector('#kuaibao-id');
  const result = document.querySelector('#search-result'); const id = input.value.trim();
  result.hidden = false;
  if (!/^\d{5,20}$/.test(id)) { result.textContent = '请输入完整的数字快爆ID（5–20位）'; input.focus(); return; }
  const record = sampleRows.find(item => item.id === id);
  result.textContent = id === '45498792' ? '演示查询：你已获得本次测试资格，详见上方资格卡。'
    : record ? `演示查询：快爆ID ${id}，资格状态：${record.status}。`
    : '演示名单中未找到该ID。当前未连接真实查询服务，请以官方通知为准。';
});
const tabs = [...document.querySelectorAll('[role=tab]')];
function activateTab(tab) {
  tabs.forEach(item => { const selected = item === tab; item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1; });
  document.querySelector('#winner-panel').setAttribute('aria-labelledby', tab.id);
  const isFirst = tab === tabs[0];
  document.querySelector('.winner-table').hidden = !isFirst;
  document.querySelector('#empty-state').hidden = isFirst;
  tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); tabs[next].focus(); activateTab(tabs[next]); }
  });
});
