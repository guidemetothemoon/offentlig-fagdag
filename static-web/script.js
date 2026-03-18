const { animate, createAnimatable, stagger, svg } = anime;

// === Mobile nav toggle ===

const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('header nav');

if (navToggle && nav) {
	navToggle.addEventListener('click', () => {
		const open = nav.classList.toggle('open');
		navToggle.setAttribute('aria-expanded', open);
		navToggle.textContent = open ? '\u2715' : '\u2630';
	});
}

// === Logo draw animation ===

const logoStroke = document.querySelector('.off-logo-stroke');
const logoFill = document.querySelector('.off-logo-fill');

if (logoStroke) {
	const drawable = svg.createDrawable(logoStroke);

	animate(drawable, {
		draw: ['0 0', '0 1'],
		ease: 'inOutQuad',
		duration: 1200,
		onComplete: () => {
			animate(logoFill, {
				opacity: [0, 1],
				duration: 400,
				easing: 'easeOutCubic',
			});
		},
	});
}

// === Program tabs ===

document.querySelectorAll('.program-tablist [role="tab"]').forEach((tab) => {
	tab.addEventListener('click', () => {
		const tablist = tab.closest('[role="tablist"]');
		const container = tab.closest('.ds-tabs');

		tablist.querySelectorAll('[role="tab"]').forEach((t) => {
			t.setAttribute('aria-selected', 'false');
		});
		tab.setAttribute('aria-selected', 'true');

		container.querySelectorAll('[role="tabpanel"]').forEach((panel) => {
			panel.hidden = panel.dataset.panel !== tab.dataset.tab;
		});
	});
});

// === Action card icon hover ===

document.querySelectorAll('.action-card').forEach((card) => {
	const icon = card.querySelector('.action-icon');
	if (!icon) return;

	const anim = createAnimatable(icon, {
		translateX: 400,
		translateY: 400,
		rotate: 400,
		ease: 'out(3)',
	});

	card.addEventListener('mouseenter', () => {
		anim.translateX(4);
		anim.translateY(-6);
		anim.rotate(8);
	});

	card.addEventListener('mouseleave', () => {
		anim.translateX(0);
		anim.translateY(0);
		anim.rotate(0);
	});
});

// === Question mark hover on manserpaakart icon ===

document.querySelectorAll('icon-manserpaakart').forEach((icon) => {
	const observer = new MutationObserver(() => {
		const questionMark = icon.querySelector('.question-mark');
		if (!questionMark) return;
		observer.disconnect();

		const anim = createAnimatable(questionMark, {
			translateY: 400,
			ease: 'out(3)',
		});

		icon.addEventListener('mouseenter', () => anim.translateY(-20));
		icon.addEventListener('mouseleave', () => anim.translateY(0));
	});
	observer.observe(icon, { childList: true, subtree: true });
});

// === Open Space floating faces ===

// Gentle idle floating animations
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

// Interactive parallax — faces drift away from cursor
const cloud = document.querySelector('.openspace-cloud');

if (cloud) {
	const face1 = createAnimatable('.face-1', {
		translateX: 800,
		translateY: 800,
		ease: 'out(3)',
	});

	const face2 = createAnimatable('.face-2', {
		translateX: 600,
		translateY: 600,
		ease: 'out(3)',
	});

	const face3 = createAnimatable('.face-3', {
		translateX: 700,
		translateY: 700,
		ease: 'out(3)',
	});

	const center = createAnimatable('.openspace-cloud-center', {
		translateX: 1000,
		translateY: 1000,
		ease: 'out(3)',
	});

	cloud.addEventListener('mousemove', (e) => {
		const rect = cloud.getBoundingClientRect();
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;
		const dx = e.clientX - cx;
		const dy = e.clientY - cy;

		face1.translateX(dx * 0.15);
		face1.translateY(dy * 0.15);

		face2.translateX(dx * -0.1);
		face2.translateY(dy * -0.1);

		face3.translateX(dx * 0.2);
		face3.translateY(dy * 0.2);

		center.translateX(dx * 0.04);
		center.translateY(dy * 0.04);
	});

	cloud.addEventListener('mouseleave', () => {
		face1.translateX(0);
		face1.translateY(0);
		face2.translateX(0);
		face2.translateY(0);
		face3.translateX(0);
		face3.translateY(0);
		center.translateX(0);
		center.translateY(0);
	});
}
