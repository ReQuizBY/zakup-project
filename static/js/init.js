document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('search').addEventListener('input', filterTable);
    setupRowClickHandlers();
    updateRowNumbers();
});

function updateRowNumbers() {
    const tableRows = document.querySelectorAll('#application-table tbody tr');
    tableRows.forEach((row, index) => {
        row.cells[0].innerText = index + 1; // Заполняем первую ячейку порядковым номером
    });
}