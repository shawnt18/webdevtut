//////////////////
// GAME OBJECTS //
class GameObject {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.dead = false;
		this.type = "";
		this.width = 0;
		this.height = 0;
		this.img = undefined;
	}

	draw(ctx) {
		ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
	}

	rectFromGameObject() {
		return {
			top: this.y,
			left: this.x,
			bottom: this.y + this.height,
			right: this.x + this.width
		};
	}
}

function intersectRect(r1, r2) {
	return !(
		r2.left > r1.right ||
		r2.right < r1.left ||
		r2.top > r1.bottom ||
		r2.bottom < r1.top
	);
}

class Laser extends GameObject {
	constructor(x, y) {
		super(x, y);
		(this.width = 9), (this.height = 33);
		this.type = 'Laser';
		this.img = laserImg;
		let id = setInterval(() => {
			if (this.y > 0) {
				this.y -= 15;
			} else {
				this.dead = true;
				clearInterval(id);
			}
		}, 100)
	}
}

class Hero extends GameObject {
	constructor(x, y) {
		super(x, y);
		(this.width = 99), (this.height = 75);
		this.type = 'Hero';
		this.speed = { x: 0, y: 0 };
		this.cooldown = 0;
	}
	
	fire() {
		gameObjects.push(new Laser(this.x + 45, this.y - 10));
		this.cooldown = 500;
		let id = setInterval(() => {
			if (this.cooldown > 0) {
				this.cooldown -= 100;
			} else {
				clearInterval(id);
			}
		}, 200);
	}

	canFire() {
		return this.cooldown === 0;
	}
}

class Enemy extends GameObject {
	constructor(x, y) {
		super(x, y);
		(this.width = 98), (this.height = 50);
		this.type = 'Enemy';
		let id = setInterval(() => {
			if (this.y < canvas.height - this.height) {
				this.y += 5;
			} else {
				console.log('Stopped at', this.y);
				clearInterval(id);
			}
		}, 300);
	}
}

////////////
// EVENTS //
class EventEmitter {
	constructor() {
		this.listeners = {};
	}

	on(message, listener) {
		if (!this.listeners[message]) {
			this.listeners[message] = [];
		}
		this.listeners[message].push(listener);
	}

	emit(message, payload = null) {
		if (this.listeners[message]) {
			this.listeners[message].forEach((l) => l(message, payload));
		}
	}
}

const Messages = {
	KEY_EVENT_UP: "KEY_EVENT_UP",
	KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
	KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
	KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
	KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
	COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
	COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
};

// Global objects
let heroImg,
	enemyImg,
	laserImg,
	canvas, 
	ctx,
	gameObjects = [],
	hero,
	eventEmitter = new EventEmitter();

let onKeyDown = function (e) {
	console.log(e.keyCode);
	switch (e.keyCode) {
		case 37:
		case 39:
		case 38:
		case 40: // Arrow keys
		case 32:
			e.preventDefault();
			break; // Space
		default:
			break; // do not block other keys
	  }
};

window.addEventListener("keydown", onKeyDown);

window.addEventListener("keyup", (evt) => {
	if (evt.key === "ArrowUp") {
		eventEmitter.emit(Messages.KEY_EVENT_UP);
	} else if (evt.key === "ArrowDown") {
		eventEmitter.emit(Messages.KEY_EVENT_DOWN);
	} else if (evt.key === "ArrowLeft") {
		eventEmitter.emit(Messages.KEY_EVENT_LEFT);
	} else if (evt.key === "ArrowRight") {
		eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
	} else if (evt.keyCode === 32) {
		eventEmitter.emit(Messages.KEY_EVENT_SPACE);
	}
});

///////////////
// GAME LOOP //
function loadTexture(path) {
	return new Promise((resolve) => {
		const img = new Image();
		img.src = path;
		img.onload = () => {
			resolve(img);
		};
	});
}

function createHero() {
	hero = new Hero(
		canvas.width / 2 - 45,
		canvas.height - canvas.height / 4
	);
	hero.img = heroImg;
	gameObjects.push(hero);
}

function createEnemies() {
	const MONSTER_TOTAL = 5;
	const MONSTER_WIDTH = MONSTER_TOTAL * 98;
	const START_X = (canvas.width - MONSTER_WIDTH) / 2;
	const STOP_X = START_X + MONSTER_WIDTH;

	for (let x = START_X; x < STOP_X; x += 98) {
		for (let y = 0; y < 50 * 5; y += 50) {
			const enemy = new Enemy(x, y);
			enemy.img = enemyImg;
			gameObjects.push(enemy);
		}
	}
};

function initGame() {
	gameObjects = [];
	createHero();
	createEnemies();

	eventEmitter.on(Messages.KEY_EVENT_UP, () => {
		hero.y -= 5;
	});
	eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
		hero.y += 5;
	});
	eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
		hero.x -= 5;
	});
	eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
		hero.x += 5;
	});
	eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
		if (hero.canFire()) {
			hero.fire();
		}
	});
	eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
		first.dead = true;
		second.dead = true;
	});
}

function drawGameObjects(ctx) {
	gameObjects.forEach(go => go.draw(ctx));
}

function updateGameObjects() {
	const enemies = gameObjects.filter(go => go.type === 'Enemy');
	const lasers = gameObjects.filter(go => go.type === 'Laser');
	lasers.forEach((l) => {
		enemies.forEach((m) => {
			if (intersectRect(l.rectFromGameObject(), m.rectFromGameObject())) {
				eventEmitter.emit(
					Messages.COLLISION_ENEMY_LASER, { first: l, second: m }
				);
			}
		});
	});
	gameObjects = gameObjects.filter(go => !go.dead);
}

window.onload = async () => {
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');

	// load textures
	heroImg = await loadTexture('assets/player.png');
	enemyImg = await loadTexture('assets/enemyShip.png');
	laserImg = await loadTexture('assets/laserRed.png');

	initGame();
	let gameLoopId = setInterval(() => {
		ctx.clearRect(0,0, canvas.width, canvas.height); // x,y,width,height
		ctx.fillStyle = 'black';
		ctx.fillRect(0,0, canvas.width, canvas.height);
		updateGameObjects();
		drawGameObjects(ctx);
	}, 100);
};
