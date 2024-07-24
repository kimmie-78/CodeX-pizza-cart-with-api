document.addEventListener("alpine:init", () => {
    Alpine.data('pizzaCart', () => {
        return {
            title: 'Pizza Cart API',
            pizzas: [],
            username: '',
            cartId: '',
            cartPizzas: [],
            cartData: {},
            cartTotal: 0.00,
            paymentAmount: 0,
            change: 0.00,
            message: '',
            showHistory: false,
            history: [],
            featuredPizzas: [],
            cartVisible: false,

            login() {
                if (this.username.length > 2) {
                    localStorage['username'] = this.username;
                    this.createCart().then(() => {
                        this.showCartData();
                        this.getCartHistory();
                    });
                } else {
                    alert("Username is too short");
                }
            },
            logout() {
                if (confirm('Do you want to logout?')) {
                    this.username = '';
                    this.cartId = '';
                    localStorage.removeItem('cartId');
                    localStorage.removeItem('username');
                    this.clearCartHistory();
                    this.cartPizzas = [];
                    this.cartTotal = 0.00;
                    this.paymentAmount = 0;
                    this.change = 0.00;
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
            clearCartHistory() {
                localStorage.removeItem(`cartHistory_${this.username}`);
                this.history = [];
            },
            getCartHistory() {
                this.history = JSON.parse(localStorage.getItem(`cartHistory_${this.username}`)) || [];
                console.log(this.history, 'history');
            },
            pay(amount) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/pay', {
                    "cart_code": this.cartId,
                    amount
                }).then(result => {
                    if (result.data.status !== 'failure') {
                        this.history.push(this.cartData);
                        localStorage.setItem(`cartHistory_${this.username}`, JSON.stringify(this.history));
                        this.getCartHistory();
                    }
                    return result;
                });
            },
            calculateChange() {
                this.change = (this.paymentAmount - this.cartTotal).toFixed(2);
            },
            showCartData() {
                this.getCart().then(result => {
                    const cartData = result.data;
                    this.cartData = cartData;
                    this.cartPizzas = cartData.pizzas;
                    this.cartTotal = cartData.total.toFixed(2);
                    this.calculateChange();
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
                        this.getCartHistory();
                    });
                }
            },
            addPizzaToCart(pizzaId) {
                this.addPizza(pizzaId).then(() => {
                    this.showCartData();
                    this.cartVisible = true;
                });
            },
            removePizzaFromCart(pizzaId) {
                this.removePizza(pizzaId).then(() => {
                    this.showCartData();
                });
            },
            payForCart() {
                if (this.cartPizzas.length === 0) {
                    this.message = 'Your cart is empty. Please add pizzas to your cart before making a payment.';
                    setTimeout(() => this.message = '', 3000);
                    return;
                }

                this.pay(this.paymentAmount).then(result => {
                    if (result.data.status === 'failure') {
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

                            localStorage['cartId'] = '';
                            this.cartId = '';
                            this.cartVisible = false;

                            this.createCart().then(() => {
                                this.showCartData();
                                this.getCartHistory();
                            });
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
            },
            showHistoryEvent() {
                this.showHistory = !this.showHistory;
            }
        }
    });
});
