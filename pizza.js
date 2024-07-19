document.addEventListener("alpine:init", () => {
    Alpine.data('pizzaCart', () => {
        return {
            title: 'Pizza Cart API',
            pizzas: [],
            username: 'kimmie-78',
            cartId: 'kv4xr0kv44',
            cartPizzas: [],
            cartTotal: 0.00,
            getCart() {
                const getCartUrl = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`
                return axios.get(getCartUrl)
            },
            addPizza(pizzaId) {

                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/add',{
                    "cart_code" : this.cartId,
                    "pizza_id" :pizzaId
             } )


            },
            removePizza(pizzaId) {

                return axios.post(' https://pizza-api.projectcodex.net/api/pizza-cart/remove',{
                    "cart_code" : this.cartId,
                    "pizza_id" :pizzaId
             } )


            },

            showCartData() {
                this.getCart().then(result => {
                    console.log(result.data);
                    const cartData = result.data;
                    this.cartPizzas = cartData.pizzas;
                    this.cartTotal = cartData.total.toFixed(2);
                    //alert(this,this.cartTotal);
                })

            },
            init() {
                axios
                    .get('https://pizza-api.projectcodex.net/api/pizzas')
                    .then(result => {

                        //console.log(result.data);
                        this.pizzas = result.data.pizzas
                    });

                this.showCartData();

            },
            addPizzaToCart(pizzaId) {
                //alert(pizzaId)
                this.addPizza(pizzaId)
                .then(() =>{
                    this.showCartData();
                    
                }
                )


            },
            removePizzaFromCart(pizzaId) {
                //alert(pizzaId)
                this.removePizza(pizzaId)
                .then(() =>{
                    this.showCartData();
                    
                }
                )

            }
        }

    });


});