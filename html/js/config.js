/*
	NEVERA LOADSCREEN - CONFIG
	Edit the values below to match your server.
*/
window.NEVERA_CONFIG = {

	serverName: {
		main: "Server Name",
		sub: "Roleplay"
	},

	tagline: "An outlaw's welcome to the frontier",

	description: "A RedM roleplay server built on custom scripts, hand-placed towns and " +
		"an economy that doesn't forgive a bad hand. Saddle up.",

	hintText: "Keep your gun holstered in towns to avoid unnecessary trouble.",

	// HLS (.m3u8) streams used as the background video. You can add multiple and cycle through them.
	videoSources: [
		"https://rumble.com/hls-vod/7aq5mo/playlist.m3u8",
		"https://rumble.com/hls-vod/7aq5mo/playlist.m3u8"
	
	],

	// Muted autoplay is required by browser/CEF policy. Player can unmute via the control dock.
	startMuted: true,
	startVolume: 45,

	socials: {
		discord: "https://discord.gg/yourinvite",
		instagram: "https://instagram.com",
		youtube: "https://youtube.com",
		twitter: "",
		tiktok: "https://tiktok.com",
		facebook: "",
		twitch: "",
		github: "",
		website: "https://valenor.studio"
	},


	// Fake progress speed used ONLY when this page is opened outside the game (for local preview).
	previewMode: {
		enabled: true,
		durationMs: 9000
	}
};