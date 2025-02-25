function filterTable() {
    let input = document.getElementById('search').value.toLowerCase();
    let rows = document.querySelectorAll('#application-table tbody tr');

    rows.forEach(row => {
        let text = row.innerText.toLowerCase();
        row.style.display = text.includes(input) ? '' : 'none';
    });
}

function openModal() {
    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('addForm').reset();
}

function updateRowNumbers() {
    const tableRows = document.querySelectorAll('#application-table tbody tr');
    tableRows.forEach((row, index) => {
        row.cells[0].innerText = index + 1;
    });
}

async function submitForm(event) {
    event.preventDefault(); // Prevent the default form submission

    const form = document.getElementById('addForm');
    const formData = new FormData(form); // Get form data

    try {
        const response = await fetch('/add_application', { // Change URL
            method: 'POST',
            body: formData // Send form data
        });

        if (response.ok) {
            closeModal();
            window.location.reload(); // Reload the page to show new data
        } else {
            console.error("Error adding application:", response.status);
            alert("Error adding application. Please check the console.");
        }
    } catch (error) {
        console.error("Network error:", error);
        alert("Network error. Please try again later.");
    }
}

function validateDate(day, month, year) {
    const date = new Date(year, month - 1, day);
    return (
        date.getFullYear() === parseInt(year) &&
        date.getMonth() === parseInt(month) - 1 &&
        date.getDate() === parseInt(day)
    );
}

async function clearData() {
    if (confirm("Удалить все записи безвозвратно?")) {
        try {
            const response = await fetch('/clear', {
                method: 'POST'
            });
            if (response.ok) {
                window.location.reload();
            } else {
                const result = await response.json();
                alert(result.message || 'Ошибка при очистке данных!');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка сети!');
        }
    }
}

async function exportToExcel() {
    try {
        window.location.href = '/export';
    } catch (error) {
        console.error('Ошибка экспорта:', error);
        alert('Ошибка при экспорте!');
    }
}