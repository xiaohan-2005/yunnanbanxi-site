// ===== Header + Progress（加了判空，避免报错） =====
const header = document.getElementById("header");
const topProgress = document.getElementById("topProgress");

const onScroll = () => {
  if (header) {
    if (window.scrollY > 10) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }

  // 顶部阅读进度条是可选的：没有就跳过
  if (topProgress) {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const p = max > 0 ? (window.scrollY / max) * 100 : 0;
    topProgress.style.width = `${p}%`;
  }
};
window.addEventListener("scroll", onScroll);
onScroll();

// ===== Mobile nav =====
const burger = document.getElementById("burger");
const mnav = document.getElementById("mnav");

function closeMobileNav() {
  if (!burger || !mnav) return;
  burger.classList.remove("is-open");
  burger.setAttribute("aria-expanded", "false");
  mnav.classList.remove("is-open");
  mnav.setAttribute("aria-hidden", "true");
}

if (burger && mnav) {
  burger.addEventListener("click", () => {
    const opened = burger.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(opened));
    mnav.classList.toggle("is-open", opened);
    mnav.setAttribute("aria-hidden", String(!opened));
  });

  mnav.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.classList.contains("mnav__link")) closeMobileNav();
  });
}

// ===== Reveal =====
const revealEls = document.querySelectorAll(".reveal");
if (revealEls.length) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((ent) => {
        if (ent.isIntersecting) {
          ent.target.classList.add("is-visible");
          io.unobserve(ent.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));
}

// ===== Lightbox =====
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbClose = document.getElementById("lbClose");

function openLightbox(src, alt) {
  if (!lightbox || !lbImg) return;
  lbImg.src = src;
  lbImg.alt = alt || "";
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.documentElement.style.overflow = "hidden";
}
function closeLightbox() {
  if (!lightbox || !lbImg) return;
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  lbImg.src = "";
  document.documentElement.style.overflow = "";
}

if (lbClose) lbClose.addEventListener("click", closeLightbox);
if (lightbox) {
  lightbox.addEventListener("click", (e) => {
    if (e.target && e.target.dataset && e.target.dataset.close) closeLightbox();
  });
}
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightbox && lightbox.classList.contains("is-open")) closeLightbox();
});

document.querySelectorAll(".js-lightbox").forEach((box) => {
  box.addEventListener("click", () => {
    const large = box.getAttribute("data-large");
    const img = box.querySelector("img");
    if (!img) return;
    openLightbox(large || img.src, img.alt);
  });
});

// ===== Gallery filter + click open =====
const chips = document.querySelectorAll(".chip");
const mCards = document.querySelectorAll(".js-card");

function setFilter(filter) {
  chips.forEach(c => c.classList.toggle("is-active", c.dataset.filter === filter));
  mCards.forEach((card) => {
    const cat = card.dataset.cat;
    const show = (filter === "all") || (cat === filter);
    card.classList.toggle("is-hidden", !show);
  });
}

chips.forEach((chip) => {
  chip.addEventListener("click", () => setFilter(chip.dataset.filter));
});

mCards.forEach((card) => {
  card.addEventListener("click", () => {
    const large = card.getAttribute("data-large");
    const img = card.querySelector("img");
    if (!img) return;
    openLightbox(large || img.src, img.alt);
  });

  // 轻微 tilt：只在桌面端启用
  let raf = null;
  card.addEventListener("mousemove", (e) => {
    if (window.matchMedia("(max-width: 980px)").matches) return;
    const r = card.getBoundingClientRect();
    const cx = e.clientX - r.left;
    const cy = e.clientY - r.top;
    const dx = (cx / r.width) - 0.5;
    const dy = (cy / r.height) - 0.5;

    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      card.style.transform = `translateY(-6px) rotateX(${(-dy * 4).toFixed(2)}deg) rotateY(${(dx * 6).toFixed(2)}deg)`;
    });
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

// ===== Featured / Hero buttons jump to gallery with filter =====
function jumpToGalleryWithFilter(filter) {
  const gallery = document.getElementById("gallery");
  if (!gallery) return;
  gallery.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => setFilter(filter), 350);
}

document.querySelectorAll(".js-jump-filter").forEach((btn) => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter || "all";
    jumpToGalleryWithFilter(filter);
  });
});

// ===== Hero slider + Progress Bar =====
const slider = document.getElementById("heroSlider");
const slides = slider ? Array.from(slider.querySelectorAll(".heroSlide")) : [];
const dots = Array.from(document.querySelectorAll(".heroDot"));
const prevBtn = document.getElementById("heroPrev");
const nextBtn = document.getElementById("heroNext");

