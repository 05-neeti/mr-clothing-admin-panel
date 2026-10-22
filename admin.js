
/* =========================================================
   MR CLOTHING ADMIN PANEL
   Complete JavaScript application

   Features:
   1. Password-based login
   2. Session handling and logout
   3. Product CRUD (Create, Read, Update, Delete)
   4. Order listing and status updates
   5. LocalStorage persistence
   6. Search, statistics and responsive sidebar
   ========================================================= */


/* ---------- 1. CONFIGURATION ---------- */

// Required by the project specification.
// This is a demonstration-only password, not secure authentication.
const ADMIN_PASSWORD = "kaif9717974894";

const PRODUCT_STORAGE_KEY = "mrClothingProducts";
const ORDER_STORAGE_KEY = "mrClothingOrders";
const LOGIN_SESSION_KEY = "adminLoggedIn";

const ORDER_STATUSES = [
    "Pending",
    "Confirmed",
    "Shipped",
    "Delivered"
];


/* ---------- 2. HTML ELEMENT REFERENCES ---------- */

const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");

const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("errorMessage");

const logoutButton = document.getElementById("logoutButton");
const menuButton = document.getElementById("menuButton");
const sidebar = document.getElementById("sidebar");

const pageTitle = document.getElementById("pageTitle");

const productsSection = document.getElementById("productsSection");
const ordersSection = document.getElementById("ordersSection");

const productFormCard = document.getElementById("productFormCard");
const productForm = document.getElementById("productForm");
const productFormTitle = document.getElementById("productFormTitle");
const productFormError = document.getElementById("productFormError");

const productIdInput = document.getElementById("productId");
const productNameInput = document.getElementById("productName");
const productPriceInput = document.getElementById("productPrice");
const productCategoryInput = document.getElementById("productCategory");
const productImageInput = document.getElementById("productImage");
const productDescriptionInput =
    document.getElementById("productDescription");

const addProductButton = document.getElementById("addProductButton");
const cancelProductButton =
    document.getElementById("cancelProductButton");
const resetProductButton =
    document.getElementById("resetProductButton");

const productsTableBody = document.getElementById("productsTableBody");
const ordersTableBody = document.getElementById("ordersTableBody");

const productSearch = document.getElementById("productSearch");
const orderSearch = document.getElementById("orderSearch");


/* ---------- 3. SAMPLE DATA ---------- */

// Sample products appear when the browser has no saved products.
// Images are optional; placeholder images are used by default.

const sampleProducts = [
    {
        id: "PRD-1001",
        name: "Classic Cotton Shirt",
        price: 799,
        description: "Comfortable cotton shirt for everyday wear.",
        category: "Shirt",
        sizes: ["S", "M", "L", "XL"],
        image: ""
    },
    {
        id: "PRD-1002",
        name: "Premium Black T-Shirt",
        price: 499,
        description: "Classic black T-shirt with a comfortable fit.",
        category: "T-Shirt",
        sizes: ["M", "L", "XL"],
        image: ""
    },
    {
        id: "PRD-1003",
        name: "Slim Fit Blue Jeans",
        price: 1199,
        description: "Versatile blue denim jeans for casual outfits.",
        category: "Jeans",
        sizes: ["S", "M", "L"],
        image: ""
    },
    {
        id: "PRD-1004",
        name: "Formal Trousers",
        price: 999,
        description: "Smart formal trousers for office and occasions.",
        category: "Formal Pant",
        sizes: ["M", "L", "XL"],
        image: ""
    }
];

const sampleOrders = [
    {
        id: "ORD-1001",
        customerName: "Rahul Sharma",
        phone: "9876543210",
        address: "New Delhi, India",
        products: [
            {
                name: "Classic Cotton Shirt",
                quantity: 2
            }
        ],
        total: 1598,
        date: "2026-10-18",
        status: "Pending"
    },
    {
        id: "ORD-1002",
        customerName: "Aman Verma",
        phone: "9876501234",
        address: "Noida, Uttar Pradesh",
        products: [
            {
                name: "Premium Black T-Shirt",
                quantity: 1
            },
            {
                name: "Slim Fit Blue Jeans",
                quantity: 1
            }
        ],
        total: 1698,
        date: "2026-10-19",
        status: "Confirmed"
    },
    {
        id: "ORD-1003",
        customerName: "Vikas Kumar",
        phone: "9812345670",
        address: "Lucknow, Uttar Pradesh",
        products: [
            {
                name: "Formal Trousers",
                quantity: 1
            }
        ],
        total: 999,
        date: "2026-10-20",
        status: "Shipped"
    }
];


