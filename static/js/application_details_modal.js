function openApplicationModal(appId, appData) {
    console.log('openApplicationModal is called', appId, appData);
    const modal = document.getElementById('application-modal');
    const details = document.getElementById('application-details');

    // Парсим JSON из data-* атрибутов
    const economistInfo = JSON.parse(appData.economistInfo || '{}');
    const purchaseInfo = JSON.parse(appData.purchaseInfo || '{}');
    const execDocsInfo = JSON.parse(appData.execDocsInfo || '{}');
    const lawyerInfo = JSON.parse(appData.lawyerInfo || '{}');
    const accountantInfo = JSON.parse(appData.accountantInfo || '{}');

    let html = `
        <div class="main-info-container">
            <div class="main-info">
                <h2>Заявка № ${appData.id} от ${String(appData.reg_day).padStart(2, '0')}/${String(appData.reg_month).padStart(2, '0')}/${appData.reg_year} 
                <i class="fas fa-pencil-alt edit-icon" data-app-id="${appData.id}" onclick="openEditModal('${appData.id}')"></i>
                </h2> 
                <p><b>№, Дата исходящей:</b> ${appData.outgoing_id} от ${String(appData.outgoing_day).padStart(2, '0')}/${String(appData.outgoing_month).padStart(2, '0')}/${appData.outgoing_year}</p>
                <p><b>Наименование юр. лица:</b> ${appData.company_name}</p>
                <p><b>Предмет закупки:</b> ${appData.purchase_subject}</p>
                <p><b>Сумма:</b> ${appData.amount} (руб.)</p>
            </div>

            <div class="exec-docs-info">
                <h3>Информация об исполнительной документации:</h3>
                <p><b>Описание документации:</b> ${execDocsInfo.description || ''}</p>
                <p><b>Статус выполнения:</b> ${execDocsInfo.status || ''}</p>
                <p><b>Комментарии:</b> ${execDocsInfo.comments || ''}</p>
            </div>
        </div>

        <div class="modal-data">
            <div class="modal-column">
                <h3>Информация об экономисте:</h3>
                <p><b>ФИО:</b> ${economistInfo.fio || ''}</p>
                <p><b>Классификация:</b> ${economistInfo.classification || ''}</p>
                <p><b>Дата:</b> ${economistInfo.date || ''}</p>
                <p><b>Сумма:</b> ${economistInfo.amount || ''} (руб.)</p>
            </div>

            <div class="modal-column">
                <h3>Информация о закупке:</h3>
                <p><b>№:</b> ${purchaseInfo.number || ''}</p>
                <p><b>Дата:</b> ${purchaseInfo.date || ''}</p>
                <p><b>Вид закупки:</b> ${purchaseInfo.type || ''}</p>
                <p><b>Сумма:</b> ${purchaseInfo.amount || ''}</p>
                <p><b>Сроки закупки:</b> ${purchaseInfo.terms || ''}</p>
            </div>

            <div class="modal-column">
                <h3>Информация о юристе:</h3>
                <p><b>№:</b> ${lawyerInfo.number || ''}</p>
                <p><b>Дата договора:</b> ${lawyerInfo.date || ''}</p>
                <p><b>Сумма:</b> ${lawyerInfo.amount || ''}</p>
                <p><b>Срок исполнения:</b> ${lawyerInfo.term || ''}</p>
            </div>

            <div class="modal-column">
                <h3>Информация о бухгалтере:</h3>
                <p><b>№:</b> ${accountantInfo.number || ''}</p>
                <p><b>Дата плат. поручения:</b> ${accountantInfo.date || ''}</p>
                <p><b>Сумма:</b> ${accountantInfo.amount || ''} (руб.)</p>
                <p><b>Комментарий:</b> ${accountantInfo.comment || ''}</p>
            </div>
        </div>

        <button onclick="closeApplicationModal()" class="button">Закрыть</button>
    `;

    details.innerHTML = html;
    modal.style.display = 'flex';
}

function closeApplicationModal() {
    const modal = document.getElementById('application-modal');
    modal.style.display = 'none';
}

