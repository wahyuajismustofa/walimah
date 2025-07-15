// ==================== VARIABEL ====================
const dataPath = "/src/data/preview-tamu.json";
// const dataPath = "/src/data/tamu.json"; // Ganti dengan path data asli
let paramNama = "";
let namaTamu = "";
let dataUndangan = {};
let myAudio = null;


// ==================== INISIALISASI ====================
async function init(){
    try {
    dataUndangan = await getData(dataPath);

    if (Array.isArray(dataUndangan.tamu) && dataUndangan.tamu.length > 0) {
        renderPesan("pesan", dataUndangan.tamu);
    }
    } catch (error) {
        console.error("Gagal mengambil data JSON:", error);
    }
    setupSmoothScroll(".link", start);
    scrollToTop();    
}


// ==================== PARAMS ====================
  function getParams(name) {
    const url = window.location.href;
    name = name.replace(/[[]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    const results = regex.exec(url);
    if (!results || !results[2]) return null;
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
  paramNama = getParams("to");
    if (paramNama) {
    namaTamu = paramNama.replace(/[-_]/g, " ");
  }
    document.querySelectorAll(".e-nama").forEach(el => {
    el.textContent = namaTamu;
  });
function setValueById(Id, value) {
  const data = document.getElementById(Id);
  if (!data) {
    console.warn(`Elemen dengan ID '${Id}' tidak ditemukan.`);
    return;
  }
  data.value = value;
}
function setMultipleValues(data) {
  if (typeof data !== "object") {
    console.warn("setMultipleValues: data tidak valid.");
    return;
  }

  for (const [id, value] of Object.entries(data)) {
    setValueById(id, value);
  }
}


// ==================== DATA ====================
async function getData(dataPath) {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`${dataPath}?t=${timestamp}`);
    if (!response.ok) throw new Error("Gagal mengambil data");
    return await response.json();
  } catch (err) {
    console.error("Error:", err.message);
    return {};
  }
}

// ==================== PESAN ====================
function buatCard(pesan) {
  const card = document.createElement("div");
  card.className = "card p-3 text-center radius-10 card-undangan mt-4";
  card.setAttribute("data-aos", "fade-up");
  card.setAttribute("data-aos-duration", "2000");

  card.innerHTML = `
    <h6 class="mb-0">${pesan.nama}</h6>
    <hr/> ${pesan.pesan}
    <div class="mt-4">${formatTanggalIndonesia(pesan.waktu)}</div>
  `;
  return card;
}

let pesanDataGlobal = [];
let pesanIndex = 0;
const pesanPerPage = 4; // Jumlah pesan yang ditampilkan per batch

function renderPesan(targetWrapperId = "pesan", data = []) {
  const wrapper = document.getElementById(targetWrapperId);
  if (!wrapper) return console.error(`Elemen dengan ID '${targetWrapperId}' tidak ditemukan.`);

  const container = wrapper.querySelector(".container");
  if (!container) return console.error(".container tidak ditemukan di dalam #" + targetWrapperId);

  const isGrid = container.classList.contains("grid");
  const isFlat = container.classList.contains("flat");

  // Urutkan dari terbaru ke terlama
  pesanDataGlobal = [...data].sort((a, b) => new Date(b.waktu) - new Date(a.waktu));
  pesanIndex = 0;

  // Bersihkan isi
  container.innerHTML = "";

  // Tampilkan batch awal
  tampilkanPesan(container, isGrid, isFlat, wrapper);
}

function tampilkanPesan(container, isGrid, isFlat, wrapper) {
  const nextBatch = pesanDataGlobal.slice(pesanIndex, pesanIndex + pesanPerPage);
  pesanIndex += nextBatch.length;

  if (isGrid) {
    let row = container.querySelector(".row");
    if (!row) {
      row = document.createElement("div");
      row.className = "row justify-content-center";
      container.appendChild(row);
    }

    nextBatch.forEach(p => {
      const col = document.createElement("div");
      col.className = "col-lg-4 col-md-6";
      col.appendChild(buatCard(p));
      row.appendChild(col);
    });

  } else if (isFlat) {
    nextBatch.forEach(p => container.appendChild(buatCard(p)));
  }

  // Tampilkan atau sembunyikan tombol
  let btn = wrapper.querySelector("#btnLihatLebih");

  if (pesanIndex < pesanDataGlobal.length) {
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "btnLihatLebih";
      btn.className = "btn btn-primary d-block mx-auto mt-4";
      btn.textContent = "Tampilkan Lebih Banyak";
      btn.addEventListener("click", () => tampilkanPesan(container, isGrid, isFlat, wrapper));
      wrapper.appendChild(btn);
    } else {
      btn.style.display = "block";
    }
  } else {
    if (btn) btn.remove();
  }
}

