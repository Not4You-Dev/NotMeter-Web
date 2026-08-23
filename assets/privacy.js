(() => {
  "use strict";

  const supported = ["ko", "en", "zh-TW"];
  const labels = { ko: "한국어", en: "English", "zh-TW": "繁中" };
  const copy = {
    ko: {
      title: "개인정보처리방침",
      collectionTitle: "수집·이용하는 정보",
      collectionText: "NotMeter 통계 홈페이지는 회원가입이나 직접적인 개인정보 입력을 요구하지 않습니다. 서비스 운영 과정에서 접속 기록, 브라우저 및 기기 정보, 쿠키와 유사한 식별자가 자동으로 처리될 수 있습니다.",
      adsenseText: "이 사이트는 광고 제공과 성과 측정을 위해 Google AdSense를 사용합니다. Google과 광고 파트너는 쿠키를 사용하여 사용자의 이전 방문 기록을 바탕으로 광고를 제공하거나 광고 노출·클릭을 측정할 수 있습니다.",
      adsSettings: "사용자는 Google 광고 설정에서 맞춤 광고 설정을 관리할 수 있습니다.",
      adsPrivacy: "Google의 데이터 처리 방식은 Google 광고 개인정보 보호 안내에서 확인할 수 있습니다.",
      cookieTitle: "쿠키 및 동의",
      cookieText: "법률상 동의가 필요한 지역에서는 Google이 제공하는 동의 관리 기능 또는 인증된 동의 관리 플랫폼을 통해 광고 쿠키 및 개인정보 활용 동의를 요청할 수 있습니다.",
      transferTitle: "외부 전송 및 보관",
      transferText: "광고 제공 과정에서 Google 등 광고 사업자가 정보를 처리하거나 국외 서버로 전송할 수 있으며, 해당 정보는 각 사업자의 정책과 법적 보관 기간에 따라 관리됩니다.",
      changesTitle: "문의 및 변경",
      changesText: "본 방침은 서비스 또는 광고 정책 변경에 따라 수정될 수 있으며, 변경된 내용은 이 페이지에 게시합니다.",
      effectiveDate: "시행일: 2026년 8월 1일",
      back: "← NotMeter 통계로 돌아가기",
    },
    en: {
      title: "Privacy Policy",
      collectionTitle: "Information We Process",
      collectionText: "The NotMeter statistics website does not require registration or direct entry of personal information. Access logs, browser and device information, cookies, and similar identifiers may be processed automatically while operating the service.",
      adsenseText: "This site uses Google AdSense to deliver ads and measure performance. Google and its advertising partners may use cookies to provide ads based on prior visits and to measure ad impressions and clicks.",
      adsSettings: "You can manage personalized advertising in Google Ads Settings.",
      adsPrivacy: "See Google's advertising privacy information for details about Google's data processing.",
      cookieTitle: "Cookies and Consent",
      cookieText: "Where consent is required by law, advertising-cookie and personal-data consent may be requested through Google's consent tools or a certified consent management platform.",
      transferTitle: "International Transfer and Retention",
      transferText: "Google and other advertising providers may process information or transfer it to overseas servers. Each provider manages that information under its own policy and legal retention period.",
      changesTitle: "Questions and Changes",
      changesText: "This policy may change with the service or advertising policies. Updates will be posted on this page.",
      effectiveDate: "Effective: August 1, 2026",
      back: "← Back to NotMeter statistics",
    },
    "zh-TW": {
      title: "隱私權政策",
      collectionTitle: "蒐集與使用的資訊",
      collectionText: "NotMeter 統計網站不要求註冊會員或直接輸入個人資料。服務運作期間，可能會自動處理連線紀錄、瀏覽器與裝置資訊、Cookie 及類似識別碼。",
      adsenseText: "本網站使用 Google AdSense 提供廣告並衡量成效。Google 與廣告合作夥伴可能使用 Cookie，依過往造訪紀錄提供廣告，並衡量廣告曝光與點擊。",
      adsSettings: "您可以在 Google 廣告設定中管理個人化廣告。",
      adsPrivacy: "Google 的資料處理方式請參閱 Google 廣告隱私權說明。",
      cookieTitle: "Cookie 與同意",
      cookieText: "在法律要求取得同意的地區，可能會透過 Google 提供的同意管理功能或經認證的同意管理平台，請求廣告 Cookie 與個人資料使用同意。",
      transferTitle: "境外傳輸與保存",
      transferText: "提供廣告的過程中，Google 等廣告業者可能會處理資訊或將資訊傳送至境外伺服器，並依各業者的政策與法定保存期間管理。",
      changesTitle: "聯絡與變更",
      changesText: "本政策可能因服務或廣告政策變更而修訂，更新內容將公布於本頁。",
      effectiveDate: "生效日期：2026 年 8 月 1 日",
      back: "← 返回 NotMeter 統計",
    },
  };

  const browser = String(navigator.language || "").toLowerCase();
  let locale = localStorage.getItem("notmeter-stats-locale");
  if (!supported.includes(locale)) {
    locale = browser.startsWith("zh") ? "zh-TW" : browser.startsWith("ko") ? "ko" : "en";
  }
  const button = document.getElementById("privacy-language");

  function render() {
    document.documentElement.lang = locale;
    document.title = `${copy[locale].title} | NotMeter`;
    button.textContent = labels[locale];
    for (const element of document.querySelectorAll("[data-privacy-i18n]")) {
      element.textContent = copy[locale][element.dataset.privacyI18n] ||
        copy.ko[element.dataset.privacyI18n] || "";
    }
  }

  button.addEventListener("click", () => {
    locale = supported[(supported.indexOf(locale) + 1) % supported.length];
    localStorage.setItem("notmeter-stats-locale", locale);
    render();
  });
  render();
})();
