export default class ReposSearch {
	constructor() {
		this.preparedUsersData = [];
		this.usersRepos = [];
		this.usersReposUpdatedAfterProvidedDate = [];
	}

	getDataFromInput = () => {
		this.preparedUsersData = [];
		this.usersRepos = [];
		this.usersReposUpdatedAfterProvidedDate = [];
		const input = document.querySelector(".search__input");
		const dataFromInput = input.value;
		this.__validateInputValue(dataFromInput);
	};

	__validateInputValue = (dataFromInput) => {
		const acceptedDataRegex = /^(( *<repos +((data-user="[a-zA-Z0-9_]+" +data-update="(\d{4}[\-\/\s]?((((0[13578])|(1[02]))[\-\/\s]?(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\-\/\s]?(([0-2][0-9])|(30)))|(02[\-\/\s]?[0-2][0-9])))")|(data-update="(\d{4}[\-\/\s]?((((0[13578])|(1[02]))[\-\/\s]?(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\-\/\s]?(([0-2][0-9])|(30)))|(02[\-\/\s]?[0-2][0-9])))" +data-user="[a-zA-Z0-9_]+")) *>)+ *)$/g;
		const acceptedFormatTest = acceptedDataRegex.test(dataFromInput);
		if (acceptedFormatTest) this.__retrieveDataFromInput(dataFromInput);
		else this.__inputValueFormatNotValid();
	}

	__retrieveDataFromInput = (dataFromInput) => {
		const repoRegex = /<repos +((data-user="[a-zA-Z0-9_]+" +data-update="(\d{4}[\-\/\s]?((((0[13578])|(1[02]))[\-\/\s]?(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\-\/\s]?(([0-2][0-9])|(30)))|(02[\-\/\s]?[0-2][0-9])))")|(data-update="(\d{4}[\-\/\s]?((((0[13578])|(1[02]))[\-\/\s]?(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\-\/\s]?(([0-2][0-9])|(30)))|(02[\-\/\s]?[0-2][0-9])))" +data-user="[a-zA-Z0-9_]+")) *>/g;
		const reposFromInput = dataFromInput.match(repoRegex);
		this.__prepareUsersData(reposFromInput);
	}

	__prepareUsersData = (reposFromInput) => {
		this.preparedUsersData = reposFromInput.map(reposTag => {
			const dummyDiv = document.createElement('div');
			dummyDiv.innerHTML = reposTag;
			const reposElement = dummyDiv.querySelector('repos');
			const userData = {};
			userData.userName = reposElement.dataset.user;
			userData.update = reposElement.dataset.update;
			return userData;
		})
		this.__loadUsersRepos(this.preparedUsersData);
	}

	__inputValueFormatNotValid = () => {
		const contentElement = document.querySelector('.content');
		contentElement.innerHTML = '';
		const notValidInfoElement = document.createElement('div');
		notValidInfoElement.classList.add('content__error-info-wrapper')
		notValidInfoElement.innerHTML = `<div>Ooops, provided data probably contain errors.</div> <div>Please, insert data in format: '&lt;repos data-user="provideExampleUserName" data-update="2019-05-01"&gt;'</div>`;
		contentElement.appendChild(notValidInfoElement);
	}

	__loadUsersRepos = (usersData) => {
		let usersRepos = [];
		usersData.forEach(user => {
			usersRepos.push(this.__getDataFromUserRepos(user.userName));
		});
		Promise.all(usersRepos).then(allUsersRepos => {
			this.usersRepos = allUsersRepos;
			const everyUserExist = this.__checkIfUsersExist(this.usersRepos);
			if(everyUserExist) {
				this.__filterUsersReposUpdatedAfterProvidedDate(this.usersRepos, usersData);
				this.__generateInfoTables(this.usersReposUpdatedAfterProvidedDate, usersData);
			} else {
				this.__userNoExistsInfo(this.usersRepos, usersData);
			}
		})
	}

	__checkIfUsersExist = (usersRepos) => {
		return usersRepos.every(userRepos => {
			return Array.isArray(userRepos);
		});
	}

