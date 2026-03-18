const { animate } = anime;

animate('.face-1', {
	translateY: [0, -12, 0],
	translateX: [0, 6, 0],
	rotate: [0, 3, 0],
	duration: 5000,
	easing: 'easeInOutSine',
	loop: true,
});

animate('.face-2', {
	translateY: [0, 8, 0],
	translateX: [0, -10, 0],
	rotate: [0, -4, 0],
	duration: 6000,
	easing: 'easeInOutSine',
	loop: true,
});

animate('.face-3', {
	translateY: [0, 10, 0],
	translateX: [0, 8, 0],
	rotate: [0, 5, 0],
	duration: 7000,
	easing: 'easeInOutSine',
	loop: true,
});

animate('.openspace-cloud-center', {
	scale: [1, 1.03, 1],
	duration: 8000,
	easing: 'easeInOutSine',
	loop: true,
});
