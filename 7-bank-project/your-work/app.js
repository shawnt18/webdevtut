const routes = {
	'/login': { templateId: 'login' },
	'/dashboard': { templateId: 'dashboard' },
};

function navigate(path) {
	window.history.pushState({}, path, window.location.origin + path);
	updateRoute();
}

function updateRoute() {
	const path = window.location.pathname;
	console.log(path);
	const route = routes[path];

	if (!route) {
		return navigate('/login');
	}	

	const template = document.getElementById(route.templateId);
	const view = template.content.cloneNode(true);
	const app = document.getElementById('app');
	app.innerHTML = '';
	app.appendChild(view);
}

