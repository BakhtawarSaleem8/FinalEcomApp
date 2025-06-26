export function fetchLoggedInUserOrders() {
  return new Promise(async (resolve , reject) =>{
    try{
 const response = await fetch(`${import.meta.VITE_BACKEND_URI}/orders/own/`, {
        method: 'GET',
        headers: { 'content-type': 'application/json' },
         credentials: 'include'
      }) 

      if (response.ok) {
        const data = await response.json();
        resolve({ data });
        console.log(data , "myorders")
      } else {
        const error = await response.text();
        reject(error);
        console.log(error , "myorders error")
      }
    } catch (error) {
      reject( error );
      console.log(error , "myorders error")
    }
   
  }
  );
}


export function fetchLoggedInUser() {
  return new Promise(async (resolve , reject) =>{
 try {
      const response = await fetch(`${import.meta.VITE_BACKEND_URI}/users/own`, {
        method: 'GET',
        headers: { 'content-type': 'application/json' },
         credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        resolve({ data });
      } else {
        const error = await response.text();
        reject(error);
      }
    } catch (error) {
      reject( error );
    }
  }
  );
}

export function updateUser(update) {
  return new Promise(async (resolve) => {
    try {
      const response = await fetch(`${import.meta.VITE_BACKEND_URI}/users/${update.id}`, {
        method: 'PATCH',
        body: JSON.stringify(update),
        headers: { 'content-type': 'application/json' },
        credentials: 'include'
      });
      const data = await response.json();
      resolve({ data });
    } catch (error) {
      reject(error)
    }
  });
}