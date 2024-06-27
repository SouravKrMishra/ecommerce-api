# E-commerce Backend API

This project is a backend API for an e-commerce application built using Node.js, Express.js, and MongoDB. It provides various endpoints for user authentication, product management, cart functionality, and order processing.

## Features

- User registration and login with JWT authentication
- Admin role for managing products and categories
- CRUD operations for products
- User cart functionality (add to cart, remove from cart, update quantity)
- Order placement and purchase history
- Product filtering by category
- Support ticket creation and email notifications
- Forgot password functionality with OTP verification

## Prerequisites

Before running the project, make sure you have the following installed:

- Node.js (v12 or above)
- MongoDB

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/SouravKrMishra/ecommerce-api/tree/master
   ```

2. Navigate to the project directory:

   ```bash
   cd ecommerce-backend
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and provide the necessary environment variables:

   ```plaintext
   PORT=3000
   MONGO_DB_ADDRESS=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your-jwt-secret
   EMAIL_HOST=your-email-host
   EMAIL_PORT=your-email-port
   NOREPLY_EMAIL=your-noreply-email
   SUPPORT_EMAIL=your-support-email
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   ```

   Replace the placeholders with your actual values.

5. Start the server:

   ```bash
   npm start
   ```

   The server will start running at `http://localhost:3000`.

## API Endpoints

The following are the main API endpoints available:

- **User Registration**: `POST /user/signup`
- **User Login**: `POST /user/login`
- **Admin Login**: `POST /admin/login`
- **Create Role (Admin)**: `POST /admin/createRole`
- **Add Product (Admin)**: `POST /admin/addProduct`
- **Edit Product (Admin)**: `PUT /admin/editProduct`
- **Delete Product (Admin)**: `POST /admin/deleteProduct`
- **Get All Products**: `GET /user/getAllProduct`
- **Add to Cart**: `POST /user/addToCart`
- **Remove from Cart**: `POST /user/removeFromCart`
- **Update Cart Quantity**: `POST /user/updateQuantity`
- **Get Total Cost**: `GET /user/getTotalCost`
- **Buy Products**: `POST /user/buyProducts`
- **User Purchase History**: `GET /user/userPurchaseHistory`
- **Get Products by Category**: `GET /user/getProductByCategory`
- **Get Products Under Category**: `GET /user/getProductUnderCategory`
- **Create Support Ticket**: `POST /email/createTicket`
- **Forgot Password**: `POST /forgotPassword`
- **Verify OTP**: `POST /forgotPassword/verifyotp`

Refer to the API documentation or the source code for more details on request/response formats and required parameters.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.
