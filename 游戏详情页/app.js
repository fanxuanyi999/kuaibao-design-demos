const select = selector => document.querySelector(selector);
const mediaButtons = [...document.querySelectorAll('[data-media]')];
const pictures = ['assets/3862e.png', 'assets/5924c.png'];
const posters = ['assets/abdd9.png', ...pictures];
const poster = select('#poster');
const sheet = select('#sheet');
const lightbox = select('#lightbox');
const tipTitles = ['渠道服转官服教程', '什么是官服', '如何前往bug反馈帖', '常见问题解答', '逆水寒公测须知汇总', '如何选择合适的资源包下载'];
const reviews = [
  ['大西洋奇怪的丹皮', '4137b.png', '这款游戏主要是摸金和打怪，单人玩真的挺有意思。有时候三个人，也能单人玩不匹配队友，也能升段位。多人模式下其他队伍都是敌人，要小心规划行动路线。'],
  ['阿叔家的狗', '45d67.png', '这款游戏主要是摸金和打怪。玩了一段时间，最喜欢和朋友一起探索地图。皮肤和玩法更新频繁，也希望后续能多做些新地图。']
];
const panels = {
  community: ['论坛 · 群聊', '游戏论坛和群聊入口。此页面用于产品演示。'],
  video: ['视频预览', '当前展示设计稿封面。接入游戏视频地址后可播放。'],
  awards: ['获得奖项', '2022 Google Play · 最受欢迎年度游戏\n2022 快爆运营 · 最有逼格游戏'],
  official: ['正版独家', '三角洲行动 · 腾讯游戏官方入驻'],
  ranking: ['热门榜', '三角洲行动在演示热门榜上排名第 23。'],
  event: ['事件日志', '10月23日更新：传说皮肤4D月下野蝶登场'],
  medal: ['限时活动', '参与限时活动可得勋章，活动奖励以游戏内公告为准。'],
  reservation: ['预约奖励', '08月21日 14:00 更新。可在版本卡片上切换预约状态。'],
  privacy: ['隐私政策', '隐私政策入口预览。'],
  permissions: ['所需权限', '应用权限说明入口预览。'],
  device: ['机型检测评分工具', '机型检测入口预览。'],
  tool: ['相关服务', '游戏工具入口预览。'],
  updates: ['更新日志', '版本 2.0.1 · 2026-05-12\n查看游戏介绍和事件日志了解更新。'],
  preview: ['试玩抢先体验', '可通过页面底部的云玩入口体验操作流程。'],
  facts: ['游戏信息', '开发商：奥和数字广州科技有限公司\n发行商：米哈游\n支持设备：华为not5'],
  cloud: ['云玩', '已打开云玩入口。演示页未接入云游戏服务。']
};
let mediaIndex = 0;
let imageIndex = 0;
let toastTimer;

// Expand once when the collapsed card's centre reaches the viewport midline.
const editorialDetails = select('.editorial details');
const editorialSummary = editorialDetails.querySelector('summary');
const editorialContent = select('.editorial-expanded');
let editorialAutoPending = true;
let editorialExpanded = false;
let editorialAnimation;
let editorialContentAnimation;
let editorialFrame = 0;

function setEditorialExpanded(expanded) {
  const startHeight = editorialDetails.getBoundingClientRect().height;
  editorialAnimation?.cancel();
  editorialContentAnimation?.cancel();
  editorialExpanded = expanded;
  editorialDetails.open = true;
  editorialDetails.classList.toggle('is-expanded', expanded);
  editorialSummary.setAttribute('aria-expanded', String(expanded));
  editorialDetails.style.height = 'auto';
  const endHeight = expanded ? editorialDetails.getBoundingClientRect().height : 44;
  const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 600;
  const options = { duration, easing: 'cubic-bezier(0, 0, .58, 1)', fill: 'both' };
  editorialAnimation = editorialDetails.animate(
    [{ height: startHeight + 'px' }, { height: endHeight + 'px' }],
    options
  );
  editorialContentAnimation = editorialContent.animate(
    expanded
      ? [{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'translateY(0)' }]
      : [{ opacity: 1 }, { opacity: 0 }],
    options
  );
  editorialAnimation.onfinish = () => {
    editorialDetails.open = expanded;
    editorialAnimation.cancel();
    editorialContentAnimation.cancel();
    editorialDetails.style.height = '';
  };
}

function checkEditorialPosition() {
  editorialFrame = 0;
  if (!editorialAutoPending || document.hidden) return;
  const bounds = editorialSummary.getBoundingClientRect();
  const viewport = window.visualViewport;
  const middle = (viewport?.offsetTop || 0) + (viewport?.height || innerHeight) / 2;
  if (bounds.top + bounds.height / 2 <= middle && bounds.bottom > 0) {
    editorialAutoPending = false;
    setEditorialExpanded(true);
  }
}

