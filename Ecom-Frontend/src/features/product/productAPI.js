
export function fetchProductById(id) {
  return new Promise(async (resolve) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/products/${id}`, {
      credentials:"include"
    });
    const data = await response.json();
    resolve({ data });
  });
}

export function createProduct(product) {
  return new Promise(async (resolve) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/products/`, {
      method: 'POST',
      body: JSON.stringify(product),
      headers: { 'content-type': 'application/json' },
    });
    const data = await response.json();
    resolve({ data });
  });
}

export function updateProduct(update) {
  return new Promise(async (resolve) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URI}/products/${update.id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(update),
        headers: { 'content-type': 'application/json' },
      }
    );
    const data = await response.json();
    resolve({ data });
  });
}

export function fetchProductsByFilters(filter, sort, pagination, admin) {
  // filter = {"category":["smartphone","laptops"]}
  // sort = {_sort:"price",_order="desc"}
  // pagination = {_page:1,_limit=10}
console.log(filter , "filterrr")
  let queryString = '';
  for (let key in filter) {
    const categoryValues = filter[key];
    if (categoryValues.length) {
      console.log(categoryValues , "category values")
      queryString += `${key}=${categoryValues}&`;
            console.log("query string" , queryString)
    }
  }
  for (let key in sort) {
    queryString += `${key}=${sort[key]}&`;
  }
  for (let key in pagination) {
    queryString += `${key}=${pagination[key]}&`;
  }
  if(admin){
    queryString += `admin=true`;
  }

  return new Promise(async (resolve) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URI}/products?${queryString}` ,{
        credentials:"include"
      }
    );
    const data = await response.json();
    console.log(data , "products data")
    const totalItems = await response.headers.get('X-Total-Count');
    resolve({ data: { products: data, totalItems: +totalItems } });
  });
}

export function fetchCategories() {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/categories`,{
        credentials:"include"
      });
      
      if (!response.ok) {
        // Handle HTTP errors (4xx, 5xx)
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(data, "category data");
      resolve({ data });
      
    } catch (error) {
      console.error("Error fetching categories:", error);
      
      // Return a structured error object
      reject({ 
        error: true,
        message: error.message || "Failed to fetch categories",
        status: error.response?.status || 500
      });
    }
  });
}

export function fetchBrands() {
  return new Promise(async (resolve) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/brands`,{
      credentials:"include"
    });
    const data = await response.json();
    resolve({ data });
  });
}