	__userNoExistsInfo = (usersRepos, usersData) => {
		const contentElement = document.querySelector('.content');
		contentElement.innerHTML = '';
		const usersNoExistInfoElement = document.createElement('div');
		usersNoExistInfoElement.classList.add('content__error-info-wrapper');
		usersNoExistInfoElement.innerText = 'Houston, we have a problem, the following users does not exist:'
		usersRepos.forEach((userRepos, index) => {
			if(!Array.isArray(userRepos)) {
				const userNotExistsElement = document.createElement('div');
				userNotExistsElement.classList.add('content__error-info');
				userNotExistsElement.innerText = `- '${usersData[index].userName}'`;
				usersNoExistInfoElement.appendChild(userNotExistsElement);
			}
		});
		contentElement.appendChild(usersNoExistInfoElement);
	}

	__filterUsersReposUpdatedAfterProvidedDate = (usersRepos, usersData) => {
		this.usersReposUpdatedAfterProvidedDate = usersRepos.map((userRepos, index) => {
			if (Array.isArray(userRepos)) {
				return userRepos.filter(repo => {
					const userDate = new Date(usersData[index].update);
					const repoUpdatedDate = new Date(repo.updated_at);
					return userDate <= repoUpdatedDate;
				})
			}
			return userRepos;
		})
	}

	__getDataFromUserRepos = (userName) => {
		return new Promise((resolve, reject) => {
			fetch(`https://api.github.com/users/${userName}/repos`)
				.then(response => response.json())
				.then(response => {
					resolve(response);
				})
				.catch(error => {
						console.log('error: ', error);
					}
				)
		});
	}

	__generateInfoTables = (filteredUsersRepos, usersData) => {
		const contentElement = document.querySelector('.content');
		contentElement.innerHTML = '';
		filteredUsersRepos.forEach((filteredUserRepos, index) => {
			this.__generateInfoTable(filteredUserRepos, usersData, index);
		})
	}

	__generateInfoTable = (filteredUserRepos, usersData, index) => {
		const contentElement = document.querySelector('.content');
		const tableWrapperElement = document.createElement('div');
		tableWrapperElement.classList.add('content__table-wrapper');
		const tableElement = document.createElement('table');
		tableElement.classList.add('table');
		const theadElement = document.createElement('thead');
		theadElement.classList.add('table__thead')
		theadElement.innerHTML = `
			<tr class="table__head-row">
				<th class="table__head table__head--user" colspan="5">Repositories of '${usersData[index].userName}' user updated after ${usersData[index].update}</th>
			</tr>
			<tr class="table__head-row">
				<th class="table__head table__head--number">No.</th>
				<th class="table__head table__head--name">Repository name</th>
				<th class="table__head table__head--description">Description</th>
				<th class="table__head table__head--date">Last update</th>
				<th class="table__head table__head--address">Repository address</th>
			</tr>
		`;

		const tbodyElement = this.__generateTableBody(filteredUserRepos);
		tbodyElement.classList.add('table__body');
		tableElement.appendChild(theadElement);
		tableElement.appendChild(tbodyElement);
		tableWrapperElement.appendChild(tableElement)
		contentElement.appendChild(tableWrapperElement);
	}

	__generateTableBody = (filteredUserRepos) => {
		const tbodyElement = document.createElement('tbody');
		if(filteredUserRepos.length !== 0) {
			filteredUserRepos.forEach((userRepo, index) => {
				const rowElement = document.createElement('tr');
				rowElement.classList.add('table__row');
				rowElement.innerHTML = `
				<td class="table__date">
					${index + 1}
				</td>
				<td class="table__date">
					${userRepo.name}
				</td>
				<td class="table__date">
					${userRepo.description || 'No description available'}
				</td>
				<td class="table__date">
					${userRepo.updated_at ? userRepo.updated_at.slice(0, 10) : 'Not updated'}
				</td>
				<td class="table__date">
					<a target="_blank" href="${userRepo.html_url}">${userRepo.html_url}</a>
				</td>	
			`;
				tbodyElement.appendChild(rowElement);
			})
		} else {
			const rowElement = document.createElement('tr');
			rowElement.classList.add('table__row');
			rowElement.innerHTML = `
			<td class="table__date table__date--no-repos" colspan="5">User does not have any repositories for this date range.</td>
			`
			tbodyElement.appendChild(rowElement);
		}
		return tbodyElement;
	}

}
