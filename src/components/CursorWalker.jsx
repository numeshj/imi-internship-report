import React from 'react';
import './CursorWalker.css';

// Minimal directional arrow cursor with glow tail & click pulse
const CursorWalker = () => {
	const wrap = React.useRef(null);
	const arrow = React.useRef(null);
	const tail = React.useRef(null);
	const target = React.useRef({ x: innerWidth/2, y: innerHeight/2 });
	const pos = React.useRef({ x: innerWidth/2, y: innerHeight/2 });
	const vel = React.useRef({ x:0, y:0 });
	const idleTimer = React.useRef(null);
	const [idle, setIdle] = React.useState(true);
	const [clicking, setClicking] = React.useState(false);

	React.useEffect(()=>{
		const move = e => {
			target.current.x = e.clientX; target.current.y = e.clientY;
			if (idle) setIdle(false);
			clearTimeout(idleTimer.current);
			idleTimer.current = setTimeout(()=> setIdle(true), 600);
		};
		const down = () => { setClicking(true); spawnPulse(); };
		const up = () => setClicking(false);
		window.addEventListener('pointermove', move, { passive:true });
		window.addEventListener('pointerdown', down);
		window.addEventListener('pointerup', up);
		return ()=> {
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerdown', down);
			window.removeEventListener('pointerup', up);
		};
	}, [idle]);

	const spawnPulse = () => {
		const p = document.createElement('div');
		p.className = 'arrow-click-pulse';
		p.style.left = pos.current.x + 'px';
		p.style.top = pos.current.y + 'px';
		document.body.appendChild(p);
		setTimeout(()=> p.remove(), 500);
	};

	React.useEffect(()=>{
		let raf;
		const loop = () => {
			pos.current.x += (target.current.x - pos.current.x) * 0.25;
			pos.current.y += (target.current.y - pos.current.y) * 0.25;
			vel.current.x += ((target.current.x - pos.current.x) - vel.current.x) * 0.18;
			vel.current.y += ((target.current.y - pos.current.y) - vel.current.y) * 0.18;
			const sp = Math.hypot(vel.current.x, vel.current.y);
			if (wrap.current) wrap.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
					const ang = Math.atan2(vel.current.y, vel.current.x) * 180/Math.PI;
					// Arrow shape points left originally, so rotate 180deg to face movement
					if (arrow.current) arrow.current.style.transform = `translate(-50%, -50%) rotate(${ang+180}deg)`;
					if (tail.current) {
						tail.current.style.opacity = sp > 0.4 ? '1' : '0';
						// Tail should extend behind arrow, so rotate opposite of arrow head
						tail.current.style.transform = `translate(-50%, -50%) rotate(${ang}deg)`;
				const len = Math.min(140, 40 + sp*5);
				tail.current.style.setProperty('--tail-length', len + 'px');
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return ()=> cancelAnimationFrame(raf);
	}, []);

	return (
		<div className="cursor-arrow-wrapper" aria-hidden="true">
			<div ref={wrap} className={`cursor-arrow ${idle? 'idle':'active'} ${clicking? 'clicking':''}`}>
				<div ref={tail} className="arrow-tail">
					<span className="tail-layer tl1" />
					<span className="tail-layer tl2" />
					<span className="tail-layer tl3" />
				</div>
				<svg ref={arrow} className="arrow-svg" width="44" height="44" viewBox="0 0 44 44">
					<polygon points="6,20 28,12 22,18 38,22 22,26 28,32" />
				</svg>
			</div>
		</div>
	);
};

export default CursorWalker;