/* ---------- 4. LOCALSTORAGE FUNCTIONS ---------- */

// Safely read JSON data from LocalStorage.

function readStorage(key, fallbackValue) {
    try {
        const savedValue = localStorage.getItem(key);

        if (savedValue === null) {
            return fallbackValue;
        }

        const parsedValue = JSON.parse(savedValue);

        return Array.isArray(parsedValue)
            ? parsedValue
            : fallbackValue;
    } catch (error) {
        console.error("Unable to read LocalStorage:", error);
        return fallbackValue;
    }
}


// Save an array to LocalStorage.

function saveStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error("Unable to save LocalStorage:", error);

        alert(
            "The data could not be saved. Check browser storage settings."
        );

        return false;
    }
}


// Load saved data or initialize sample data for the first visit.

function initializeData() {
    if (localStorage.getItem(PRODUCT_STORAGE_KEY) === null) {
        saveStorage(PRODUCT_STORAGE_KEY, sampleProducts);
    }

    if (localStorage.getItem(ORDER_STORAGE_KEY) === null) {
        saveStorage(ORDER_STORAGE_KEY, sampleOrders);
    }
}


// Get the latest products and orders whenever needed.

function getProducts() {
    return readStorage(PRODUCT_STORAGE_KEY, []);
}

function getOrders() {
    return readStorage(ORDER_STORAGE_KEY, []);
}


/* ---------- 5. GENERAL HELPER FUNCTIONS ---------- */

// Escape text before inserting it into generated HTML.

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
        const replacements = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return replacements[character];
    });
}


// Only allow HTTP or HTTPS image URLs.

function safeImageURL(value) {
    if (!value) {
        return "";
    }

    try {
        const parsedURL = new URL(value);

        if (
            parsedURL.protocol === "https:" ||
            parsedURL.protocol === "http:"
        ) {
            return parsedURL.href;
        }
    } catch (error) {
        return "";
    }

    return "";
}


// Format amounts using Indian currency notation.

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(Number(amount) || 0);
}


// Format dates for display.

function formatDate(dateString) {
    if (!dateString) {
        return "—";
    }

    const date = new Date(dateString + "T00:00:00");

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


// Generate unique IDs for new products.

function generateProductId() {
    return "PRD-" +
        Date.now().toString(36).toUpperCase() +
        "-" +
        Math.random().toString(36).slice(2, 6).toUpperCase();
}


/* ---------- 6. LOGIN AND LOGOUT ---------- */

function showLoginPage() {
    loginPage.classList.remove("hidden");
    dashboardPage.classList.add("hidden");

    passwordInput.value = "";
    errorMessage.classList.add("hidden");

    closeSidebar();
}


function showDashboard() {
    loginPage.classList.add("hidden");
    dashboardPage.classList.remove("hidden");

    renderProducts();
    renderOrders();
    updateStatistics();
}


loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const enteredPassword = passwordInput.value;

    if (enteredPassword === ADMIN_PASSWORD) {
        sessionStorage.setItem(LOGIN_SESSION_KEY, "true");

        errorMessage.classList.add("hidden");

        showDashboard();
    } else {
        errorMessage.textContent =
            "Incorrect password. Please try again.";

        errorMessage.classList.remove("hidden");

        passwordInput.value = "";
        passwordInput.focus();
    }
});


// Hide the login error when the user starts typing again.

passwordInput.addEventListener("input", function () {
    errorMessage.classList.add("hidden");
});


// Logout removes the login session but keeps products and orders saved.

logoutButton.addEventListener("click", function () {
    sessionStorage.removeItem(LOGIN_SESSION_KEY);

    showLoginPage();
});


/* ---------- 7. SIDEBAR NAVIGATION ---------- */