// 轮播进度条（你在 index.html 加的那个）
const heroProgressBar = document.getElementById("heroProgressBar");
const slideDuration = 6500;

let idx = 0;
let timer = null;

function animateHeroBar() {
  if (!heroProgressBar) return;
  heroProgressBar.style.transition = "none";
  heroProgressBar.style.width = "0%";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      heroProgressBar.style.transition = `width ${slideDuration}ms linear`;
      heroProgressBar.style.width = "100%";
    });
  });
}

function applySlideBackgrounds() {
  // 如果你 Hero 已经改成 style="background-image:..."，这段也不会冲突
  slides.forEach((s) => {
    const bg = s.getAttribute("data-bg");
    if (bg) s.style.backgroundImage = `url('${bg}')`;
  });

  // featured tiles background
  document.querySelectorAll(".featureTile").forEach((t) => {
    const bg = t.getAttribute("data-bg");
    if (!bg) return;
    t.style.setProperty(
      "background-image",
      `linear-gradient(135deg, rgba(255,255,255,0.02), rgba(0,0,0,0.12)), url('${bg}')`
    );
    t.style.backgroundSize = "cover";
    t.style.backgroundPosition = "center";
  });
}
applySlideBackgrounds();

function setSlide(n) {
  idx = (n + slides.length) % slides.length;
  slides.forEach((s, i) => s.classList.toggle("is-active", i === idx));
  dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
  animateHeroBar(); // 每次切图重置进度条
}

function next() { setSlide(idx + 1); }
function prev() { setSlide(idx - 1); }

function startAuto() {
  stopAuto();
  timer = setInterval(next, slideDuration);
  animateHeroBar();
}
function stopAuto() {
  if (timer) clearInterval(timer);
  timer = null;
}

if (slides.length) {
  setSlide(0);
  startAuto();

  dots.forEach((d) =>
    d.addEventListener("click", () => {
      setSlide(Number(d.dataset.slide));
      startAuto();
    })
  );

  if (nextBtn) nextBtn.addEventListener("click", () => { next(); startAuto(); });
  if (prevBtn) prevBtn.addEventListener("click", () => { prev(); startAuto(); });

  // 用户切到别的标签页时暂停
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAuto();
    else startAuto();
  });
}
// ===== 背景音乐：首次提示 + 记住用户选择 =====
(() => {
  const bgm = document.getElementById("bgm");
  const musicBtn = document.getElementById("musicBtn");

  const toast = document.getElementById("musicToast");
  const btnEnable = document.getElementById("musicEnable");
  const btnDismiss = document.getElementById("musicDismiss");

  if (!bgm || !musicBtn) return;

  const KEY = "bansi_music_pref"; // "on" | "off"
  const getPref = () => localStorage.getItem(KEY);
  const setPref = (v) => localStorage.setItem(KEY, v);

  const setUI = (playing) => {
    musicBtn.classList.toggle("is-playing", playing);
    musicBtn.setAttribute("aria-label", playing ? "暂停背景音乐" : "播放背景音乐");
    musicBtn.textContent = playing ? "♫" : "♪";
  };

  async function playMusic() {
    try {
      bgm.volume = 0.28; // 你可以改：0~1
      await bgm.play();
      setUI(true);
      setPref("on");
    } catch (e) {
      // 某些情况下仍可能被拦截：让用户再点一次即可
      console.log("播放被浏览器拦截，请再点击一次：", e);
    }
  }

  function pauseMusic() {
    bgm.pause();
    setUI(false);
    setPref("off");
  }

  // 右下角按钮：随时开关
  musicBtn.addEventListener("click", async () => {
    if (bgm.paused) await playMusic();
    else pauseMusic();
  });

  // 首次提示条
  function openToast() {
    if (!toast) return;
    toast.classList.add("is-open");
    toast.setAttribute("aria-hidden", "false");
  }
  function closeToast() {
    if (!toast) return;
    toast.classList.remove("is-open");
    toast.setAttribute("aria-hidden", "true");
  }

  if (btnEnable) btnEnable.addEventListener("click", async () => {
    closeToast();
    await playMusic();
  });

  if (btnDismiss) btnDismiss.addEventListener("click", () => {
    closeToast();
    setPref("off"); // 记住“暂不”
  });

  // 首次进入：如果没有记录，弹提示
  const pref = getPref();
  if (!pref) {
    setUI(false);
    // 1.2秒后出现更高级（不打扰）
    setTimeout(openToast, 1200);
  } else if (pref === "on") {
    // 有些浏览器仍需要交互才能播放：我们不强播
    // 但可以把按钮状态标为“可播放”
    setUI(false);
  } else {
    setUI(false);
  }

  // 切到后台自动暂停（体验更像品牌站）
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && !bgm.paused) pauseMusic();
  });
})();
// ===== 兜底：首次任意点击页面就播放一次（只触发一次）=====
(() => {
  const bgm = document.getElementById("bgm");
  if (!bgm) return;

  let started = false;

  const tryStart = async () => {
    if (started) return;
    started = true;
    try {
      bgm.volume = 0.28;
      await bgm.play();
      // 如果你有按钮 UI，就同步一下（可选）
      const musicBtn = document.getElementById("musicBtn");
      if (musicBtn) {
        musicBtn.classList.add("is-playing");
        musicBtn.textContent = "♫";
        musicBtn.setAttribute("aria-label", "暂停背景音乐");
      }
      localStorage.setItem("bansi_music_pref", "on");
    } catch (e) {
      // 某些浏览器需要第二次点击，这里不报错打扰用户
      started = false;
    }
  };

  // 用 pointerdown 比 click 更稳（手机也好）
  window.addEventListener("pointerdown", tryStart, { once: true });
})();
// ===== 强制绑定音乐按钮（如果你之前音乐代码没执行，这段也能救活）=====
(() => {
  const bgm = document.getElementById("bgm");
  const btn = document.getElementById("musicBtn");

  console.log("music init:", { hasBgm: !!bgm, hasBtn: !!btn });

  if (!bgm || !btn) return;

  btn.addEventListener("click", async () => {
    console.log("musicBtn clicked. paused =", bgm.paused);

    try {
      bgm.muted = false;
      bgm.volume = 0.28;

      if (bgm.paused) {
        bgm.load();
        await bgm.play();
        btn.classList.add("is-playing");
        btn.textContent = "♫";
      } else {
        bgm.pause();
        btn.classList.remove("is-playing");
        btn.textContent = "♪";
      }
    } catch (e) {
      console.log("play failed:", e);
      alert("浏览器阻止了播放，请再点一次按钮（或换 Chrome/Edge）");
    }
  });

  console.log("music listener attached!");
})();


