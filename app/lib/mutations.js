// lib/mutations.js
import { gql } from "graphql-request";
import { graphqlClient } from "./graphqlClient";
import { v4 as uuidv4 } from "uuid"; 


export async function createOrderFromCurrentCart() {
    try {
      // 1️⃣ جلب الكارت الحالي
      const cart = await fetchUserCart();
  
      // 2️⃣ تجهيز input
      const input = {
        payment_status: "PROCESSING",
        tags: ["web_order"],
        tracking_urls: [],
        published: true,
      };
  
      // 3️⃣ استدعاء الـ mutation مع cart_id
      const response = await graphqlClient.request(CREATE_ORDER_FROM_CART, {
        cart_id: cart_id,  // ⚠️ cart_id مطلوب
        input: {
          payment_status: "PROCESSING",
          shipping_type: "normal",
          empty_cart: true,
          reference_id: "WEB-TEST-123"
        }
      });
  
      console.log("✅ Order Created:", response.createOrderFromCart);
      return response.createOrderFromCart;
  
    } catch (error) {
      console.error("❌ Error creating order from cart:", error);
      throw error;
    }
  }
  


export const TEMP_USER_ID = 1;

// --- Queries & Mutations ---

const GET_USER_CART = gql`
  query UserCart($user_id: ID!) {
    userCart(user_id: $user_id) {
      id
      items {
        id
        quantity
        product {
          images
          offer_code
          id
          name
          list_price_amount
      list_price_currency
      relative_list_price_difference
      price_range_from
      price_range_to
      price_range_currency
      price_range_exact_amount
      price_range_maximum_amount
      price_range_minimum_amount
        }
      }
    }
  }
`;



export const ADD_TO_WISHLIST = gql`
  mutation AddToWishlist($input: AddToWishlistInput!) {
    addToWishlist(input: $input) {
      success
      message
      wishlist_item {
        id
        product {
          id
          name
        }
      }
    }
  }
`;


const CREATE_CART = gql`
  mutation CreateCart($input: CartInput!) {
    createCart(input: $input) {
      id
      user_id
      items {
        id
       
      }
    }
  }
`;

const ADD_ITEM_TO_CART = gql`
  mutation AddItemToCart($input: AddCartItemInput!) {
    addItemToCart(input: $input) {
      id
      quantity
      product {
        id
        name
        list_price_amount
        list_price_currency
        relative_list_price_difference
        price_range_from
        price_range_to
        price_range_currency
        price_range_exact_amount
        price_range_maximum_amount
        price_range_minimum_amount
      }
    }
  }
`;

export const CREATE_ORDER_FROM_CART = gql`
mutation CreateOrderFromCart($cart_id: ID!, $input: CreateOrderFromCartInput!) {
  createOrderFromCart(cart_id: $cart_id, input: $input) {
    id
    user{
      name
      name
      email
      phone
    gender
      created_at
      updated_at
      
    }
    number
    shipping_type
    shipping_cost
    total_amount
    vat_amount
  }
}
`;



export const EMPTY_CART = gql`
  mutation EmptyCart($cart_id: ID!) {
    emptyCart(cart_id: $cart_id) {
      id
    }
  }
`;
  


export const REMOVE_ITEM_FROM_CART = gql`
  mutation RemoveFromCart($id: ID!) {
    removeItemFromCart(id: $id) {
      id
      cart_id
      product_id
      quantity
    }
  }
`;



// 🔹 Signup
export const SIGNUP_MUTATION = gql`
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      token
      user {
        id
        name
        email
        phone
        date_of_birth
        gender
      }
      message
    }
  }
`;

export const SIGNIN_MUTATION = gql`
  mutation Signin($input: SigninInput!) {
    signin(input: $input) {
      token
      user {
        id
        wishlists{
          id
        }
        defaultWishlist{
          id
        }
        name
        email
        phone
        date_of_birth
        gender
      }
      message
    }
  }
`;

