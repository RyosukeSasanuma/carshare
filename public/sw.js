// NOBLE DRIVE - 最小構成のService Worker
// 目的: PWAとしてインストール可能にすること（オフラインキャッシュは行わない）。
// fetchハンドラを登録することでブラウザのインストール要件を満たす（ネットワークにそのまま委譲）。
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // ネットワークにパススルー（respondWithしない = 通常のリクエスト処理）
});