document.querySelectorAll(".nav-button").forEach(function (button) {
    button.addEventListener("click", function () {
        const selectedSection = button.dataset.section;

        productsSection.classList.add("hidden");
        ordersSection.classList.add("hidden");

        document.querySelectorAll(".nav-button").forEach(function (navButton) {
            navButton.classList.remove("active");
        });

        button.classList.add("active");

        if (selectedSection === "productsSection") {
            productsSection.classList.remove("hidden");
            pageTitle.textContent = "Product Management";
        }

        if (selectedSection === "ordersSection") {
            ordersSection.classList.remove("hidden");
            pageTitle.textContent = "Order Management";
        }

        closeSidebar();
    });
});


// Open and close the sidebar on smaller screens.

menuButton.addEventListener("click", function () {
    const isOpen = sidebar.classList.toggle("sidebar-open");

    menuButton.setAttribute("aria-expanded", String(isOpen));
});

function closeSidebar() {
    sidebar.classList.remove("sidebar-open");
    menuButton.setAttribute("aria-expanded", "false");
}


/* ---------- 8. PRODUCT FORM ---------- */

// Open a blank form to add a new product.

function openAddProductForm() {
    resetProductForm();

    productFormTitle.textContent = "Add New Product";
    productFormCard.classList.remove("hidden");

    productNameInput.focus();

    productFormCard.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

addProductButton.addEventListener("click", openAddProductForm);


// Reset all form fields and clear validation messages.

function resetProductForm() {
    productForm.reset();
    productIdInput.value = "";

    productFormTitle.textContent = "Add New Product";
    productFormError.textContent = "";
    productFormError.classList.add("hidden");
}

cancelProductButton.addEventListener("click", function () {
    productFormCard.classList.add("hidden");
    resetProductForm();
});

resetProductButton.addEventListener("click", resetProductForm);


// Return all checked sizes.

function getSelectedSizes() {
    return Array.from(
        document.querySelectorAll('input[name="productSize"]:checked')
    ).map(function (checkbox) {
        return checkbox.value;
    });
}


// Save a new product or update an existing product.

productForm.addEventListener("submit", function (event) {
    event.preventDefault();

    productFormError.classList.add("hidden");

    const name = productNameInput.value.trim();
    const price = Number(productPriceInput.value);
    const description = productDescriptionInput.value.trim();
    const category = productCategoryInput.value;
    const sizes = getSelectedSizes();
    const image = safeImageURL(productImageInput.value.trim());

    if (!name || !description || !category) {
        showProductFormError("Please complete all required fields.");
        return;
    }

    if (!Number.isFinite(price) || price <= 0) {
        showProductFormError("Please enter a valid price greater than zero.");
        return;
    }

    if (productImageInput.value.trim() && !image) {
        showProductFormError(
            "Please enter a valid image URL beginning with http:// or https://."
        );
        return;
    }

    if (sizes.length === 0) {
        showProductFormError("Please select at least one available size.");
        return;
    }

    const products = getProducts();
    const existingId = productIdInput.value;

    const productData = {
        id: existingId || generateProductId(),
        name: name,
        price: price,
        description: description,
        category: category,
        sizes: sizes,
        image: image
    };

    let updatedProducts;

    if (existingId) {
        const productExists = products.some(function (product) {
            return product.id === existingId;
        });

        if (!productExists) {
            showProductFormError(
                "This product no longer exists. Refresh the product list and try again."
            );
            return;
        }

        updatedProducts = products.map(function (product) {
            return product.id === existingId ? productData : product;
        });
    } else {
        updatedProducts = [productData, ...products];
    }

    if (!saveStorage(PRODUCT_STORAGE_KEY, updatedProducts)) {
        return;
    }

    productFormCard.classList.add("hidden");
    resetProductForm();

    renderProducts();
    updateStatistics();

    alert(existingId
        ? "Product updated successfully."
        : "Product added successfully."
    );
});


function showProductFormError(message) {
    productFormError.textContent = message;
    productFormError.classList.remove("hidden");
}


/* ---------- 9. DISPLAY PRODUCTS ---------- */

function renderProducts() {
    const products = getProducts();
    const searchTerm = productSearch.value.trim().toLowerCase();

    const filteredProducts = products.filter(function (product) {
        const searchableText = [
            product.name,
            product.category,
            product.description,
            product.id
        ].join(" ").toLowerCase();

        return searchableText.includes(searchTerm);
    });

    productsTableBody.innerHTML = filteredProducts.map(function (product) {
        const imageURL = safeImageURL(product.image);

        const imageMarkup = imageURL
            ? `<img src="${escapeHTML(imageURL)}"
                    alt="${escapeHTML(product.name)}"
                    loading="lazy">`
            : `<span>MR</span>`;

        const sizes = Array.isArray(product.sizes)
            ? product.sizes.join(", ")
            : "—";

        return `
            <tr>
                <td>
                    <div class="product-cell">
                        <div class="product-thumb">${imageMarkup}</div>

                        <div>
                            <div class="product-name">
                                ${escapeHTML(product.name)}
                            </div>

                            <div class="product-subtext">
                                ${escapeHTML(product.id)}
                            </div>
                        </div>
                    </div>
                </td>

                <td>${escapeHTML(product.category)}</td>

                <td>
                    <span class="price-text">
                        ${formatCurrency(product.price)}
                    </span>
                </td>

                <td>${escapeHTML(sizes)}</td>

                <td>
                    <div class="action-group">
                        <button
                            type="button"
                            class="table-action"
                            data-action="edit-product"
                            data-id="${escapeHTML(product.id)}"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="table-action delete"
                            data-action="delete-product"
                            data-id="${escapeHTML(product.id)}"
                        >
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    document.getElementById("productsEmptyMessage")
        .classList.toggle("hidden", filteredProducts.length > 0);

    // Hide broken images and show the MR placeholder instead.

    productsTableBody.querySelectorAll(".product-thumb img")
        .forEach(function (image) {
            image.addEventListener("error", function () {
                const placeholder = document.createElement("span");
                placeholder.textContent = "MR";
                image.replaceWith(placeholder);
            }, { once: true });
        });
}


// Search products while the administrator types.

productSearch.addEventListener("input", renderProducts);


/* ---------- 10. EDIT AND DELETE PRODUCTS ---------- */

// Event delegation handles Edit and Delete buttons in the product table.

productsTableBody.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const productId = button.dataset.id;
    const action = button.dataset.action;

    if (action === "edit-product") {
        editProduct(productId);
    }

    if (action === "delete-product") {
        deleteProduct(productId);
    }
});


// Fill the form with an existing product's information.

function editProduct(productId) {
    const product = getProducts().find(function (item) {
        return item.id === productId;
    });

    if (!product) {
        alert("Product not found.");
        return;
    }

    resetProductForm();

    productIdInput.value = product.id;
    productNameInput.value = product.name;
    productPriceInput.value = product.price;
    productCategoryInput.value = product.category;
    productImageInput.value = safeImageURL(product.image);
    productDescriptionInput.value = product.description;

    const selectedSizes = Array.isArray(product.sizes)
        ? product.sizes
        : [];

    document.querySelectorAll('input[name="productSize"]')
        .forEach(function (checkbox) {
            checkbox.checked = selectedSizes.includes(checkbox.value);
        });

    productFormTitle.textContent = "Edit Product";
    productFormCard.classList.remove("hidden");

    productFormCard.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// Delete a product after confirmation.

function deleteProduct(productId) {
    const products = getProducts();

    const product = products.find(function (item) {
        return item.id === productId;
    });

    if (!product) {
        alert("Product not found.");
        return;
    }

    const confirmed = window.confirm(
        `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) {
        return;
    }

    const remainingProducts = products.filter(function (item) {
        return item.id !== productId;
    });

    if (!saveStorage(PRODUCT_STORAGE_KEY, remainingProducts)) {
        return;
    }

    if (productIdInput.value === productId) {
        productFormCard.classList.add("hidden");
        resetProductForm();
    }

    renderProducts();
    updateStatistics();

    alert("Product deleted successfully.");
}


/* ---------- 11. DISPLAY ORDERS ---------- */

function renderOrders() {
    const orders = getOrders();
    const searchTerm = orderSearch.value.trim().toLowerCase();

    const filteredOrders = orders.filter(function (order) {
        const productsText = Array.isArray(order.products)
            ? order.products.map(function (product) {
                return product.name;
            }).join(" ")
            : "";

        const searchableText = [
            order.id,
            order.customerName,
            order.phone,
            order.address,
            productsText,
            order.status
        ].join(" ").toLowerCase();

        return searchableText.includes(searchTerm);
    });

    ordersTableBody.innerHTML = filteredOrders.map(function (order) {
        const orderProducts = Array.isArray(order.products)
            ? order.products.map(function (product) {
                const quantity = Number(product.quantity) || 1;

                return `
                    <div>
                        ${escapeHTML(product.name)}
                        <span class="product-subtext">
                            × ${quantity}
                        </span>
                    </div>
                `;
            }).join("")
            : "—";

        const safeStatus = ORDER_STATUSES.includes(order.status)
            ? order.status
            : "Pending";

        const statusOptions = ORDER_STATUSES.map(function (status) {
            return `
                <option
                    value="${status}"
                    ${safeStatus === status ? "selected" : ""}
                >
                    ${status}
                </option>
            `;
        }).join("");

        return `
            <tr>
                <td>
                    <div class="order-id">
                        ${escapeHTML(order.id)}
                    </div>

                    <div class="order-subtext">
                        ${escapeHTML(order.address)}
                    </div>
                </td>

                <td>
                    <div class="customer-name">
                        ${escapeHTML(order.customerName)}
                    </div>

                    <div class="order-subtext">
                        ${escapeHTML(order.phone)}
                    </div>
                </td>

                <td>${orderProducts}</td>

                <td>
                    <span class="price-text">
                        ${formatCurrency(order.total)}
                    </span>
                </td>

                <td>${formatDate(order.date)}</td>

                <td>
                    <select
                        class="status-select"
                        data-order-id="${escapeHTML(order.id)}"
                        aria-label="Status for order ${escapeHTML(order.id)}"
                    >
                        ${statusOptions}
                    </select>
                </td>
            </tr>
        `;
    }).join("");

    document.getElementById("ordersEmptyMessage")
        .classList.toggle("hidden", filteredOrders.length > 0);
}


// Search orders by order ID, customer, phone, address, product or status.

orderSearch.addEventListener("input", renderOrders);


/* ---------- 12. UPDATE ORDER STATUS ---------- */

// Changing the dropdown saves the new status immediately.

ordersTableBody.addEventListener("change", function (event) {
    const select = event.target.closest("select[data-order-id]");

    if (!select) {
        return;
    }

    const orderId = select.dataset.orderId;
    const newStatus = select.value;

    if (!ORDER_STATUSES.includes(newStatus)) {
        alert("Invalid order status.");
        renderOrders();
        return;
    }

    const orders = getOrders();

    const orderExists = orders.some(function (order) {
        return order.id === orderId;
    });

    if (!orderExists) {
        alert("Order not found.");
        renderOrders();
        return;
    }

    const updatedOrders = orders.map(function (order) {
        if (order.id === orderId) {
            return {
                ...order,
                status: newStatus
            };
        }

        return order;
    });

    if (!saveStorage(ORDER_STORAGE_KEY, updatedOrders)) {
        renderOrders();
        return;
    }

    updateStatistics();
});


/* ---------- 13. DASHBOARD STATISTICS ---------- */

function updateStatistics() {
    const products = getProducts();
    const orders = getOrders();

    const pendingCount = orders.filter(function (order) {
        return order.status === "Pending";
    }).length;

    const deliveredCount = orders.filter(function (order) {
        return order.status === "Delivered";
    }).length;

    document.getElementById("totalProducts").textContent =
        products.length;

    document.getElementById("totalOrders").textContent =
        orders.length;

    document.getElementById("pendingOrders").textContent =
        pendingCount;

    document.getElementById("ordersPageTotal").textContent =
        orders.length;

    document.getElementById("ordersPagePending").textContent =
        pendingCount;

    document.getElementById("deliveredOrders").textContent =
        deliveredCount;
}


/* ---------- 14. APPLICATION STARTUP ---------- */

// Initialize sample data only on the first visit.
// Existing LocalStorage data is not overwritten.

initializeData();


// Restore the dashboard for the current browser tab if logged in.
// Otherwise, show the login page.

if (sessionStorage.getItem(LOGIN_SESSION_KEY) === "true") {
    showDashboard();
} else {
    showLoginPage();
}
