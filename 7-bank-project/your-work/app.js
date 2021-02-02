let account = null;

function updateElement(id, text) {
	const element = document.getElementById(id);
	element.textContent = text;
}


// LOGIN
async function login() {
	const loginForm = document.getElementById('loginForm');
	const user = loginForm.user.value;
	const data = await getAccount(user);

	if (data.error) {
		return updateElement('loginError', data.error);
	}

	account = data;
	navigate('/dashboard');
}

async function getAccount(user) {
	try {
		const response = await fetch('//localhost:5000/api/accounts/' + encodeURIComponent(user));
		return await response.json();
	} catch (error) {
		return { error: error.message || 'Unknown error' }
	}
}

// REGISTRATION
async function register() {
	const registerForm = document.getElementById('registerForm');
	const formData = new FormData(registerForm);
	const data = Object.fromEntries(formData);
	const jsonData = JSON.stringify(data);
	const result = await createAccount(jsonData);

	if (result.error) {
		return updateElement('registerError', result.error);
	}

	console.log('Account created!', result);
	account = result;
	navigate('/dashboard');
}

async function createAccount(account) {
	try {
		const response = await fetch('//localhost:5000/api/accounts', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: account
	});
	return await response.json();
	} catch (error) {
		return { error: error.message || 'Unknown error' };
	}
}

// DASHBOARD
function updateDashboard() {
	if (!account) {
		return navigate('login');
	}
	updateElement('description', account.description);
	updateElement('balance', account.balance.toFixed(2));
	updateElement('currency', account.currency);
}

// ROUTING
const routes = {
	'/login': { templateId: 'login' },
	'/dashboard': { templateId: 'dashboard', init: updateDashboard },
};

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

	if (typeof route.init === 'function') {
		route.init();
	}
}

function navigate(path) {
	window.history.pushState({}, path, window.location.origin + path);
	updateRoute();
}

function onLinkClick(event) {
  event.preventDefault();
  navigate(event.target.href);
}

window.onpopstate = () => updateRoute();
updateRoute();