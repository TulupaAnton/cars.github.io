import { renderProductsCards } from './productCards.js'
import { attachAddToCartListeners } from './productHandlers.js'

const productContainer = document.querySelector('.js-products-list')
const inputSearch = document.getElementById('inputSearch')
const resetFiltersBtn = document.getElementById('resetFilters')

class FilterObserver {
  constructor () {
    this.subscribers = []
  }

  subscribe (fn) {
    this.subscribers.push(fn)
  }

  notify (filter, priceRange, searchValue) {
    this.subscribers.forEach(fn => fn(filter, priceRange, searchValue))
  }
}

const filterObserver = new FilterObserver()
let allProducts = []

function parsePrice (priceStr) {
  return Number(priceStr.replace(/\D/g, ''))
}

function filterProducts (filter, priceRange, searchValue) {
  let filteredProducts = allProducts

  if (filter !== 'All') {
    filteredProducts = filteredProducts.filter(
      product => product.series === filter
    )
  }

  if (searchValue) {
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(searchValue.toLowerCase())
    )
  }

  if (priceRange) {
    const [min, max] = priceRange.split('-').map(num => Number(num) * 1000)
    filteredProducts = filteredProducts.filter(product => {
      const price = parsePrice(product.prices[0])
      return price >= min && price <= max
    })
  }

  productContainer.innerHTML = ''
  renderProductsCards(filteredProducts, productContainer)
  attachAddToCartListeners(filteredProducts)
}

filterObserver.subscribe(filterProducts)

function updateURLParams (filter, priceRange, searchValue) {
  const params = new URLSearchParams(window.location.search)

  if (filter === 'All') {
    params.delete('filter')
  } else {
    params.set('filter', filter)
  }

  if (priceRange) {
    params.set('price', priceRange)
  } else {
    params.delete('price')
  }

  if (searchValue) {
    params.set('search', searchValue)
  } else {
    params.delete('search')
  }

  history.pushState(null, '', '?' + params.toString())
}

export function setupFilters (products) {
  allProducts = products
  inputSearch.value = getSearchFromURL()

  document.querySelectorAll('.filter-btn[data-f]').forEach(button => {
    button.addEventListener('click', event => {
      const filter = event.target.getAttribute('data-f')
      const priceRange = getPriceFromURL()
      const searchValue = getSearchFromURL()
      filterObserver.notify(filter, priceRange, searchValue)
      updateURLParams(filter, priceRange, searchValue)
    })
  })

  document
    .querySelectorAll('.filter-btn[data-price], .filter-price-btn')
    .forEach(button => {
      button.addEventListener('click', event => {
        const priceRange = event.target.getAttribute('data-price')
        const filter = getFilterFromURL()
        const searchValue = getSearchFromURL()
        filterObserver.notify(filter, priceRange, searchValue)
        updateURLParams(filter, priceRange, searchValue)
      })
    })

  inputSearch.addEventListener('input', () => {
    const searchValue = inputSearch.value.trim()
    updateURLParams(getFilterFromURL(), getPriceFromURL(), searchValue)
    filterObserver.notify(getFilterFromURL(), getPriceFromURL(), searchValue)
  })

  resetFiltersBtn.addEventListener('click', () => {
    inputSearch.value = ''
    updateURLParams('All', null, '')
    filterObserver.notify('All', null, '')
  })

  filterObserver.notify(
    getFilterFromURL(),
    getPriceFromURL(),
    getSearchFromURL()
  )
}

function getFilterFromURL () {
  const params = new URLSearchParams(window.location.search)
  return params.get('filter') || 'All'
}

function getPriceFromURL () {
  const params = new URLSearchParams(window.location.search)
  return params.get('price') || null
}

function getSearchFromURL () {
  const params = new URLSearchParams(window.location.search)
  return params.get('search') || ''
}
