const CreateProductRoles = [1, 2, 3, 5];
const RemoveProductRoles = [1, 2, 3];
const GivePermissionRoles = [1, 2, 3, 4];
const CustomerServiceRoles = [1, 2, 4, 6, 8];

const checkRoles = {
  createProduct: (roles) => {
    const isRole = roles.some((ele) => CreateProductRoles.includes(ele));
    return isRole;
  },
  removeProduct: (roles) => {
    const isRole = roles.some((ele) => RemoveProductRoles.includes(ele));
    return isRole;
  },
  Permission: (roles) => {
    const isRole = roles.some((ele) => GivePermissionRoles.includes(ele));
    return isRole;
  },
  CustomerService: (roles) => {
    const isRole = roles.some((ele) => CustomerServiceRoles.includes(ele));
    return isRole;
  },
};

export default checkRoles;
