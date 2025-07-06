// File: js/undangan.js
// Deskripsi: Script untuk mengelola undangan pernikahan digital
  function enterFullscreen(el = document.documentElement) {
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen(); // Firefox
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen(); // Safari/Chrome
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen(); // IE/Edge
    } else {
      console.warn("Fullscreen API tidak didukung di browser ini.");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const tombol = document.getElementById("startToExplore");
    if (tombol) {
      tombol.addEventListener("click", function () {
        enterFullscreen();
      });
    } else {
      console.warn('Elemen dengan id="startToExplore" tidak ditemukan.');
    }
  });
