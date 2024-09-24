window.onload=function(){
const apiEndpoint = "https://fakestoreapi.com/products";
let products = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 10;
const searchInput = document.getElementById('search');
const categoryContainer = document.querySelector('.filter-category');
const priceRange = document.getElementById('price-range');
const priceLabel = document.getElementById('price-label');
const availabilitySelect = document.getElementById('availability');
const sortSelect = document.getElementById('sort');
const productsContainer = document.getElementById('products-container');
const pageNumber = document.getElementById('page-number');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const loader = document.getElementById('loader');
const totalResults=document.getElementById('totalResults')
// Fetch products from the API

async function fetchProducts() {
    loader.style.display='flex';
    try {
        const response = await fetch(apiEndpoint);
       
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        products = await response.json();
        totalResults.innerHTML = `${products.length>0?products.length:0} results`;
        filteredProducts = [...products];
        populateCategories();
        displayProducts();

    } catch (error) {
        productsContainer.innerHTML = '<p>Sorry, there was an error fetching the products.</p>';
    } finally{
        loader.style.display='none';
    }
}

// Populate category checkboxes

function populateCategories() {
    const categories = [...new Set(products.map(product => product.category))];
    categories.forEach(category => {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" class="category-filter" value="${category}">${category}`;
        categoryContainer.appendChild(label);
    });
    document.querySelectorAll('.category-filter').forEach(checkbox => {
        checkbox.addEventListener('change', filterProducts);
    });

}

// Display products with pagination

function displayProducts() {
    productsContainer.innerHTML = '';
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const productsToShow = filteredProducts.slice(start, end);
    productsToShow.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.innerHTML = `<img src="${product.image}" alt="${product.title}">
                                    <h3>${product.title}</h3>
                                    <p>${product.description.substring(0, 100)}...</p>
                                    <span>$${product.price}</span> `;

        productsContainer.appendChild(productCard);
    });
    pageNumber.textContent = currentPage;
    updatePaginationButtons();
}

// Update pagination buttons state

function updatePaginationButtons() {
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage * productsPerPage >= filteredProducts.length;
}

// Filter products based on search, category, price, and availability

function filterProducts() {
    let filtered = [...products];
    // Search filter
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(product => product.title.toLowerCase().includes(searchTerm));
    }
    // Category filter
    const selectedCategories = [...document.querySelectorAll('.category-filter:checked')].map(cb => cb.value);

    if (selectedCategories.length > 0) {
        filtered = filtered.filter(product => selectedCategories.includes(product.category));
    }
    // Price filter
    const maxPrice = parseFloat(priceRange.value);
    filtered = filtered.filter(product => product.price <= maxPrice);
    // Availability filter
    const selectedAvailability = availabilitySelect.value;
    if (selectedAvailability === 'in-stock') {
        filtered = filtered.filter(product => product.rating.count > 0);
    } else if (selectedAvailability === 'out-of-stock') {
        filtered = filtered.filter(product => product.rating.count === 0);
    }

    // Sorting
    const sortBy = sortSelect.value;
    if (sortBy === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
    }
    filteredProducts = filtered;
    currentPage = 1;
    displayProducts();
}

// Event Listeners

searchInput.addEventListener('input', filterProducts);
priceRange.addEventListener('input', () => {
    priceLabel.textContent = `Max Price: $${priceRange.value}`;
    filterProducts();
});

availabilitySelect.addEventListener('change', filterProducts);
sortSelect.addEventListener('change', filterProducts);
prevButton.addEventListener('click', () => {
    currentPage--;
    displayProducts();
});
nextButton.addEventListener('click', () => {
    currentPage++;
    displayProducts();
});
// Initial fetch
fetchProducts();
}
