document.addEventListener('DOMContentLoaded', function() {
    // Search functionality
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const eventsBody = document.getElementById('eventsBody');
    const eventRows = eventsBody.querySelectorAll('tr');

    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchTerm = searchInput.value.toLowerCase().trim();
            
            eventRows.forEach(row => {
                const eventName = row.cells[0].textContent.toLowerCase();
                if (searchTerm === '' || eventName.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // Buy button functionality
    const buyButtons = document.querySelectorAll('.buy-btn');
    buyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const eventName = row.cells[0].textContent;
            const eventDate = row.cells[1].textContent;
            const eventLocation = row.cells[2].textContent;
            const ticketOptions = row.cells[3].textContent;
            
            alert(`Proceeding to purchase tickets for:\n\nEvent: ${eventName}\nDate: ${eventDate}\nLocation: ${eventLocation}\nOptions: ${ticketOptions}`);
        });
    });
});
