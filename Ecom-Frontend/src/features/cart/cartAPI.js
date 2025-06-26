export function addToCart(item) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Adding to cart:", item);
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/cart`, {
        method: 'POST',
        body: JSON.stringify(item),
        headers: { 
          'Content-Type': 'application/json' 
        },
        credentials: 'include'
      });

      // Check if response was successful (status code 2xx)
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add item to cart');
      }

      const data = await response.json();
      resolve({ data });
      
    } catch (error) {
      console.error("Error adding to cart:", error);
      reject(error);
    }
  });
}

export function fetchItemsByUserId() {
  return new Promise(async (resolve) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/cart` ,{
              credentials: 'include'})

    const data = await response.json();
    console.log(data , "cartItemsData")
    resolve({ data });
  });
}

export function updateCart(update) {
  return new Promise(async (resolve) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/cart/` + update.id, {
      method: 'PATCH',
      body: JSON.stringify(update),
      headers: { 'content-type': 'application/json' },
               credentials: 'include'

    });
    const data = await response.json();
    resolve({ data });
  });
}

export function deleteItemFromCart(itemId) {
  return new Promise(async (resolve) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/cart/`+ itemId, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
               credentials: 'include'

    });
    const data = await response.json();
    resolve({ data: { id: itemId } });
  });
}

export function resetCart() {
  // get all items of user's cart - and then delete each
  return new Promise(async (resolve) => {
    const response = await fetchItemsByUserId();
    const items = response.data;
    for (let item of items) {
      await deleteItemFromCart(item.id);
    }
    resolve({ status: 'success' });
  });
}