function updateRowData(appId, column, value) {
    const row = document.querySelector(`#application-table tr[data-app-id="${appId}"]`);
    if (row) {
        const columnPrefix = column.replace("_info", "");
        const cell = row.querySelector(`.${columnPrefix}-cell`);
        if (cell) {
            let statusHTML = '';
            if (Object.keys(value).length === 0) {
                // Data is empty
                statusHTML = '<span class="status-indicator status-empty">-----</span>';
            } else {
                const status = calculate_completion_status(value, columnPrefix); // Передаем columnPrefix

                if (status === 'complete') {
                    statusHTML = '<span class="status-indicator status-complete"><i class="fas fa-check-circle"></i></span>';
                } else if (status === 'partial') {
                    statusHTML = '<span class="status-indicator status-partial"><i class="fas fa-spinner fa-spin"></i></span>';
                } else {
                    statusHTML = '<span class="status-indicator status-empty">-----</span>';
                }
            }
            cell.innerHTML = statusHTML;
        }

         for (const key in value) {
            if (value.hasOwnProperty(key)) {
                row.dataset[key.toLowerCase()] = JSON.stringify(value[key]);
            }
        }
    }
}

let rowClickHandlersSetup = false; // Флаг для отслеживания

function setupRowClickHandlers() {
        console.log('setupRowClickHandlers is called');
        if (!rowClickHandlersSetup) {
            rowClickHandlersSetup = true; // Устанавливаем флаг

            document.querySelectorAll('#application-table tbody tr').forEach(row => {
                row.addEventListener('click', function (event) {
                    event.stopPropagation();
                    const appId = this.dataset.appId;
                    const appData = {
                        id: this.dataset.appId,
                        reg_day: this.dataset.regDay,
                        reg_month: this.dataset.regMonth,
                        reg_year: this.dataset.regYear,
                        outgoing_id: this.dataset.outgoingId,
                        outgoing_day: this.dataset.outgoingDay,
                        outgoing_month: this.dataset.outgoingMonth,
                        outgoing_year: this.dataset.outgoingYear,
                        company_name: this.dataset.companyName,
                        purchase_subject: this.dataset.purchaseSubject,
                        amount: this.dataset.amount,
                        economistInfo: this.dataset.economistInfo,
                        purchaseInfo: this.dataset.purchaseInfo,
                        execDocsInfo: this.dataset.execDocsInfo,
                        lawyerInfo: this.dataset.lawyerInfo,
                        accountantInfo: this.dataset.accountantInfo
                    };
                    openApplicationModal(appId, appData);
                });
            });
        }
    }

function toggleEditMode(modalId) {
    const modal = document.getElementById(modalId);
    const inputs = modal.querySelectorAll('input, textarea');
    const isEditable = modal.classList.contains('editing');

    if (isEditable) {
        // Выключаем режим редактирования
        inputs.forEach(input => {
            input.disabled = true;
        });
        modal.classList.remove('editing');
    } else {
        // Включаем режим редактирования
        inputs.forEach(input => {
            input.disabled = false;
        });
        modal.classList.add('editing');
    }
}

function calculate_completion_status(data, columnPrefix) {
    let totalFields = Object.keys(data).length;
    let filledFields = 0;
    let hasData = false;

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            if (data[key] !== null && data[key] !== "") {
                filledFields++;
                hasData = true; //указываем на то, что есть хоть какие то данные
            }
        }
    }

    if (columnPrefix === 'accountant') {
        totalFields--; //убираем поле comment
        if (data.comment !== null && data.comment !== "") {
            filledFields++;
        }

        // Учитываем, что поле comment не обязательно
        if (filledFields === 0) {
            return 'empty';
        } else if (filledFields === totalFields) {
            return 'complete';
        } else {
            return 'partial';
        }
    }


    if (filledFields === 0) {
        return 'empty';
    } else if (filledFields === totalFields) {
        return 'complete';
    } else {
        return 'partial';
    }
}

// Economist
function openEconomistModal(appId) {
    const modal = document.getElementById('economistModal');
    modal.classList.remove('editing'); // Сбрасываем режим редактирования
    const cell = document.querySelector(`.economist-cell[data-app-id="${appId}"]`);
    if (cell) {
        let economistData = cell.dataset.economistInfo;
        let data = {};
        try {
            data = JSON.parse(economistData || '{}');
        } catch (e) {
            console.error("Ошибка при парсинге JSON:", e);
            data = {};
        }
        document.getElementById('economistFio').value = data.fio || '';
        document.getElementById('economistClassification').value = data.classification || '';
        document.getElementById('economistDate').value = data.date || '';
        document.getElementById('economistAmount').value = data.amount || '';
        currentAppId = appId;

        // Отключаем редактирование полей при открытии
        const inputs = modal.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.disabled = true;
        });

        modal.style.display = 'flex';
    }
}

