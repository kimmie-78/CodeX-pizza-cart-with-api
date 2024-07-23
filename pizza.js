document.addEventListener("alpine:init", () => {
    Alpine.data('pizzaCart', () => {
        return {
            title: 'Pizza Cart API',
            pizzas: [],
            username: '',
            cartId: '',
            cartPizzas: [],
            cartTotal: 0.00,
            paymentAmount: 0,
            change: 0.00,
            message: '',
            orderHistory: [],
            featuredPizzas: [],

            login() {
                if (this.username.length > 2) {
                    localStorage['username'] = this.username;
                    this.createCart();
                } else {
                    alert("Username is too short");
                }
            },
            logout() {
                if (confirm('Do you want to logout?')) {
                    this.username = '';
                    this.cartId = '';
                    localStorage['cartId'] = '';
                    localStorage['username'] = '';
                }
            },
            createCart() {
                if (!this.username) {
                    return Promise.resolve();
                }

                const cartId = localStorage['cartId'];
                if (cartId) {
                    this.cartId = cartId;
                    return Promise.resolve();
                } else {
                    const createCartUrl = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}`;
                    return axios.get(createCartUrl)
                        .then(result => {
                            this.cartId = result.data.cart_code;
                            localStorage['cartId'] = this.cartId;
                        });
                }
            },
            getCart() {
                const getCartUrl = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`;
                return axios.get(getCartUrl);
            },
            addPizza(pizzaId) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/add', {
                    "cart_code": this.cartId,
                    "pizza_id": pizzaId
                });
            },
            removePizza(pizzaId) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/remove', {
                    "cart_code": this.cartId,
                    "pizza_id": pizzaId
                });
            },
            pay(amount) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/pay', {
                    "cart_code": this.cartId,
                    amount
                });
            },
            calculateChange() {
                this.change = (this.paymentAmount - this.cartTotal).toFixed(2);
            },
            showCartData() {
                this.getCart().then(result => {
                    const cartData = result.data;
                    this.cartPizzas = cartData.pizzas;
                    this.cartTotal = cartData.total.toFixed(2);
                    this.calculateChange();
                });
            },
            getOrderHistory() {
                const url = `https://pizza-api.projectcodex.net/api/pizza-cart/history?username=${this.username}`;
                return axios.get(url)
                    .then(result => {
                        this.orderHistory = result.data.orders;
                        console.log("Order History:", this.orderHistory); // Debugging output
                    })
                    .catch(error => {
                        console.error("Error fetching order history:", error);
                    });
            },
            init() {
                axios.get('https://pizza-api.projectcodex.net/api/pizzas')
                    .then(result => {
                        this.pizzas = result.data.pizzas;
                    })
                    .catch(error => {
                        console.error("Error fetching pizzas:", error);
                    });

                const user = localStorage.getItem('username');
                if (user) {
                    this.username = user;
                    this.createCart().then(() => {
                        this.showCartData();
                        this.getOrderHistory(); // Fetch order history after creating cart
                    });
                }
            },
            addPizzaToCart(pizzaId) {
                this.addPizza(pizzaId).then(() => {
                    this.showCartData();
                });
            },
            removePizzaFromCart(pizzaId) {
                this.removePizza(pizzaId).then(() => {
                    this.showCartData();
                });
            },
            payForCart() {
                this.pay(this.paymentAmount).then(result => {
                    if (result.data.status === 'Failure') {
                        this.message = result.data.message;
                        setTimeout(() => this.message = '', 3000);
                    } else {
                        this.message = 'Payment received!';
                        setTimeout(() => {
                            this.message = '';
                            this.cartPizzas = [];
                            this.cartTotal = 0.00;
                            this.paymentAmount = 0;
                            this.change = 0.00;
                            this.createCart();
                            this.getOrderHistory(); // Refresh the order history
                        }, 3000);
                    }
                });
            },
            setFeaturedPizza(pizzaId) {
                axios.post('https://pizza-api.projectcodex.net/api/pizzas/featured', {
                    "username": this.username,
                    "pizza_id": pizzaId
                }).then(() => {
                    this.getFeaturedPizzas();
                });
            },
            getFeaturedPizzas() {
                const url = `https://pizza-api.projectcodex.net/api/pizzas/featured?username=${this.username}`;
                axios.get(url).then(result => {
                    this.featuredPizzas = result.data.pizzas;
                });
            }
        }
    });
});