// ==================== TANGGAL INDONESIA ====================
function formatTanggalIndonesia(isoString) {
  const tanggal = new Date(isoString);
  const hari = tanggal.toLocaleDateString("id-ID", { weekday: "long" });
  const tanggalStr = tanggal.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  const jamStr = tanggal.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta"
  });

  return `${hari}, ${tanggalStr} pukul ${jamStr} WIB`;
}


// ==================== MUSIC CONTROL ====================
function start() {
  aktifkanFullscreen();
  $(".hidden, .navbar, .button-menu, #musik").css("display", "block");
  $("body").css({ overflow: "auto", height: "auto" });

  const myAudio = document.getElementById("audio");
  if (!myAudio) return;

  // Hanya mainkan jika belum main
  if (myAudio.paused || myAudio.ended) {
    myAudio.play();
  }
}

function updateMuteIcon(isMuted) {
  const muteBtn = document.getElementById("musik");
  if (!muteBtn) return;

  muteBtn.innerHTML = isMuted
    ? '<i class="fas fa-volume-xmark"></i>'
    : '<i class="fas fa-volume-high"></i>';
}


function toggleAudio() {
  const myAudio = document.getElementById("audio");
  if (!myAudio) return;

  if (myAudio.paused || myAudio.ended) {
    playAudio();
  } else {
    pauseAudio();
  }
}


function playAudio() {
  const myAudio = document.getElementById("audio");
  if (!myAudio) return;

  if (myAudio.paused || myAudio.ended) {
    myAudio.play();
  }

  if (myAudio.muted) {
    myAudio.muted = false;
    updateMuteIcon(false);
  }
  // Cek ketersediaan YT dan YT.PlayerState sebelum akses
  if (window.YT && YT.PlayerState && Array.isArray(ytPlayers)) {
    ytPlayers.forEach(player => {
      if (player.getPlayerState && player.getPlayerState() === YT.PlayerState.PLAYING) {
        player.pauseVideo();
      }
    });
  }
}

function pauseAudio() {
  const myAudio = document.getElementById("audio");
  if (!myAudio) return;

  if (!myAudio.paused) {
    myAudio.pause();
  }

  if (!myAudio.muted) {
    myAudio.muted = true;
    updateMuteIcon(true);
  }
}

// ==================== COPY TO CLIPBOARD ====================
 function copy() {
 var isi = $("#myInput1").val();
 var $temp = $("<input>");
 $("body").append($temp);
 $temp.val(isi).select();
 document.execCommand("copy");
 $temp.remove();
 showAlert("Nomor Rekening Tersalin :" + isi, "success");
 }

 // ==================== COUNTDOWN ====================
