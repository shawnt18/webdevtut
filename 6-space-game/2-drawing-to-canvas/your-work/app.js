function loadTexture(path) {
	return new Promise((resolve) => {
		const img = new Image();
		img.src = path;
		img.onload = () => {
			resolve(img);
		};
	});
}

function createEnemies(ctx, canvas, enemyImg) {
	// TODO draw enemies
}

window.onload = async () => {
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');

	// load textures
	const playerImg = await loadTexture('assets/player.png');
	const enemmyImg = await loadTexture('assets/enemyShip.png');

	// draw black background
	ctx.fillStyle = 'black';
	ctx.fillRect(0,0, 1024, 768); // x,y,width,height

	// draw hero
	

	// TODO uncomment the next line when you add enemies to screen
	//createEnemies(ctx, canvas, enemyImg);
};
