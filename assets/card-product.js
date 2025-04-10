async function getProductData(productUrl) {
  const cacheTtl = 1000 * 60; // 1 min
  const cachedData = sessionStorage.getItem(productUrl);
  let productData = cachedData && JSON.parse(cachedData);
  
  const now = new Date().getTime();

  if (!productData || now - productData._cacheTime > cacheTtl) {
    productData = await fetch(productUrl)
      .then((response) => response.json())
      .catch((error) => {
        console.error('Error fetching product data: ', error);
      });
    productData._cacheTime = now;
    sessionStorage.setItem(productUrl, JSON.stringify(productData));
  }

  return productData;
}

async function selectVariant(productHandle, variantId, mainImageUrl, hoverImageUrl) {
  const productCard = document.getElementById(`${productHandle}-product-card`);
  const price = productCard.querySelector(`#${productHandle}-price`);
  const compareAtPrice = productCard.querySelector(`#${productHandle}-compare-price`);
  const badge = productCard.querySelector(`#${productHandle}-badge`);
  const productImage = productCard.querySelector(`#${productHandle}-product-image`);
  const productUrl = '/products/' + productHandle + '.js';

  if (productImage) {
    productImage.src = mainImageUrl;
    productImage.setAttribute('data-main', mainImageUrl);
    productImage.setAttribute('data-hover', hoverImageUrl || mainImageUrl);
  }

  const productData = await getProductData(productUrl);
  updateProductCard(productData, variantId, price, compareAtPrice, badge);

  const swatchButtons = productCard.querySelectorAll(`button.option`);
  swatchButtons.forEach((button) => {
    const isSelected = button.getAttribute('data-variant-id') == variantId;
    button.setAttribute('data-is-selected', isSelected ? 'true' : 'false');
    if (isSelected) {
      button.classList.add('active-swatch');
    } else {
      button.classList.remove('active-swatch');
    }
  });
}

function updateProductCard(productData, variantId, price, compareAtPrice, badge) {
  const selectedVariant = productData.variants.find((v) => v.id == variantId);
  if (selectedVariant) {
    const currency = price.innerHTML.charAt(0);
    price.innerHTML = currency + (Number(selectedVariant.price) / 100).toFixed(2);
    if (selectedVariant.compare_at_price && Number(selectedVariant.compare_at_price) > Number(selectedVariant.price)) {
      badge.classList.remove('hidden');
      compareAtPrice.classList.remove('hidden');
      compareAtPrice.innerHTML = currency + (Number(selectedVariant.compare_at_price) / 100).toFixed(2);
    } else {
      badge.classList.add('hidden');
      compareAtPrice.classList.add('hidden');
    }
  }
}