function scheduleEditorialCheck() {
  if (editorialAutoPending && !editorialFrame) {
    editorialFrame = requestAnimationFrame(checkEditorialPosition);
  }
}

editorialSummary.setAttribute('aria-expanded', 'false');
editorialSummary.addEventListener('click', event => {
  event.preventDefault();
  editorialAutoPending = false;
  setEditorialExpanded(!editorialExpanded);
});
window.addEventListener('scroll', scheduleEditorialCheck, { passive: true });
window.addEventListener('resize', scheduleEditorialCheck);
window.visualViewport?.addEventListener('resize', scheduleEditorialCheck);
document.addEventListener('visibilitychange', scheduleEditorialCheck);
window.addEventListener('load', scheduleEditorialCheck);
scheduleEditorialCheck();
select('#full-editorial').addEventListener('click', () => {
  showSheet('完整测评', [make('p', select('.editorial-copy p').textContent)]);
});

function make(tag, content, className) {
  const element = document.createElement(tag);
  element.textContent = content;
  if (className) element.className = className;
  return element;
}

function notify(message) {
  const toast = select('#toast');
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2200);
}

function jump(id) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  document.getElementById(id).scrollIntoView({ behavior: motion, block: 'start' });
  const tab = select('.nav-links [data-jump="' + id + '"]');
  if (tab) {
    select('.nav-links [aria-current]')?.removeAttribute('aria-current');
    tab.setAttribute('aria-current', 'true');
  }
}

function setMedia(index) {
  mediaIndex = (index + posters.length) % posters.length;
  poster.src = posters[mediaIndex];
  select('#header-backdrop-image').src = posters[mediaIndex];
  poster.classList.toggle('intro', mediaIndex === 0);
  poster.alt = mediaButtons[mediaIndex].textContent + '封面';
  mediaButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === mediaIndex)));
}

function setImage(index) {
  imageIndex = (index + pictures.length) % pictures.length;
  const image = lightbox.querySelector('img');
  image.src = pictures[imageIndex];
  image.alt = '游戏画面 ' + (imageIndex + 1);
  select('#image-count').textContent = (imageIndex + 1) + ' / ' + pictures.length;
}

function showSheet(title, content) {
  select('#sheet-title').textContent = title;
  select('#sheet-body').replaceChildren(...content);
  if (!sheet.open) sheet.showModal();
}

function sheetAction(label, action) {
  const button = make('button', label, 'sheet-button');
  button.addEventListener('click', action);
  return button;
}

function addReview(name, avatar, message, stars = '★★★☆☆') {
  const article = make('article', '', 'review');
  const image = make('img', '', 'avatar');
  image.src = 'assets/' + avatar;
  image.alt = '';
  const text = make('div', '');
  const author = make('button', name);
  author.addEventListener('click', () => showSheet(name, [make('p', message)]));
  const detail = make('small', '');
  const rating = make('span', '', 'stars');
  for (const star of stars) {
    const icon = make('img', '');
    icon.src = star === '★' ? 'assets/7f7f8.svg' : 'assets/dd694.svg';
    icon.alt = star === '★' ? '实心星' : '空心星';
    rating.append(icon);
  }
  detail.append(rating, name === '我的评价' ? '刚刚 · 本地演示' : '玩过19小时59分钟');
  text.append(author, detail, make('p', message));
  article.append(image, text);
  if (name === '我的评价') select('#review-list').prepend(article);
  else select('#review-list').append(article);
}

function openReview() {
  const form = make('form', '', 'review-form');
  const label = make('label', '分享你的游戏体验');
  label.htmlFor = 'review-input';
  const input = make('textarea', '');
  input.id = 'review-input';
  input.placeholder = '请输入评价';
  input.required = true;
  input.maxLength = 300;
  const submit = make('button', '发布演示评价', 'sheet-button');
  submit.type = 'submit';
  form.append(label, input, submit);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) {
      input.setCustomValidity('请输入评价内容');
      input.reportValidity();
      return;
    }
    addReview('我的评价', '4a8da.png', message, '★★★★★');
    sheet.close();
    jump('reviews');
    notify('已添加本地演示评价');
  });
  input.addEventListener('input', () => input.setCustomValidity(''));
  showSheet('写评价', [form]);
}

