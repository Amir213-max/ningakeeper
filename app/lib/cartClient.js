import { graphqlClient } from "./graphqlClient";
import { gql } from "graphql-request";

// جلب كارت المستخدم
export const GET_USER_CART = gql`
  query GetUserCart($userId: ID!) {
    userCart(user_id: $userId) {
      id
      items {
        id
        quantity
        unit_price
        product {
          id
          name
          list_price_amount
          images
        }
      }
    }
  }
`;

// إضافة عنصر للكارت
export const ADD_ITEM_TO_CART = gql`
  mutation AddItemToCart($input: AddCartItemInput!) {
    addItemToCart(input: $input) {
      id
      quantity
      product {
        id
        name
        list_price_amount
        images
      }
    }
  }
`;

// تحديث عنصر
export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($id: ID!, $input: UpdateCartItemInput!) {
    updateCartItem(id: $id, input: $input) {
      id
      quantity
    }
  }
`;

// حذف عنصر
export const REMOVE_CART_ITEM = gql`
  mutation RemoveItemFromCart($id: ID!) {
    removeItemFromCart(id: $id) {
      id
    }
  }
`;
