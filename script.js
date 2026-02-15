document.addEventListener('DOMContentLoaded', function() {
    // ==================== LOCAL STORAGE KEYS ====================
    const CART_KEY = 'ticket_cart';
    const PURCHASES_KEY = 'ticket_purchases';
    const PREFERENCES_KEY = 'user_preferences';

    // ==================== INITIALIZE DATA ====================
    // Load preferences on page load
    loadPreferences();

    // ==================== SEARCH FUNCTIONALITY ====================
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const eventsBody = document.getElementById('eventsBody');
    const eventRows = eventsBody ? eventsBody.querySelectorAll('tr') : [];

    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchTerm = searchInput.value.toLowerCase().trim();
            
            // Save search to history
            if (searchTerm) {
                saveSearchHistory(searchTerm);
            }
            
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

    // ==================== ADD TO CART FUNCTIONALITY ====================
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const eventName = row.cells[0].textContent;
            const eventDate = row.cells[1].textContent;
            const eventLocation = row.cells[2].textContent;
            const ticketType = this.getAttribute('data-ticket-type');
            const ticketPrice = this.getAttribute('data-ticket-price');
            
            const ticket = {
                id: Date.now(),
                eventName: eventName,
                eventDate: eventDate,
                eventLocation: eventLocation,
                ticketType: ticketType,
                ticketPrice: ticketPrice,
                quantity: 1
            };
            
            addToCart(ticket);
        });
    });

    // ==================== TICKET SELECT DROPDOWN FUNCTIONALITY ====================
    const ticketSelects = document.querySelectorAll('.ticket-select');
    ticketSelects.forEach(select => {
        select.addEventListener('change', function() {
            // Get the selected option value (format: "type|price")
            const selectedValue = this.value;
            const [ticketType, ticketPrice] = selectedValue.split('|');
            
            // Find the corresponding button in the same row
            const row = this.closest('tr');
            const addButton = row.querySelector('.add-to-cart-btn');
            
            // Update button data attributes
            addButton.setAttribute('data-ticket-type', ticketType);
            addButton.setAttribute('data-ticket-price', ticketPrice);
        });
    });

    // ==================== BUY BUTTON FUNCTIONALITY ====================
    const buyButtons = document.querySelectorAll('.buy-btn');
    buyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const eventName = row.cells[0].textContent;
            const eventDate = row.cells[1].textContent;
            const eventLocation = row.cells[2].textContent;
            const ticketOptions = row.cells[3].textContent;
            
            // Save purchase to localStorage
            const purchase = {
                id: Date.now(),
                eventName: eventName,
                eventDate: eventDate,
                eventLocation: eventLocation,
                ticketOptions: ticketOptions,
                purchaseDate: new Date().toISOString()
            };
            
            savePurchase(purchase);
            alert(`Purchase complete! Your tickets for "${eventName}" have been saved.`);
        });
    });

    // ==================== THEME TOGGLE ====================
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = localStorage.getItem(PREFERENCES_KEY) ? JSON.parse(localStorage.getItem(PREFERENCES_KEY)).theme : 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }

    // ==================== CART FUNCTIONS ====================
    function getCart() {
        const cart = localStorage.getItem(CART_KEY);
        return cart ? JSON.parse(cart) : [];
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartCount();
    }

    function addToCart(ticket) {
        const cart = getCart();
        
        // Check if same ticket already in cart
        const existingTicket = cart.find(item => 
            item.eventName === ticket.eventName && 
            item.ticketType === ticket.ticketType
        );
        
        if (existingTicket) {
            existingTicket.quantity += 1;
        } else {
            cart.push(ticket);
        }
        
        saveCart(cart);
        alert(`Added to cart: ${ticket.ticketType} for ${ticket.eventName}`);
    }

    function removeFromCart(ticketId) {
        let cart = getCart();
        cart = cart.filter(item => item.id !== ticketId);
        saveCart(cart);
        displayCart();
    }

    function updateCartCount() {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Update main cart count
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
        }
        
        // Update navigation cart count
        const navCartCountElement = document.getElementById('navCartCount');
        if (navCartCountElement) {
            navCartCountElement.textContent = totalItems;
        }
    }


    function parsePrice(price) {
        // Handle prices like "free", "ksh 500pp", "ksh 5,000pp", "free entry", etc.
        if (typeof price === 'string') {
            if (price.toLowerCase() === 'free' || price.toLowerCase() === 'free entry') {
                return 0;
            }
            // Extract numeric value from price string
            const match = price.match(/[\d,.]+/);
            if (match) {
                return parseFloat(match[0].replace(/,/g, ''));
            }
        }
        return parseFloat(price) || 0;
    }

    function displayCart() {

        const cart = getCart();
        const cartItemsElement = document.getElementById('cartItems');
        
        if (!cartItemsElement) return;
        
        if (cart.length === 0) {
            cartItemsElement.innerHTML = '<p>Your cart is empty</p>';
            return;
        }
        
        let cartHTML = '<ul>';
        let total = 0;
        
        cart.forEach(item => {
            const itemTotal = parsePrice(item.ticketPrice) * item.quantity;
            total += itemTotal;

            cartHTML += `
                <li>
                    <strong>${item.eventName}</strong> - ${item.ticketType} 
                    (${item.quantity}x) - $${itemTotal}
                    <button onclick="removeFromCart(${item.id})">Remove</button>
                </li>
            `;
        });
        
        cartHTML += `<li><strong>Total: $${total}</strong></li></ul>`;
        cartItemsElement.innerHTML = cartHTML;
    }

    // ==================== PURCHASE FUNCTIONS ====================
    function savePurchase(purchase) {
        const purchases = getPurchases();
        purchases.push(purchase);
        localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
    }

    function getPurchases() {
        const purchases = localStorage.getItem(PURCHASES_KEY);
        return purchases ? JSON.parse(purchases) : [];
    }

    function displayPurchases() {
        const purchases = getPurchases();
        const purchasesElement = document.getElementById('purchases');
        
        if (!purchasesElement) return;
        
        if (purchases.length === 0) {
            purchasesElement.innerHTML = '<p>No purchases yet</p>';
            return;
        }
        
        let purchasesHTML = '<ul>';
        purchases.forEach(purchase => {
            purchasesHTML += `
                <li>
                    <strong>${purchase.eventName}</strong><br>
                    Date: ${purchase.eventDate}<br>
                    Location: ${purchase.eventLocation}<br>
                    Purchased: ${new Date(purchase.purchaseDate).toLocaleDateString()}
                </li>
            `;
        });
        purchasesHTML += '</ul>';
        purchasesElement.innerHTML = purchasesHTML;
    }

    // ==================== PREFERENCES FUNCTIONS ====================
    function getPreferences() {
        const preferences = localStorage.getItem(PREFERENCES_KEY);
        return preferences ? JSON.parse(preferences) : { theme: 'light' };
    }

    function savePreferences(preferences) {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    }

    function setTheme(theme) {
        const preferences = getPreferences();
        preferences.theme = theme;
        savePreferences(preferences);
        
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }

    function loadPreferences() {
        const preferences = getPreferences();
        setTheme(preferences.theme);
    }

    // ==================== SEARCH HISTORY FUNCTIONS ====================
    function saveSearchHistory(searchTerm) {
        let history = getSearchHistory();
        
        // Remove if already exists to avoid duplicates
        history = history.filter(term => term !== searchTerm);
        
        // Add to beginning
        history.unshift(searchTerm);
        
        // Keep only last 10 searches
        history = history.slice(0, 10);
        
        localStorage.setItem('search_history', JSON.stringify(history));
    }

    function getSearchHistory() {
        const history = localStorage.getItem('search_history');
        return history ? JSON.parse(history) : [];
    }

    // Initialize cart count on page load
    updateCartCount();
    
    // Display purchases if element exists
    displayPurchases();
    
    // Display cart if element exists
    displayCart();

    // Make functions available globally
    window.removeFromCart = removeFromCart;
    window.getPurchases = getPurchases;
    window.getCart = getCart;
});