// Purchase
function openPurchaseModal(appId) {
    const modal = document.getElementById('purchaseModal');
    modal.classList.remove('editing'); // Сбрасываем режим редактирования
    const cell = document.querySelector(`.purchase-cell[data-app-id="${appId}"]`);
    if (cell) {
        let purchaseData = cell.dataset.purchaseInfo;
        let data = {};
        try {
            data = JSON.parse(purchaseData || '{}');
        } catch (e) {
            console.error("Ошибка при парсинге JSON:", e);
            data = {};
        }
        document.getElementById('purchaseNumber').value = data.number || '';
        document.getElementById('purchaseDate').value = data.date || '';
        document.getElementById('purchaseType').value = data.type || '';
        document.getElementById('purchaseAmount').value = data.amount || '';
        document.getElementById('purchaseTerms').value = data.terms || '';
        currentAppId = appId;

        // Отключаем редактирование полей при открытии
        const inputs = modal.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.disabled = true;
        });

        modal.style.display = 'flex';
    }
}

// Docs
function openExecDocsModal(appId) {
    const modal = document.getElementById('execDocsModal');
    modal.classList.remove('editing'); // Сбрасываем режим редактирования
    const cell = document.querySelector(`.docs-cell[data-app-id="${appId}"]`);
    if (cell) {
        let execDocsData = cell.dataset.execDocsInfo;
        let data = {};
        try {
            data = JSON.parse(execDocsData || '{}');
        } catch (e) {
            console.error("Ошибка при парсинге JSON:", e);
            data = {};
        }
        document.getElementById('docsDescription').value = data.description || '';
        document.getElementById('docsStatus').value = data.status || '';
        document.getElementById('docsComments').value = data.comments || '';
        currentAppId = appId;

        // Отключаем редактирование полей при открытии
        const inputs = modal.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.disabled = true;
        });

        modal.style.display = 'flex';
    }
}

// Lawyer
function openLawyerModal(appId) {
    const modal = document.getElementById('lawyerModal');
    modal.classList.remove('editing'); // Сбрасываем режим редактирования
    const cell = document.querySelector(`.lawyer-cell[data-app-id="${appId}"]`);
    if (cell) {
        let lawyerData = cell.dataset.lawyerInfo;
        let data = {};
        try {
            data = JSON.parse(lawyerData || '{}');
        } catch (e) {
            console.error("Ошибка при парсинге JSON:", e);
            data = {};
        }
        document.getElementById('lawyerNumber').value = data.number || '';
        document.getElementById('lawyerDate').value = data.date || '';
        document.getElementById('lawyerAmount').value = data.amount || '';
        document.getElementById('lawyerTerm').value = data.term || '';
        currentAppId = appId;

        // Отключаем редактирование полей при открытии
        const inputs = modal.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.disabled = true;
        });

        modal.style.display = 'flex';
    }
}

// Accountant
function openAccountantModal(appId) {
    const modal = document.getElementById('accountantModal');
    modal.classList.remove('editing'); // Сбрасываем режим редактирования
    const cell = document.querySelector(`.accountant-cell[data-app-id="${appId}"]`);
    if (cell) {
        let accountantData = cell.dataset.accountantInfo;
        let data = {};
        try {
            data = JSON.parse(accountantData || '{}');
        } catch (e) {
            console.error("Ошибка при парсинге JSON:", e);
            data = {};
        }
        document.getElementById('accountantNumber').value = data.number || '';
        document.getElementById('accountantDate').value = data.date || '';
        document.getElementById('accountantAmount').value = data.amount || '';
        document.getElementById('accountantComment').value = data.comment || '';
        currentAppId = appId;

        // Отключаем редактирование полей при открытии
        const inputs = modal.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.disabled = true;
        });

        modal.style.display = 'flex';
    }
}