function openPanel(name, button) {
  if (name === 'review') return openReview();
  if (name === 'tips') {
    return showSheet('温馨提示', tipTitles.map(title => sheetAction(title, () => showSheet(title, [make('p', '游戏指南入口预览。')]))));
  }
  if (name === 'menu') {
    return showSheet('更多操作', [
      sheetAction('返回顶部', () => { sheet.close(); jump('top'); }),
      sheetAction('分享页面', async () => {
        sheet.close();
        try {
          if (navigator.share && location.protocol !== 'file:') {
            await navigator.share({ title: document.title, url: location.href });
          } else if (location.protocol !== 'file:' && navigator.clipboard) {
            await navigator.clipboard.writeText(location.href);
            notify('已复制页面链接');
          } else notify('可通过浏览器菜单分享此演示页');
        } catch (error) {
          if (error.name !== 'AbortError') notify('可通过浏览器菜单分享此演示页');
        }
      }),
      sheetAction('举报', () => openPanel('report'))
    ]);
  }
  if (name === 'report') {
    return showSheet('举报', ['信息有误', '内容不当', '其他问题'].map(reason => sheetAction(reason, () => {
      sheet.close();
      notify('已选择“' + reason + '” · 演示操作');
    })));
  }
  const [title, description] = panels[name];
  const content = description.split('\n').map(line => make('p', line));
  if (name === 'video') {
    const image = make('img', '');
    image.src = posters[mediaIndex];
    image.alt = poster.alt;
    image.style.width = '100%';
    content.unshift(image);
  }
  showSheet(name === 'tool' ? button.textContent.trim() : title, content);
}

tipTitles.forEach(title => {
  const button = make('button', '');
  const heading = make('span', '');
  const icon = make('img', '');
  icon.src = 'assets/5cca6.svg';
  icon.alt = '';
  heading.append(icon, title);
  button.append(heading, make('small', '薇薇安变了双人棺东西怎么分'));
  button.addEventListener('click', () => showSheet(title, [make('p', '游戏指南入口预览。')]));
  select('#tip-grid').append(button);
});
reviews.forEach(review => addReview(...review));
setMedia(0);

document.querySelectorAll('[data-jump]').forEach(button => button.addEventListener('click', () => jump(button.dataset.jump)));
document.querySelectorAll('[data-panel]').forEach(button => button.addEventListener('click', () => openPanel(button.dataset.panel, button)));
mediaButtons.forEach(button => button.addEventListener('click', () => setMedia(Number(button.dataset.media))));
document.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => {
  setImage(Number(button.dataset.image));
  lightbox.showModal();
}));
select('#previous').addEventListener('click', () => setImage(imageIndex - 1));
select('#next').addEventListener('click', () => setImage(imageIndex + 1));
lightbox.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') setImage(imageIndex - 1);
  if (event.key === 'ArrowRight') setImage(imageIndex + 1);
});
[sheet, lightbox].forEach(dialog => {
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
});
document.querySelectorAll('.expand').forEach(button => {
  const label = button.textContent;
  button.addEventListener('click', () => {
    const extra = button.nextElementSibling;
    extra.hidden = !extra.hidden;
    button.setAttribute('aria-expanded', String(!extra.hidden));
    button.textContent = extra.hidden ? label : '收起';
  });
});
function togglePressed(button) {
  const pressed = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(pressed));
  return pressed;
}
select('#follow').addEventListener('click', event => {
  const button = event.currentTarget;
  const followed = togglePressed(button);
  button.querySelector('.follow-label').textContent = followed ? '已关注' : '关注';
  notify(followed ? '已关注三角洲行动' : '已取消关注');
});
select('#reserve').addEventListener('click', event => {
  const button = event.currentTarget;
  const reserved = togglePressed(button);
  button.querySelector('span').textContent = reserved ? '· 已预约' : '· 预约';
  notify(reserved ? '已预约新版本' : '已取消预约');
});
select('#sound').addEventListener('click', event => {
  const button = event.currentTarget;
  const muted = togglePressed(button);
  button.classList.toggle('muted', muted);
  button.setAttribute('aria-label', muted ? '取消静音' : '静音');
});
select('#quality').addEventListener('click', event => {
  const button = event.currentTarget;
  button.textContent = button.textContent === '高清' ? '标清' : '高清';
});
document.querySelectorAll('[data-platform]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.platform === 'pc') showSheet('PC端', [make('p', '三角洲行动已上线 PC 平台。此处演示 PC 入口。')]);
}));
let swipeStart;
select('.poster').addEventListener('pointerdown', event => {
  if (event.pointerType === 'touch') swipeStart = event.clientX;
});
select('.poster').addEventListener('pointercancel', () => { swipeStart = undefined; });
select('.poster').addEventListener('pointerup', event => {
  if (swipeStart === undefined) return;
  const distance = event.clientX - swipeStart;
  swipeStart = undefined;
  if (Math.abs(distance) > 45) setMedia(mediaIndex + (distance < 0 ? 1 : -1));
});
