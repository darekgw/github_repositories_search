import '../stylesheets/style.scss';
import ReposSearch from '../app/ReposSearch';

document.addEventListener('DOMContentLoaded', function () {
	const reposSearch = new ReposSearch();
	const searchButton = document.querySelector('.search__button');
	const input = document.querySelector(".search__input");

	searchButton.addEventListener('click', () => {
		reposSearch.getDataFromInput()
	});
	input.addEventListener('keyup', (e) => {
		if(e.keyCode === 13) reposSearch.getDataFromInput();
	});
});
