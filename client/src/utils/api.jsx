const hostName = "http://localhost:3000/api/";
const version = "1.0";

const api = {
  SignIn: async (email, password) => {
    const response = await fetch(`${hostName}${version}/user/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
        provider: "native",
      }),
    });
    const result = await response.json();
    return result;
  },
  SignUp: async (name, email, password) => {
    const response = await fetch(`${hostName}${version}/user/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
      }),
    });
    const result = await response.json();
    return result;
  },
  GetSnapUpProduct: async (id) => {
    const response = await fetch(`${hostName}${version}/snapup/${id}`);
    const result = await response.json();
    return result;
  },
  GetStoreProducts: async (storeId, token) => {
    const response = await fetch(
      `${hostName}${version}/store/${storeId}/products`,
      {
        headers: new Headers({
          Authorization: `Bearer ${token}`,
        }),
      }
    );
    const result = await response.json();
    return result;
  },
  GetUserStores: async (token) => {
    const response = await fetch(`${hostName}${version}/stores`, {
      method: "GET",
      headers: new Headers({
        Authorization: `Bearer ${token}`,
      }),
    });
    const result = await response.json();
    return result;
  },
  GetStoreStaff: async (storeId, token) => {
    const response = await fetch(
      `${hostName}${version}/store/${storeId}/users`,
      {
        headers: new Headers({
          Authorization: `Bearer ${token}`,
        }),
      }
    );
    const result = await response.json();
    return result;
  },
  GetStoreOwnRole: async (storeId, token) => {
    const response = await fetch(`${hostName}${version}/store/${storeId}`, {
      headers: new Headers({
        Authorization: `Bearer ${token}`,
      }),
    });
    const result = await response.json();
    return result;
  },
  GetUserRoles: async (storeId, token, userId) => {
    const response = await fetch(
      `${hostName}${version}/store/${storeId}/user/${userId}/roles`,
      {
        headers: new Headers({
          Authorization: `Bearer ${token}`,
        }),
      }
    );
    const result = await response.json();
    return result;
  },
  GetProducts: async () => {
    const response = await fetch(`${hostName}${version}/products`);
    const result = await response.json();
    return result;
  },
  GetProduct: async (id) => {
    const response = await fetch(`${hostName}${version}/product/${id}`);
    const result = await response.json();
    return result;
  },
};
export default api;