// Economist
async function saveEconomistData(appId) {
    const fio = document.getElementById('economistFio').value;
    const classification = document.getElementById('economistClassification').value;
    const date = document.getElementById('economistDate').value;
    const amount = document.getElementById('economistAmount').value;

    const value = {fio: fio, classification: classification, date: date, amount: amount};

    try {
        const response = await fetch(`/update/${appId}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ column: 'economist_info', value: value }) //Убрали appid
        });

        if (response.ok) {
            const cell = document.querySelector(`.economist-cell[data-app-id="${appId}"]`);

            if (fio === '' && classification === '' && date === '' && amount === '') {
                cell.dataset.economistInfo = JSON.stringify({}); // Clear data
                updateRowData(appId, 'economist_info', {});

            }
            else {
              cell.dataset.economistInfo = JSON.stringify(value); // Update with new value
              updateRowData(appId, 'economist_info', value);
            }
            closeEconomistModal();
            toggleEditMode('economistModal');

        } else {
            console.error('Ошибка при сохранении данных экономиста');
            alert('Ошибка при сохранении данных экономиста!');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка сети!');
    }
}

// Purchase
async function savePurchaseData(appId) {
    const number = document.getElementById('purchaseNumber').value;
    const date = document.getElementById('purchaseDate').value;
    const type = document.getElementById('purchaseType').value;
    const amount = document.getElementById('purchaseAmount').value;
    const terms = document.getElementById('purchaseTerms').value;

    const value = { number: number, date: date, type: type, amount: amount, terms: terms };

    try {
        const response = await fetch(`/update/${appId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ column: 'purchase_info', value: value })
        });

        if (response.ok) {
            // Обновляем data-* атрибуты в ячейке
            const cell = document.querySelector(`.purchase-cell[data-app-id="${appId}"]`);
            cell.dataset.purchaseInfo = JSON.stringify(value); // Обновляем purchaseInfo
            updateRowData(appId, 'purchase_info', value);
            closePurchaseModal();

            // Выключаем режим редактирования
            toggleEditMode('purchaseModal');

        } else {
            console.error('Ошибка при сохранении данных о закупке');
            alert('Ошибка при сохранении данных о закупке!');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка сети!');
    }
}

// Docs
async function saveExecDocsData(appId) {
    const description = document.getElementById('docsDescription').value;
    const status = document.getElementById('docsStatus').value;
    const comments = document.getElementById('docsComments').value;

    const value = { description: description, status: status, comments: comments };

    try {
        const response = await fetch(`/update/${appId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ column: 'exec_docs_info', value: value })
        });

        if (response.ok) {
            // Обновляем data-* атрибуты в ячейке
            const cell = document.querySelector(`.docs-cell[data-app-id="${appId}"]`);
            cell.dataset.execDocsInfo = JSON.stringify(value); // Обновляем execDocsInfo
            updateRowData(appId, 'exec_docs_info', value);
            closeExecDocsModal()

            // Выключаем режим редактирования
            toggleEditMode('execDocsModal');

        } else {
            console.error('Ошибка при сохранении данных об исполнительной документации');
            alert('Ошибка при сохранении данных об исполнительной документации!');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка сети!');
    }
}

// Lawyer
async function saveLawyerData(appId) {
    const number = document.getElementById('lawyerNumber').value;
    const date = document.getElementById('lawyerDate').value;
    const amount = document.getElementById('lawyerAmount').value;
    const term = document.getElementById('lawyerTerm').value;

    const value = { number: number, date: date, amount: amount, term: term };

    try {
        const response = await fetch(`/update/${appId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ column: 'lawyer_info', value: value })
        });

        if (response.ok) {
            // Обновляем data-* атрибуты в ячейке
            const cell = document.querySelector(`.lawyer-cell[data-app-id="${appId}"]`);
            cell.dataset.lawyerInfo = JSON.stringify(value); // Обновляем lawyerInfo
            closeLawyerModal();
            updateRowData(appId, 'lawyer_info', value);

            // Выключаем режим редактирования
            toggleEditMode('lawyerModal');

        } else {
            console.error('Ошибка при сохранении юридических данных');
            alert('Ошибка при сохранении юридических данных!');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка сети!');
    }
}

