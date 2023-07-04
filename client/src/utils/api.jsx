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
  GetStoreProducts: async (storeId) => {
    const response = await fetch(
      `${hostName}${version}/store/${storeId}/products`
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
  GetUserInfo: async (token) => {
    const response = await fetch(`${hostName}${version}/user/order/info`, {
      headers: new Headers({
        Authorization: `Bearer ${token}`,
      }),
    });
    const result = await response.json();
    return result;
  },
  GetProductStore: async (storeId) => {
    const response = await fetch(
      `${hostName}${version}/product/store/${storeId}`
    );
    const result = await response.json();
    return result;
  },
  ChangeRole: async (storeId, userId, roleId, token) => {
    const response = await fetch(
      `${hostName}${version}/store/${storeId}/user/${userId}/role/update`,
      {
        method: "PUT",
        headers: new Headers({
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          role_id: roleId,
        }),
      }
    );
    const result = await response.json();
    return result;
  },
  CreateProduct: async (data, token) => {
    const formData = new FormData();
    formData.append("store_id", data.store_id);
    formData.append("name", data.name);
    formData.append("category", data.category);
    formData.append("description", data.description);
    formData.append("main_image", data.main_image);
    formData.append("images", data.images);
    data.variants.forEach((ele) => {
      formData.append("kind", ele.kind);
      formData.append("stock", ele.stock);
      formData.append("price", ele.price);
    });
    const response = await fetch(`${hostName}${version}/product/insert`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const result = await response.json();
    return result;
  },
};
export default api;