function initCountdown(targetDate) {
  const countDownDate = new Date(targetDate).getTime();

  const elDays = document.getElementById("days");
  const elHours = document.getElementById("hours");
  const elMinutes = document.getElementById("minutes");
  const elSeconds = document.getElementById("seconds");
  const elText = document.getElementById("hitung-mundur");

  const hasGrid = elDays && elHours && elMinutes && elSeconds;
  const hasText = elText;

  if (!hasGrid && !hasText) {
    console.warn("Tidak ada elemen countdown yang ditemukan.");
    return;
  }

  const interval = setInterval(() => {
    const now = new Date().getTime();
    const distance = countDownDate - now;

    if (distance < 0) {
      clearInterval(interval);

      if (hasGrid) {
        elDays.innerHTML = `<div class="angka">0</div><div class="label">Hari</div>`;
        elHours.innerHTML = `<div class="angka">0</div><div class="label">Jam</div>`;
        elMinutes.innerHTML = `<div class="angka">0</div><div class="label">Menit</div>`;
        elSeconds.innerHTML = `<div class="angka">0</div><div class="label">Detik</div>`;
      }

      if (hasText) {
        elText.innerText = "EXPIRED";
      }

      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (hasGrid) {
      elDays.innerHTML = `<div class="angka">${days}</div><div class="label">Hari</div>`;
      elHours.innerHTML = `<div class="angka">${hours}</div><div class="label">Jam</div>`;
      elMinutes.innerHTML = `<div class="angka">${minutes}</div><div class="label">Menit</div>`;
      elSeconds.innerHTML = `<div class="angka">${seconds}</div><div class="label">Detik</div>`;
    }

    if (hasText) {
      elText.innerText = `${days}h ${hours}j ${minutes}m ${seconds}s`;
    }
  }, 1000);
}


// ==================== FULLSCREEN API ====================
function aktifkanFullscreen(elem = document.documentElement) {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen(); // Safari
  } else if (elem.mozRequestFullScreen) {
    elem.mozRequestFullScreen();    // Firefox
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();     // IE/Edge
  } else {
    console.warn("Fullscreen API tidak didukung di browser ini.");
  }
}

// ==================== SMOOTH SCROLL ====================
function setupSmoothScroll(selector, musicCallback) {
  document.querySelectorAll(selector).forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      const target = document.querySelector(href);

      if (typeof musicCallback === "function") musicCallback();

      if (target) {
        e.preventDefault();
        window.scrollTo({
          top: target.offsetTop,
          behavior: "smooth",
        });
      }
    });
  });
}
// ==================== ALERT HANDLER ====================
function showAlert(pesan, status) {
  let alertBox = document.getElementById("alert");
  
  if (!alertBox) {
    alertBox = document.createElement("div");
    alertBox.id = "alert";
    alertBox.className = `alert ${status}`;

    alertBox.innerHTML = `
      <div class="alert-text"></div>
      <button class="alert-close" aria-label="Tutup">&times;</button>
    `;
    
    document.body.appendChild(alertBox);
  }

  const alertText = alertBox.querySelector(".alert-text");
  const alertClose = alertBox.querySelector(".alert-close");
  
  alertBox.className = `alert show ${status}`;
  alertText.textContent = pesan;
  
  if (alertBox._timeoutId) clearTimeout(alertBox._timeoutId);
  
  alertBox._timeoutId = setTimeout(() => {
    closeAlert();
  }, 5000);
  
  alertClose.onclick = () => {
    closeAlert();
  };
}

function closeAlert() {
  const alertBox = document.getElementById("alert");
  alertBox.className = "alert hide";
  if (alertBox._timeoutId) {
    clearTimeout(alertBox._timeoutId);
    alertBox._timeoutId = null;
  }
}

// ==================== CUSTOM YOUTUBE EMBED ====================
  let ytPlayers = [];

  function onYouTubeIframeAPIReady() {
    document.querySelectorAll('.video-wrapper').forEach((wrapper, index) => {
      const videoId = wrapper.dataset.videoId;
      const container = wrapper.querySelector('.youtube-container');
      const thumbnail = wrapper.querySelector('.custom-thumbnail');

      const player = new YT.Player(container, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          rel: 0,
          modestbranding: 1
        },
        events: {
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.ENDED || event.data === YT.PlayerState.PAUSED) {
              thumbnail.style.display = 'flex';
              playAudio();
            } else if (event.data === YT.PlayerState.PLAYING) {
              thumbnail.style.display = 'none';
              pauseAudio();
            }
          }
        }
      });

      ytPlayers.push(player);

      thumbnail.addEventListener('click', () => {
        player.playVideo();
      });
    });
  }

// ==================== SCROLL TO TOP ====================
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  history.replaceState(null, null, window.location.pathname + window.location.search);
}



document.addEventListener("DOMContentLoaded", function () {
  init();
});