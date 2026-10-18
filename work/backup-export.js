// Read-only local backup of the legacy browser records.
(() => {
  'use strict';
  const button = document.getElementById('exportWorkRecords');
  const status = document.getElementById('exportWorkRecordsStatus');
  if (!button || !status) return;

  button.addEventListener('click', () => {
    let raw;
    try {
      raw = window.localStorage.getItem('workRecordsV2');
    } catch {
      status.textContent = 'このブラウザの保存データにアクセスできません。サイトデータは削除せず、個別にお問い合わせください。';
      return;
    }
    if (raw === null) {
      status.textContent = 'このブラウザには勤務記録が見つかりません。以前使っていた端末・ブラウザから開いてください。';
      return;
    }
    let records;
    try {
      records = JSON.parse(raw);
      if (!Array.isArray(records)) throw new Error('Expected record array');
    } catch {
      status.textContent = '記録の形式を確認できません。元データを消さず、個別にお問い合わせください。';
      return;
    }
    if (records.length === 0) {
      status.textContent = 'このブラウザの勤務記録は0件です。以前使っていた端末・ブラウザも確認してください。';
      return;
    }

    // Keep the original stored JSON byte-for-byte (except Blob encoding).
    const blob = new Blob([raw], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const now = new Date();
    const stamp = [now.getFullYear(), String(now.getMonth()+1).padStart(2,'0'), String(now.getDate()).padStart(2,'0')].join('');
    link.href = url;
    link.download = 'nextguess-legacy-work-backup-' + stamp + '.json';
    document.body.appendChild(link);
    try {
      link.click();
      status.textContent = records.length + '件のバックアップ保存を開始しました。端末の「ダウンロード」などでファイルを確認し、安全な場所に保管してください。';
    } finally {
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    }
  });
})();
