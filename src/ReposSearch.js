export default class ReposSearch {
	constructor() {
		this.users = ['devballteam', 'octocat']
		this.usersRepos = [];
	}

	getDataFromInput = () => {
		this.usersRepos = [];
		const input = document.querySelector(".search__input");
		const dataFromInput = input.value;
		console.log(dataFromInput);
		this.__validateInputValue(dataFromInput);
		this.__loadUsersRepos(this.users);
	};

	__validateInputValue = (dataFromInput) => {
		const acceptedDataRegex = /^(( *<repos +((data-user="[a-zA-Z0-9_]+" +data-update="(\d{4}[\-\/\s]?((((0[13578])|(1[02]))[\-\/\s]?(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\-\/\s]?(([0-2][0-9])|(30)))|(02[\-\/\s]?[0-2][0-9])))")|(data-update="(\d{4}[\-\/\s]?((((0[13578])|(1[02]))[\-\/\s]?(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\-\/\s]?(([0-2][0-9])|(30)))|(02[\-\/\s]?[0-2][0-9])))" +data-user="[a-zA-Z0-9_]+")) *>)+ *)$/g;
		const acceptedFormatTest = acceptedDataRegex.test(dataFromInput);
		console.log('acceptedFormatTest ', acceptedFormatTest);
	if(acceptedFormatTest) this.__retrieveDataFromInput(dataFromInput);
	}

	__retrieveDataFromInput = (dataFromInput) => {
		const repoRegex = /<repos +((data-user="[a-zA-Z0-9_]+" +data-update="(\d{4}[\-\/\s]?((((0[13578])|(1[02]))[\-\/\s]?(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\-\/\s]?(([0-2][0-9])|(30)))|(02[\-\/\s]?[0-2][0-9])))")|(data-update="(\d{4}[\-\/\s]?((((0[13578])|(1[02]))[\-\/\s]?(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\-\/\s]?(([0-2][0-9])|(30)))|(02[\-\/\s]?[0-2][0-9])))" +data-user="[a-zA-Z0-9_]+")) *>/g;
		const reposFromInput = dataFromInput.match(repoRegex);
		console.log('reposFromInput ', reposFromInput);
	}

	__loadUsersRepos = (users) => {
		let usersRepos = [];

		users.forEach(userName => {
			usersRepos.push(this.__getDataFromUserRepos(userName));
		});

		Promise.all(usersRepos).then(allUsersRepos => {
			this.usersRepos = allUsersRepos;
			console.log(this.usersRepos);
			this.__generateInfoTables(this.usersRepos, users);
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

	__generateInfoTables = (usersRepos, users) => {
		usersRepos.forEach((userRepos, index) => {
			if (Array.isArray(userRepos)) {
				this.__generateInfoTable(userRepos, users, index);
			} else {
				const contentElement = document.querySelector('.content');
				const noUserInfo = 'Such a user does not exist';
				const noUserInfoElement = document.createElement('p');
				noUserInfoElement.innerText = noUserInfo;
				contentElement.appendChild(noUserInfoElement);
			}
		})

	}

	__generateInfoTable = (userRepos, users, index) => {
		console.log(this.usersRepos[1].length);
		const contentElement = document.querySelector('.content');
		const tableWrapperElement = document.createElement('div');
		tableWrapperElement.classList.add('content__table-wrapper');
		const tableElement = document.createElement('table');
		tableElement.classList.add('table');
		const theadElement = document.createElement('thead');
		theadElement.classList.add('table__thead')
		theadElement.innerHTML = `
			<tr class="table__head-row">
				<th class="table__head table__head--user" colspan="5">Repositories of ${users[index]} user</th>
			</tr>
			<tr class="table__head-row">
				<th class="table__head">No.</th>
				<th class="table__head">Repository name</th>
				<th class="table__head">Description</th>
				<th class="table__head">Last update date</th>
				<th class="table__head">Repository address</th>
			</tr>
`;

		const tbodyElement = this.__generateTableBody(userRepos);
		tbodyElement.classList.add('table__body');

		tableElement.appendChild(theadElement);
		tableElement.appendChild(tbodyElement);
		tableWrapperElement.appendChild(tableElement)
		contentElement.appendChild(tableWrapperElement);
	}

	__generateTableBody = (userRepos) => {
		const tbodyElement = document.createElement('tbody');
		userRepos.forEach((userRepo, index) => {
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
		return tbodyElement;
	}

}
