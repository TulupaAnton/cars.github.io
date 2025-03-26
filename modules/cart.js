let cartItems = JSON.parse(localStorage.getItem('cartItems')) || []
let totalAmount = parseFloat(localStorage.getItem('totalAmount')) || 0

const cartItemCount = document.querySelector('.cart-count')
const cartItemList = document.querySelector('.cart-items')
const cartTotal = document.querySelector('.cart-total')

function saveCartToLocalStorage () {
  localStorage.setItem('cartItems', JSON.stringify(cartItems))
  localStorage.setItem('totalAmount', totalAmount.toFixed(2))
}

function updateCartUI () {
  updateCartItemCount(cartItems.reduce((acc, item) => acc + item.quantity, 0))
  updateCartItems()
  updateCartTotal()
  saveCartToLocalStorage()
}

const cartProxy = new Proxy(
  { cartItems, totalAmount },
  {
    set (target, prop, value) {
      target[prop] = value
      updateCartUI()
      return true
    }
  }
)

function updateCartItemCount (count) {
  cartItemCount.textContent = count
}

function updateCartItems () {
  cartItemList.innerHTML = ''
  cartProxy.cartItems.forEach((item, index) => {
    const cartItem = document.createElement('div')
    cartItem.classList.add('cart-item', 'individual-cart-item')
    cartItem.innerHTML = `
      <span class="cart-item-name">${item.name}</span>
      <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
      <div class='cart-controls'>
        <button class="decrease-btn" data-index="${index}">-</button>
        <span>${item.quantity}</span>
        <button class="increase-btn" data-index="${index}">+</button>
      </div>
      <span class='cart-item-price'>$${(item.price * item.quantity).toFixed(
        2
      )}</span>
      <button class="remove-btn" data-index="${index}">
        <i class="fa-solid fa-times"></i>
      </button>`

    cartItemList.append(cartItem)
  })

  document.querySelectorAll('.remove-btn').forEach(button => {
    button.addEventListener('click', event => {
      const index = event.target.closest('.remove-btn').dataset.index
      removeItemsFromCart(index)
    })
  })

  document.querySelectorAll('.increase-btn').forEach(button => {
    button.addEventListener('click', event => {
      const index = event.target.dataset.index
      cartProxy.cartItems[index].quantity++
      cartProxy.totalAmount += cartProxy.cartItems[index].price
    })
  })

  document.querySelectorAll('.decrease-btn').forEach(button => {
    button.addEventListener('click', event => {
      const index = event.target.dataset.index
      if (cartProxy.cartItems[index].quantity > 1) {
        cartProxy.cartItems[index].quantity--
        cartProxy.totalAmount -= cartProxy.cartItems[index].price
      } else {
        removeItemsFromCart(index)
      }
    })
  })
}

function removeItemsFromCart (index) {
  const removedItem = cartProxy.cartItems.splice(index, 1)[0]
  cartProxy.totalAmount -= removedItem.price * removedItem.quantity
}

function updateCartTotal () {
  cartTotal.textContent = `$${cartProxy.totalAmount.toFixed(2)}`
}

export function addToCart (product) {
  const existingItem = cartProxy.cartItems.find(
    cartItem => cartItem.name === product.name
  )
  if (existingItem) {
    existingItem.quantity++
  } else {
    cartProxy.cartItems.push({ ...product, quantity: 1 })
  }
  cartProxy.totalAmount += product.price
}

export function setupCartHandlers () {
  document.querySelector('.cart-container').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open')
  })

  document.querySelector('.sidebar-close').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open')
  })
}

updateCartUI()
