export function createOrder(order) {
  return new Promise(async (resolve) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/orders`, {
      method: 'POST',
      body: JSON.stringify(order),
      headers: { 'content-type': 'application/json' },
      credentials:'include'
    });
    const data = await response.json();
    resolve({ data });
  });
}

export function updateOrder(order) {
  return new Promise(async (resolve) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/orders/${order.id}`, {
      method: 'PATCH',
      body: JSON.stringify(order),
      headers: { 'content-type': 'application/json' },
      credentials:"include"
    });
    const data = await response.json();
    resolve({ data });
  });
}

export function fetchAllOrders(sort, pagination) {
 let queryString = '';

 for (let key in sort) {
  queryString += `${key}=${sort[key]}&`;
}
  for (let key in pagination) {
    queryString += `${key}=${pagination[key]}&`;
  }

  return new Promise(async (resolve) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URI}/orders${queryString}`,{
        method: 'GET',
        credentials:'include'
      }
    );
    const data = await response.json();
    const totalOrders =  response.headers.get('X-Total-Count');
    resolve({ data: { orders: data, totalOrders: +totalOrders } });
    console.log(data , "resolve admin orders")
  });
}