/* ===== Process Carousel (scroll-snap + buttons + dots) ===== */
function initCarousel(root) {
  if (!root) return;
  const track = root.querySelector(".carTrack");
  const prevBtn = root.querySelector(".carBtn--prev");
  const nextBtn = root.querySelector(".carBtn--next");
  const slides = Array.from(root.querySelectorAll(".carSlide"));
  const dotsWrap = root.querySelector(".carDots");

  if (!track || slides.length === 0 || !dotsWrap) return;

  // Build dots
  dotsWrap.innerHTML = "";
  const dots = slides.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "carDot";
    b.setAttribute("aria-label", `第 ${i + 1} 张`);
    b.setAttribute("aria-current", "false");
    b.addEventListener("click", () => scrollToIndex(i));
    dotsWrap.appendChild(b);
    return b;
  });

  function scrollToIndex(i) {
    const clamped = Math.max(0, Math.min(slides.length - 1, i));
    const target = slides[clamped];
    // scroll so that target is centered (approx)
    const left = target.offsetLeft - (track.clientWidth - target.clientWidth) / 2;
    track.scrollTo({ left, behavior: "smooth" });
  }

  function setActive(idx) {
    slides.forEach((s, i) => {
      s.classList.toggle("is-active", i === idx);
      s.classList.toggle("is-near", Math.abs(i - idx) === 1);
    });
    dots.forEach((d, i) => d.setAttribute("aria-current", i === idx ? "true" : "false"));
  }

  // Observe which slide is mostly visible inside the track
  let activeIndex = 0;
  const io = new IntersectionObserver(
    (entries) => {
      // pick the entry with the highest intersection ratio
      let best = null;
      for (const e of entries) {
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
      }
      if (best && best.isIntersecting) {
        const idx = slides.indexOf(best.target);
        if (idx >= 0 && idx !== activeIndex) {
          activeIndex = idx;
          setActive(activeIndex);
        }
      }
    },
    { root: track, threshold: [0.55, 0.65, 0.75] }
  );
  slides.forEach((s) => io.observe(s));

  // Buttons
  if (prevBtn) prevBtn.addEventListener("click", () => scrollToIndex(activeIndex - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => scrollToIndex(activeIndex + 1));

  // Keyboard (track focused)
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollToIndex(activeIndex - 1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollToIndex(activeIndex + 1);
    }
  });

  // Init state
  setActive(0);
  // Ensure first slide is centered if track has padding / layout shifts
  requestAnimationFrame(() => scrollToIndex(0));
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".carousel").forEach(initCarousel);
});
