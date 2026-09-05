(() => {
  'use strict';

  const examples = {
    weekend: [12000, 8000],
    dinner: [4800, 9200],
    equal: [6000, 6000],
  };
  const yen = value => `¥${value.toLocaleString('ja-JP')}`;
  const choices = document.querySelectorAll('[data-scenario]');

  let currentKey = 'weekend';
  const balanceAction = document.getElementById('balance-action');
  const balanceBeam = document.getElementById('balance-beam');
  const balanceState = document.getElementById('balance-state');
  function setBalance(settled) {
    const [you, partner] = examples[currentKey];
    const isEqual = you === partner;
    balanceBeam.style.setProperty('--tilt', `${settled || isEqual ? 0 : you > partner ? -9 : 9}deg`);
    balanceState.textContent = settled || isEqual
      ? 'ふたりの負担がそろって、とんとん。'
      : you > partner ? 'いまは、あなたが多く立て替えています。' : 'いまは、パートナーが多く立て替えています。';
    balanceAction.textContent = settled ? '精算前に戻す' : '精算後のバランスを見る';
    balanceAction.dataset.settled = String(settled);
    balanceAction.disabled = isEqual;
    const total = you + partner;
    document.getElementById('paid-you').textContent = yen(settled ? total / 2 : you);
    document.getElementById('paid-partner').textContent = yen(settled ? total / 2 : partner);
    document.querySelectorAll('.demo-person > span:not(.person-dot)').forEach(label => {
      const who = label.closest('.demo-person').querySelector('.sage') ? 'あなた' : 'パートナー';
      label.textContent = settled ? `${who}の実質負担` : `${who}が払った`;
    });
    document.getElementById('bar-you').style.width = `${settled ? 50 : you / total * 100}%`;
    document.getElementById('bar-partner').style.width = `${settled ? 50 : partner / total * 100}%`;
    document.getElementById('demo-caption').textContent = settled
      ? 'この金額を渡すと、ふたりの負担が同じに。'
      : isEqual ? 'もう、とんとん。精算は不要です。' : '渡せば、とんとん。';
  }

  function showExample(key) {
    const amounts = examples[key];
    if (!amounts) return;
    currentKey = key;
    const [you, partner] = amounts;
    const total = you + partner;
    const settlement = Math.abs(you - partner) / 2;
    document.getElementById('paid-you').textContent = yen(you);
    document.getElementById('paid-partner').textContent = yen(partner);
    document.getElementById('bar-you').style.width = `${you / total * 100}%`;
    document.getElementById('bar-partner').style.width = `${partner / total * 100}%`;
    document.getElementById('demo-direction').textContent = settlement === 0
      ? 'ふたりの負担は、同じ金額です'
      : you > partner ? 'パートナーから、あなたへ' : 'あなたから、パートナーへ';
    document.getElementById('demo-amount').textContent = yen(settlement);
    document.getElementById('demo-caption').textContent = settlement === 0
      ? 'もう、とんとん。精算は不要です。' : '渡せば、とんとん。';
    document.getElementById('demo-explanation').textContent =
      `合計 ${yen(total)} ÷ 2人 = ひとり ${yen(total / 2)}`;
    choices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scenario === key)));
    setBalance(false);
  }

  choices.forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => showExample(button.dataset.scenario));
  });

  balanceAction.addEventListener('click', () => setBalance(balanceAction.dataset.settled !== 'true'));
  setBalance(false);

  // Keep the mobile action available without covering the opening/closing CTAs.
  const bar = document.querySelector('.mobile-download');
  const hero = document.querySelector('.hero');
  const closing = document.querySelector('.closing');
  const footer = document.querySelector('.footer');
  if (!bar || !hero || !closing || !footer || !('IntersectionObserver' in window)) return;
  const mobile = window.matchMedia('(max-width: 760px)');
  const updateBar = () => {
    const pastHero = hero.getBoundingClientRect().bottom < 0;
    const atEnd = closing.getBoundingClientRect().top <= window.innerHeight ||
      footer.getBoundingClientRect().top <= window.innerHeight;
    bar.hidden = !mobile.matches || !pastHero || atEnd;
  };
  const observer = new IntersectionObserver(updateBar, { threshold: 0 });
  [hero, closing, footer].forEach(section => observer.observe(section));
  mobile.addEventListener('change', updateBar);
  updateBar();
})();
