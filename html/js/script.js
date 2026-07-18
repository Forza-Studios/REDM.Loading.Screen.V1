(function () {
	"use strict";

	const cfg = window.NEVERA_CONFIG || {};

	/* =========================================================
	   1. Populate content from config
	   ========================================================= */

	const elMain = document.getElementById("server-main");
	if (elMain) elMain.textContent = cfg.serverName?.main ?? "Valenor Studio";
	const elSub = document.getElementById("server-sub");
	if (elSub) elSub.textContent = cfg.serverName?.sub ?? "Roleplay";
	const elHint = document.getElementById("hint-text");
	if (elHint) elHint.textContent = cfg.hintText ?? "Keep your gun holstered in towns to avoid unnecessary trouble.";

	const socialIcons = {
		discord: "bi-discord",
		instagram: "bi-instagram",
		youtube: "bi-youtube",
		twitter: "bi-twitter-x",
		tiktok: "bi-tiktok",
		facebook: "bi-facebook",
		twitch: "bi-twitch",
		github: "bi-github",
		website: "bi-globe"
	};

	const socialRow = document.getElementById("social-row");
	if (socialRow) {
		Object.entries(cfg.socials || {}).forEach(([key, url]) => {
			if (!url) return;
			const li = document.createElement("li");
			const a = document.createElement("a");
			a.href = url;
			a.target = "_blank";
			a.rel = "noopener noreferrer";
			a.innerHTML = `<i class="bi ${socialIcons[key] || "bi-link-45deg"}"></i>`;
			li.appendChild(a);
			socialRow.appendChild(li);
		});
	}

	/* =========================================================
	   2. Background video (HLS via hls.js)
	   ========================================================= */

	const video = document.getElementById("bg-video");
	video.muted = cfg.startMuted !== false;
	video.volume = (cfg.startVolume ?? 45) / 100;

	const videoSources = cfg.videoSources || (cfg.videoSource ? [cfg.videoSource] : []);
	let currentVideoIndex = 0;
	let currentHls = null;

	function loadVideo(index, initial = false) {
		if (videoSources.length === 0) return;
		const src = videoSources[index];
		if (!src) return;

		const playSource = () => {
			if (currentHls) {
				currentHls.destroy();
				currentHls = null;
			}

			if (video.canPlayType("application/vnd.apple.mpegurl")) {
				video.src = src;
			} else if (window.Hls && window.Hls.isSupported()) {
				const hls = new Hls({ maxBufferLength: 30 });
				currentHls = hls;
				hls.loadSource(src);
				hls.attachMedia(video);
				hls.on(Hls.Events.ERROR, (event, data) => {
					if (data.fatal) console.warn("[Nevera] HLS fatal error:", data.type, data.details);
				});
			}

			video.play().then(() => {
				video.style.opacity = 1;
				updatePauseIcon();
			}).catch(() => {
				video.muted = true;
				video.play().then(() => {
					video.style.opacity = 1;
					updatePauseIcon();
				}).catch(() => {});
			});
		};

		if (initial) {
			playSource();
		} else {
			video.style.opacity = 0;
			setTimeout(playSource, 800); // Wait for CSS fade out transition
		}
	}

	if (videoSources.length > 0) {
		loadVideo(currentVideoIndex, true);
	}

	/* =========================================================
	   3. Controls
	   ========================================================= */

	const btnPause = document.getElementById("btn-pause");
	const btnMusic = document.getElementById("btn-music");
	const btnEye = document.getElementById("btn-eye");
	const btnCloseAll = document.getElementById("btn-close");
	const musicControls = document.querySelector(".music-controls");
	const layoutContainer = document.querySelector(".layout-container");

	const btnPrev = document.getElementById("btn-prev");
	const btnNext = document.getElementById("btn-next");
	const volumeSlider = document.getElementById("volume-slider");
	const volumeIcon = document.getElementById("volume-icon");

	// Initialize volume slider with config value
	if (volumeSlider) {
		volumeSlider.value = cfg.startVolume ?? 100;
		
		volumeSlider.addEventListener("input", (e) => {
			const vol = e.target.value;
			video.volume = vol / 100;
			
			// Update icon based on volume level
			if (vol == 0) {
				volumeIcon.className = "bi bi-volume-mute-fill";
			} else if (vol < 50) {
				volumeIcon.className = "bi bi-volume-down-fill";
			} else {
				volumeIcon.className = "bi bi-volume-up-fill";
			}
			
			// Unmute if muted and volume is raised
			if (vol > 0 && video.muted) {
				video.muted = false;
			}
		});
	}

	function updatePauseIcon() {
		if (!btnPause) return;
		btnPause.innerHTML = video.paused
			? '<i class="bi bi-play-fill"></i>'
			: '<i class="bi bi-pause-fill"></i>';
	}

	if (btnPause) {
		btnPause.addEventListener("click", () => {
			if (video.paused) {
				video.play();
			} else {
				video.pause();
			}
			updatePauseIcon();
		});
	}

	if (btnPrev) {
		btnPrev.addEventListener("click", () => {
			if (videoSources.length <= 1) return;
			currentVideoIndex = (currentVideoIndex - 1 + videoSources.length) % videoSources.length;
			loadVideo(currentVideoIndex);
		});
	}

	if (btnNext) {
		btnNext.addEventListener("click", () => {
			if (videoSources.length <= 1) return;
			currentVideoIndex = (currentVideoIndex + 1) % videoSources.length;
			loadVideo(currentVideoIndex);
		});
	}

	if (btnMusic) {
		btnMusic.addEventListener("click", () => {
			if (musicControls) {
				musicControls.style.display = musicControls.style.display === "none" ? "flex" : "none";
			}
			btnMusic.classList.toggle("active");
		});
	}

	if (btnEye) {
		btnEye.addEventListener("click", () => {
			if (layoutContainer) {
				layoutContainer.style.opacity = layoutContainer.style.opacity === "0" ? "1" : "0";
			}
		});
	}
	
	if (btnCloseAll) {
		btnCloseAll.addEventListener("click", () => {
			if (layoutContainer) {
				layoutContainer.style.display = "none";
			}
		});
	}

	updatePauseIcon();

	/* =========================================================
	   4. Telegraph flavor-line rotation
	   ========================================================= */

	const telegraphMsg = document.getElementById("telegraph-msg");
	const lines = cfg.telegraphLines?.length ? cfg.telegraphLines : [""];
	let lineIndex = 0;

	function rotateLine() {
		if (!telegraphMsg) return;
		telegraphMsg.style.opacity = 0;
		setTimeout(() => {
			lineIndex = (lineIndex + 1) % lines.length;
			telegraphMsg.textContent = lines[lineIndex];
			telegraphMsg.style.opacity = 1;
		}, 220);
	}
	
	if (telegraphMsg) {
		telegraphMsg.style.transition = "opacity 0.2s ease";
		telegraphMsg.textContent = lines[0];
		setInterval(rotateLine, cfg.telegraphInterval ?? 2600);
	}

	/* =========================================================
	   5. Progress bar
	   ========================================================= */

	const pulse = document.getElementById("progress-pulse");
	const pctLabel = document.getElementById("progress-pct");
	const horseIcon = document.getElementById("horse-icon");

	function setProgress(fraction) {
		const pct = Math.max(0, Math.min(100, Math.round(fraction * 100)));
		if (pulse) pulse.style.width = `${pct}%`;
		if (pctLabel) pctLabel.textContent = `${pct}%`;
		
		// Move horse icon based on progress track
		if (horseIcon) {
			const trackWidth = document.querySelector('.progress-track').offsetWidth;
			// Calculate offset (subtracting half of horse width so it centers on the edge)
			const offset = (trackWidth * fraction) - 15; 
			horseIcon.style.transform = `translateX(${offset}px)`;
		}
	}

	window.addEventListener("message", (event) => {
		const data = event.data || {};

		if (data.eventName === "loadProgress" && typeof data.loadFraction === "number") {
			setProgress(data.loadFraction);
		}

		if (data.eventName === "onGameCompleteLoad" || data.eventName === "shutdownLoadingScreen") {
			setProgress(1);
			document.body.style.transition = "opacity 0.6s ease";
			document.body.style.opacity = "0";
			setTimeout(() => {
				if (window.invokeNative) {
					window.invokeNative("shutdownLoadingScreenNui");
				}
			}, 650);
		}
	});

	const isInGame = typeof window.invokeNative === "function" || navigator.userAgent.includes("RedM");

	if (!isInGame && cfg.previewMode?.enabled) {
		const duration = cfg.previewMode.durationMs ?? 9000;
		const start = performance.now();

		function tick(now) {
			const elapsed = now - start;
			const fraction = Math.min(1, elapsed / duration);
			setProgress(fraction);
			if (fraction < 1) {
				requestAnimationFrame(tick);
			} else {
				setTimeout(() => setProgress(1), 300);
			}
		}
		requestAnimationFrame(tick);
	}
})();