let cart = [];
let slideIndex = 0;
let loggedInUser = localStorage.getItem("loggedInUser") || null;

setInterval(() => {
    let slides = document.querySelectorAll('.slide');
    slides.forEach(s => s.classList.remove('active'));
    slideIndex = (slideIndex + 1) % slides.length;
    slides[slideIndex].classList.add('active');
}, 3000);

async function fetchProducts() {
    try {
        let res = await fetch("https://fakestoreapi.com/products");
        let data = await res.json();
        showProducts(data.slice(0, 4));
    } catch (err) {
        console.log("Error:", err);
    }
}

function showProducts(items) {
    let list = document.getElementById("product-list");
    list.innerHTML = "";
    items.forEach(p => {
        let card = document.createElement("div");
        card.classList.add("product-card");
        card.innerHTML = `
            <img src="${p.image}" alt="${p.title}">
            <h3>${p.title}</h3>
            <p>$${p.price}</p>
            <button onclick="addToCart(${p.id}, '${p.title}', ${p.price})">Add to Cart</button>
        `;
        list.appendChild(card);
    });
}

function addToCart(id, title, price) {
    if (!loggedInUser) {
        alert("Please register or log in first!");
        return;
    }

    let existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, title, price, quantity: 1 });
    }
    alert("Item added to cart!");
    updateCartUI();
}

function updateCartUI() {
    let cartBtn = document.getElementById("cart-btn");
    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBtn.innerHTML = `Cart (${totalItems})`;
}

document.getElementById("login-btn").addEventListener("click", () => {
    showPage("Sign In", `
        <div class="auth-box">
            <h2>Sign In</h2>
            <input type="text" id="login-username" placeholder="Username">
            <input type="password" id="login-password" placeholder="Password">
            <button onclick="loginUser()">Sign In</button>
            <p>New here? <a href="#" id="register-link">Register</a></p>
            <a class="back-home" href="#" onclick="showMain()">Back to Home</a>
        </div>
    `);
});

document.getElementById("register-btn").addEventListener("click", () => {
    showPage("Register", `
        <div class="auth-box">
            <h2>Register</h2>
            <input type="text" id="register-username" placeholder="Username">
            <input type="email" id="register-email" placeholder="Email">
            <input type="password" id="register-password" placeholder="Password">
            <button onclick="registerUser()">Register</button>
            <p>Already registered? <a href="#" id="signin-link">Sign In</a></p>
            <a class="back-home" href="#" onclick="showMain()">Back to Home</a>
        </div>
    `);
});

function registerUser() {
    let username = document.getElementById("register-username").value;
    let email = document.getElementById("register-email").value;
    let password = document.getElementById("register-password").value;

    if (!username || !email || !password) {
        alert("All fields are required!");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    
    if (users.find(user => user.username === username)) {
        alert("Username already exists. Please choose another one.");
        return;
    }

    users.push({ username, email, password });
    localStorage.setItem("users", JSON.stringify(users));
    
    alert("User registered successfully! Please log in.");
    showMain();
}

function loginUser() {
    let username = document.getElementById("login-username").value;
    let password = document.getElementById("login-password").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    let user = users.find(user => user.username === username && user.password === password);
    
    if (user) {
        alert("Login Successful!");
        localStorage.setItem("loggedInUser", username);
        loggedInUser = username;
        updateAuthUI();
        showMain();
    } else {
        alert("Invalid username or password!");
    }
}

function logoutUser() {
    localStorage.removeItem("loggedInUser");
    loggedInUser = null;
    updateAuthUI();
    showMain();
}

function updateAuthUI() {
    let loginBtn = document.getElementById("login-btn");
    let registerBtn = document.getElementById("register-btn");

    if (loggedInUser) {
        loginBtn.innerText = `Welcome, ${loggedInUser}`;
        registerBtn.innerText = "Logout";
        registerBtn.onclick = logoutUser;
    } else {
        loginBtn.innerText = "Sign In";
        registerBtn.innerText = "Register";
        registerBtn.onclick = () => document.getElementById("register-btn").click();
    }
}

document.getElementById("cart-btn").addEventListener("click", () => {
    if (!loggedInUser) {
        alert("Please log in to access your cart!");
        return;
    }

    if (cart.length === 0) {
        alert("Your cart is empty! Please add items first.");
        return;
    }

    showPage("Cart", `
        <div class="auth-box">
            <h2>Your Cart</h2>
            <div id="cart-items"></div>
            <p>Total: $<span id="cart-total">0.00</span></p>
            <button onclick="buyNow()" class="buy-now">Buy Now</button>
            <a class="back-home" href="#" onclick="showMain()">Back to Home</a>
        </div>
    `);
    updateCartDisplay();
});

function updateCartDisplay() {
    let cartItemsContainer = document.getElementById("cart-items");
    let cartTotal = document.getElementById("cart-total");

    cartItemsContainer.innerHTML = "";
    let totalPrice = 0;

    cart.forEach(item => {
        totalPrice += item.price * item.quantity;
        let cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.innerHTML = `
            <p>${item.title} - $${item.price} x ${item.quantity}</p>
            <button onclick="removeFromCart(${item.id})">Remove</button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    cartTotal.textContent = totalPrice.toFixed(2);
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
    updateCartDisplay();
}

function buyNow() {
    if (cart.length === 0) {
        alert("Your cart is empty! Add items before buying.");
        return;
    }
    alert("Thank you for your purchase!");
    cart = [];
    updateCartUI();
    showMain();
}

function showPage(title, content) {
    document.getElementById("main-content").style.display = "none";
    let authCart = document.getElementById("auth-cart-section");
    authCart.innerHTML = content;
    authCart.style.display = "block";
}

function showMain() {
    document.getElementById("main-content").style.display = "block";
    document.getElementById("auth-cart-section").style.display = "none";
}

fetchProducts();
updateAuthUI();