// Accountant
async function saveAccountantData(appId) {
    const number = document.getElementById('accountantNumber').value;
    const date = document.getElementById('accountantDate').value;
    const amount = document.getElementById('accountantAmount').value;
    const comment = document.getElementById('accountantComment').value;

    const value = { number: number, date: date, amount: amount, comment: comment };

    try {
        const response = await fetch(`/update/${appId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ column: 'accountant_info', value: value })
        });

        if (response.ok) {
            // Обновляем data-* атрибуты в ячейке
            const cell = document.querySelector(`.accountant-cell[data-app-id="${appId}"]`);
            cell.dataset.accountantInfo = JSON.stringify(value); // Обновляем accountantInfo
            closeAccountantModal();
            updateRowData(appId, 'accountant_info', value);

            // Выключаем режим редактирования
            toggleEditMode('accountantModal');

        } else {
            console.error('Ошибка при сохранении бухгалтерских данных');
            alert('Ошибка при сохранении бухгалтерских данных!');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка сети!');
    }
}

// Economist
function closeEconomistModal() {
    const modal = document.getElementById('economistModal');
    modal.style.display = 'none';
}

// Purchase
function closePurchaseModal() {
    const modal = document.getElementById('purchaseModal');
    modal.style.display = 'none';
}

// Docs
function closeExecDocsModal() {
    const modal = document.getElementById('execDocsModal');
    modal.style.display = 'none';
}

// Lawyer
function closeLawyerModal() {
    const modal = document.getElementById('lawyerModal');
    modal.style.display = 'none';
}

// Accountant
function closeAccountantModal() {
    const modal = document.getElementById('accountantModal');
    modal.style.display = 'none';
}

function generateMainInfoButtonsTemplate(appId) {
    const details = document.getElementById('application-details');
    const isEditing = details.classList.contains('editing');

    if (isEditing) {
        return `
          <button onclick="saveMainInfoData('${appId}')" class="button button-primary">Сохранить</button>
          <button onclick="toggleMainInfoEditMode('${appId}')" class="button button-secondary">Отмена</button>
        `;
    } else {
        return `<button onclick="closeApplicationModal()" class="button">Закрыть</button>`;
    }
}

function generateMainInfoHeaderEditTemplate(row) {
    if (!row) return '';
    const regDate = row.dataset.regDay + "/" + row.dataset.regMonth + "/" + row.dataset.regYear
    return `
    <h2 class="main-info-title">Заявка №
        <input type="text" class="app-id-edit" value="${row.dataset.appId}">
         от
        <input type="text" class="app-reg-date-edit" value="${regDate}">
    </h2>
    `
}
function generateMainInfoOutgoingIdEditTemplate(row) {
    if (!row) return '';
    const outgoingId = row.dataset.outgoingId + " от " + row.dataset.outgoingDay + "/" + row.dataset.outgoingMonth + "/" + row.dataset.outgoingYear
    return `
        <input type="text" class="app-outgoing-edit" value="${outgoingId}">
    `
}
function generateMainInfoCompanyNameEditTemplate(row) {
    if (!row) return '';
    return `
        <input type="text" class="app-company-name-edit" value="${row.dataset.companyName}">
    `
}

function generateMainInfoPurchaseSubjectEditTemplate(row) {
    if (!row) return '';
    return `
        <input type="text" class="app-purchase-subject-edit" value="${row.dataset.purchaseSubject}">
    `
}

function generateMainInfoAmountEditTemplate(row) {
    if (!row) return '';
    return `
        <input type="text" class="app-amount-edit" value="${row.dataset.amount}">
    `
}




function openEditModal(appId) {
    const modal = document.getElementById('editModal');
    const row = document.querySelector(`#application-table tr[data-app-id="${appId}"]`);

    if (!row) {
        console.error(`Row with app ID ${appId} not found.`);
        return;
    }
    const appData = {
        id: row.dataset.appId,
        reg_day: row.dataset.regDay,
        reg_month: row.dataset.regMonth,
        reg_year: row.dataset.regYear,
        outgoing_id: row.dataset.outgoingId,
        outgoing_day: row.dataset.outgoingDay,
        outgoing_month: row.dataset.outgoingMonth,
        outgoing_year: row.dataset.outgoingYear,
        company_name: row.dataset.companyName,
        purchase_subject: row.dataset.purchaseSubject,
        amount: row.dataset.amount
    };

    // Заполняем поля модального окна данными из appData
    document.getElementById('editId').value = appData.id; // VERY IMPORTANT
    console.log("Setting editId to:", appData.id); // <---- Add this line
    document.getElementById('editRegDay').value = appData.reg_day;
    document.getElementById('editRegMonth').value = appData.reg_month;
    document.getElementById('editRegYear').value = appData.reg_year;
    document.getElementById('editOutgoingId').value = appData.outgoing_id;
    document.getElementById('editOutgoingDay').value = appData.outgoing_day;
    document.getElementById('editOutgoingMonth').value = appData.outgoing_month;
    document.getElementById('editOutgoingYear').value = appData.outgoing_year;
    document.getElementById('editCompany').value = appData.company_name;
    document.getElementById('editSubject').value = appData.purchase_subject;
    document.getElementById('editAmount').value = appData.amount;

    modal.style.display = 'flex';
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none';
}

async function submitEditForm(event) {
    event.preventDefault();

    // Get the old app ID from the data attribute of the edit button
    const editButton = document.querySelector('#application-details .edit-icon');  //  Находим кнопку редактирования по селектору
    const oldAppId = editButton.dataset.appId; // Получаем старый ID из data-атрибута
   
    console.log("oldAppId from edit button:", oldAppId); // Проверяем, что получили правильный ID

    const row = document.querySelector(`#application-table tr[data-app-id="${oldAppId}"]`);

    if (!row) {
        console.error(`Row with app ID ${oldAppId} not found before update.`);
        alert(`Row with app ID ${oldAppId} not found. Please refresh the page.`);
        return; // Exit the function if the row is not found
    }

    const formData = new FormData(event.target);

    const data = {
        id: formData.get('id'),
        reg_day: formData.get('reg_day'),
        reg_month: formData.get('reg_month'),
        reg_year: formData.get('reg_year'),
        outgoing_id: formData.get('outgoing_id'),
        outgoing_day: formData.get('outgoing_day'),
        outgoing_month: formData.get('outgoing_month'),
        outgoing_year: formData.get('outgoing_year'),
        company_name: formData.get('company'),
        purchase_subject: formData.get('subject'),
        amount: formData.get('amount')
    };

    console.log("Data being sent:", data);

    try {
        const response = await fetch(`/updateMainInfo/${oldAppId}`, { // Use oldAppId for the URL
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeEditModal();
            closeApplicationModal();

            // *AFTER* successful server response, update the row
            row.dataset.appId = data.id;
            row.dataset.regDay = data.reg_day;
            row.dataset.regMonth = data.reg_month;
            row.dataset.regYear = data.reg_year;
            row.dataset.outgoingId = data.outgoing_id;
            row.dataset.outgoingDay = data.outgoing_day;
            row.dataset.outgoingMonth = data.outgoing_month;
            row.dataset.outgoingYear = data.outgoing_year;
            row.dataset.companyName = data.company_name;
            row.dataset.purchaseSubject = data.purchase_subject;
            row.dataset.amount = data.amount;
            row.setAttribute('data-app-id', data.id);

            // Update the row's HTML content (only the cells that changed)
            row.cells[1].innerHTML = `<b>№ ${data.id}</b> от ${String(data.reg_day).padStart(2, '0')}/${String(data.reg_month).padStart(2, '0')}/${data.reg_year}`;
            row.cells[2].innerHTML = `<b>№ ${data.outgoing_id}</b> от ${String(data.outgoing_day).padStart(2, '0')}/${String(data.outgoing_month).padStart(2, '0')}/${data.outgoing_year}`;
            row.cells[3].innerHTML = `<center>${data.company_name}</center>`;
            row.cells[4].innerHTML = `${data.purchase_subject}<b> - (${data.amount} руб.)</b> Подробнее <i class="fas fa-info-circle" style="color:#689F38;"></i>`;

            updateRowNumbers(); // Update the row numbers

        } else {
            console.error("Ошибка при отправке данных на сервер");
            const result = await response.json();
            console.error(result);
            alert('Ошибка при сохранении данных: ' + result.message);
        }
    } catch (error) {
        console.error("Произошла ошибка:", error);
        alert('Ошибка сети!');
    }
}