/** @type {import('./$types').PageLoad} */
export function load() {
	let currentTime = new Date().getHours();
	let primary = currentTime>7&&currentTime<21 ? "#19a619" : "#cf7f23"
	let hover = currentTime>7&&currentTime<21 ? "#2cb82c" : "#d18a38"
	let active = currentTime>7&&currentTime<21 ? "#098f09" : "#c96e06"
	return {
		primary: primary,
		hover: hover,
		active: active
	};
}
