// [[ Models ]]
class IngredientList {
	constructor(ingredientList = {}) {
		this.ingredientList = ingredientList;
	}

	add(ing) {
		this.ingredientList[ing.name] = {
			amount: parseFloat(ing.amount),
			measurement: ing.measurement,
			serving: parseFloat(ing.serving)
		}
	}

	clear() {
		this.ingredientList = {};
	}

	from(ing) {
		this.clear();
		this.ingredientList = {...ing};
	}
}

class Ingredient {
	constructor(name, amount, measurement, serving) {
		this.name = name || '';
		this.amount = Number(amount) || 0;
		this.measurement = measurement || '';
		this.serving = serving || 1;
	}
}

// [[ Globals ]]
const ingredients = new IngredientList();
const measurements = ['Cup', 'Oz', 'Tbls', 'Tsp'];
let currentServing = 1;

// [[ Elements ]]

// inputs
const ingredientList = document.getElementById('ingredient-list');
const nameInput = document.getElementById('name');
const amountInput = document.getElementById('amount');
const measurementList = document.getElementById('measurement');
const servingInput = document.getElementById('serving');

// idk
const servingSizeInput = document.getElementById('serving-size');
const addIngredientButton = document.getElementById('add-ingredient');

// [[ Utils ]]

function isNull(val) {
	return Object.is(val, null);
}

function isNullOrEmpty(val) {
	if (typeof val === 'string') {
		return isNull(val) || val.length <= 0;
	}

	return !val;
}

function validateInputs() {
	if (!nameInput.value || nameInput.value.length <= 0) {
		alert(`Name must not be empty: ${nameInput.value}`);
		return false;
	}

	if (!amountInput.value || amountInput.value.length <= 0) {
		alert(`Amount must not be empty: ${amountInput.value}`);
		return false;
	}

	if (!measurementList.value || measurementList.value.length <= 0) {
		alert(`Measurement must not be empty: ${measurementList.value}`);
		return false;
	}

	return true;
}

const KEY = 'ssc-ing-list';
function addToCache(obj) {
	localStorage.setItem(KEY, btoa(JSON.stringify(obj)));
}

function getFromCache() {
	const cache = localStorage.getItem(KEY);
	if (isNullOrEmpty(cache)) {
		return '';
	}
	
	return atob(cache);
}

// [[ Rendering ]]

function render() {
	renderMeasurements(measurementList, measurements);
	renderIngredients(ingredientList, ingredients);
}

// just doing a full rerender for now
function renderIngredients(elm, ings) {
	if (isNull(ings) || isNull(elm)) {
		return;
	}

	while (elm.firstChild) {
		elm.removeChild(elm.lastChild);
	}

	for (let name in ings.ingredientList) {
		const { amount, measurement, serving } = ings.ingredientList[name];
		if (isNull(name) || isNull(amount) || isNull(measurement)) {
			return;
		}

		const row = document.createElement('tr');
		const nameCol = document.createElement('td');
		const amountCol = document.createElement('td');
		const measurementCol = document.createElement('td');


		// get current serving size, find fraction for the
		// selected serving size and ingredient's serving size,
		// multiply the amount by the fractions:
		// amount: 3 * (current serving: 1 / ingredient serving: 12) == 0.25
		const servingDiff = currentServing / serving;
		const trueAmount = amount * servingDiff;

		nameCol.innerText = name;
		amountCol.innerText = trueAmount;
		measurementCol.innerText = ings.ingredientList[name].measurement;

		row.appendChild(nameCol);
		row.appendChild(amountCol);
		row.appendChild(measurementCol);
		elm.appendChild(row);
	}
}

function renderMeasurements(elm, m) {
	if (!elm || elm === null || elm === undefined) {
		return;
	}

	while (elm.firstChild) {
		elm.removeChild(elm.lastChild);
	}

	for (let i of m) {
		const option = document.createElement('option');
		option.innerText = i;
		option.value = i.toLowerCase();
		elm.appendChild(option);
	}
}

//  [[ Event Listeners ]]

servingSizeInput.addEventListener('change', function(e) {
	const { value } = e.target;

	currentServing = Number(value);
	render();
});

addIngredientButton.addEventListener('click', function() {
	if (!validateInputs()) {
		return;
	}

	const ingredient = new Ingredient(
		nameInput.value,
		amountInput.value,
		measurementList.value,
		servingInput.value
	);
	ingredients.add(ingredient);
	addToCache(ingredients.ingredientList);
	render();
	nameInput.value = '';
	amountInput.value = '';
});

// [[ Initialize ]]

(function() {
	const cache = getFromCache();
	if (isNullOrEmpty(cache)) {
		ingredients.clear();
	} else {
		ingredients.from(JSON.parse(cache));
	}

	servingSizeInput.value = currentServing;
	render();
})()

