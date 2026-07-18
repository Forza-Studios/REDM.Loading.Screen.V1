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

	function startPlayback(src) {
		if (!src) return;

		if (video.canPlayType("application/vnd.apple.mpegurl")) {
			video.src = src;
		} else if (window.Hls && window.Hls.isSupported()) {
			const hls = new Hls({ maxBufferLength: 30 });
			hls.loadSource(src);
			hls.attachMedia(video);
			hls.on(Hls.Events.ERROR, (event, data) => {
				if (data.fatal) console.warn("[Nevera] HLS fatal error:", data.type, data.details);
			});
		}

		video.play().catch(() => {
			video.muted = true;
			updatePauseIcon();
			video.play().catch(() => {});
		});
	}

	startPlayback(cfg.videoSource);

	/* =========================================================
	   3. Controls
	   ========================================================= */

	const btnPause = document.getElementById("btn-pause");
	const btnMusic = document.getElementById("btn-music");
	const btnEye = document.getElementById("btn-eye");
	const btnCloseAll = document.getElementById("btn-close");
	const musicPlayer = document.querySelector(".music-player");
	const layoutContainer = document.querySelector(".layout-container");

	function updatePauseIcon() {
		btnPause.innerHTML = video.paused
			? '<i class="bi bi-play-fill"></i>'
			: '<i class="bi bi-pause-fill"></i>';
	}

	if (btnPause) {
		btnPause.addEventListener("click", () => {
			if (video.paused) video.play(); else video.pause();
			updatePauseIcon();
		});
	}

	if (btnMusic) {
		btnMusic.addEventListener("click", () => {
			if (musicPlayer) {
				musicPlayer.style.display = musicPlayer.style.display === "none" ? "flex" : "none";
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
	const lines = cfg.telegraphLines?.length ? cfg.telegraphLines : ["LOADING..."];
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