const hostName = import.meta.env.VITE_DEV_HOST_NAME || "";
const version = "/api/1.0";

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
    data.images.map((ele) => formData.append("images", ele));
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
  GetStoreChat: async (storeId, token) => {
    const response = await fetch(
      `${hostName}${version}/store/${storeId}/chat/users/message`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const result = await response.json();
    return result;
  },
  GetStoreChatMessage: async (storeId, userId, token) => {
    const response = await fetch(
      `${hostName}${version}/store/${storeId}/chat/user/${userId}/message`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const result = await response.json();
    return result;
  },
  GetStoreUserOrders: async (storeId, userId, token) => {
    const response = await fetch(
      `${hostName}${version}/store/${storeId}/user/${userId}/orders`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const result = await response.json();
    return result;
  },
  GetUserChat: async (token) => {
    const response = await fetch(`${hostName}${version}/chats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    return result;
  },
  GetUserChatMessage: async (token, storeId) => {
    const response = await fetch(
      `${hostName}${version}/chat/${storeId}/message`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const result = await response.json();
    return result;
  },
  CreateStore: async (name, city, district, token) => {
    const response = await fetch(`${hostName}${version}/store`, {
      method: "POST",
      headers: new Headers({
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        name,
        city,
        district,
      }),
    });
    const result = await response.json();
    return result;
  },
  CreateStaff: async (email, storeId, role, token) => {
    const response = await fetch(
      `${hostName}${version}/store/${storeId}/user`,
      {
        method: "POST",
        headers: new Headers({
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          email,
          role_id: role,
        }),
      }
    );
    const result = await response.json();
    return result;
  },
  DeleteStaff: async (storeId, staffId, token) => {
    const response = await fetch(
      `${hostName}${version}/store/${storeId}/user/${staffId}/role/delete`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const result = await response.json();
    return result;
  },
  GetUser: async (token) => {
    const response = await fetch(`${hostName}${version}/user/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    return result;
  },
  DeleteProduct: async (productId, storeId, token) => {
    const response = await fetch(
      `${hostName}${version}/product/${productId}/delete`,
      {
        method: "DELETE",
        headers: new Headers({
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          store_id: storeId,
        }),
      }
    );
    const result = await response.json();
    return result;
  },
  GetSearchProduct: async (keyword) => {
    const response = await fetch(
      `${hostName}${version}/products/search?keyword=${keyword}`,
      { method: "GET" }
    );
    const result = await response.json();
    return result;
  },
};
export default api;