export const CREATE_TAP_PAYMENT = gql`
mutation CreateOrderWithTapPayment($input: TapPaymentInput!) {
  createOrderWithTapPayment(input: $input) {
    success
    payment_url
    
    order_id
    transaction_id
    message
    order {
      user{
        id
        email
        name
        phone
        date_of_birth
        gender
        avatar
        email_verified_at
     
        created_at
        updated_at
        
      }
      id
      number
      shipping_type
      shipping_cost
      total_amount
      
     
    }
  }
}
`;
// 🔹 Example: Create Order from Cart
export const CREATE_ORDER_MUTATION = gql`
  mutation CreateOrderFromCart($cart_id: ID!, $input: CreateOrderFromCartInput!) {
    createOrderFromCart(cart_id: $cart_id, input: $input) {
      id
      status
      total
    }
  }
`;


// Function to execute mutation
export async function removeItemFromCart(id) {
  try {
    const response = await graphqlClient.request(REMOVE_ITEM_FROM_CART, { id });
    return response.removeItemFromCart;
  } catch (error) {
    console.error("Error removing item from cart:", error);
    throw error;
  }
}


// 🔹 Helper لتحويل شكل الـ cart لـ lineItems
function normalizeCart(cart) {
  return {
    id: cart.id,
    lineItems: cart.items.map((item) => ({
      id: item.id,
      
      quantity: item.quantity,
      product: item.product,
    })),
  };
}

export async function addToCartTempUser(productId, quantity = 1, unitPrice = 0) {
  try {
    // ✅ log endpoint
    console.log("🚀 [GraphQL Endpoint]:", graphqlClient?.url);

    // 1️⃣ جلب الكارت الحالي لليوزر المؤقت
    const cartData = await graphqlClient.request(GET_USER_CART, {
      user_id: TEMP_USER_ID,
    });
    console.log("📦 [Current Cart]:", cartData);

    let cartId = cartData.userCart?.id;

    // 2️⃣ لو مفيش كارت، نعمله
    if (!cartId) {
      console.log("🆕 [No Cart Found] → Creating new cart...");
      const newCartInput = {
        user_id: TEMP_USER_ID,
        item_total: 0,
        grand_total: 0,
        shipping_costs: 0,
      };
      const newCart = await graphqlClient.request(CREATE_CART, {
        input: newCartInput,
      });
      cartId = newCart.createCart.id;
      console.log("✅ [New Cart Created]:", newCart);
    }

    // 3️⃣ توليد مفتاح فريد للعنصر
    const itemKey = uuidv4();
    console.log("🔑 [Generated Item Key]:", itemKey);

    // 4️⃣ إضافة المنتج للكارت
    const addItemInput = {
      cart_id: cartId,
      product_id: productId,
      quantity,
      unit_price: unitPrice ,
     
     
    };
    console.log("➕ [Add Item Input]:", addItemInput);

    const addedItem = await graphqlClient.request(ADD_ITEM_TO_CART, {
      input: addItemInput,
    });
    console.log("✅ [Item Added]:", addedItem);

    // ✅ رجّع الكارت كامل بعد الإضافة
    const updatedCart = await fetchUserCart();
    console.log("🛒 [Updated Cart]:", updatedCart);
    return updatedCart;
  } catch (error) {
    console.error("❌ Error adding to cart:", error);
    throw error;
  }
}

// --- جلب الكارت الحالي للـ user ---
export async function fetchUserCart() {
  console.log("📡 [Fetching Cart for user_id]:", TEMP_USER_ID);

  const { userCart } = await graphqlClient.request(GET_USER_CART, {
    user_id: TEMP_USER_ID,
  });

  if (!userCart) {
    console.log("🆕 [No Cart Found] → Creating one...");
    const newCart = await graphqlClient.request(CREATE_CART, {
      input: {
        user_id: TEMP_USER_ID,
        item_total: 0,
        grand_total: 0,
        shipping_costs: 0,
      },
    });
    console.log("✅ [New Cart Created in fetchUserCart]:", newCart);
    return normalizeCart(newCart.createCart);
  }

  console.log("📦 [Cart Found]:", userCart);
  return normalizeCart(userCart);
}
