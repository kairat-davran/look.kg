# Look.kg

Look.kg is an e-commerce platform where stores can sell their goods, similar to Amazon. Built using the MERN stack (MongoDB, Express.js, React.js, and Node.js), it provides a robust and scalable solution for online marketplaces.

## Features

- User authentication and authorization (admin, seller, and customer roles).
- Sellers can manage their products, including inventory and descriptions.
- Customers can browse products, add them to a cart, and place orders.
- Product reviews and ratings.
- Responsive design for seamless use on all devices.
- Secure payment integration (future implementation).

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/kairatbek-d/look.kg.git
    ```
2. Navigate to the project directory:
    ```bash
    cd look.kg
    ```
3. Install dependencies:
    ```bash
    npm install
    ```
4. Set up environment variables:
    - Create a `.env` file in the root directory.
    - Add the following variables:
      ```
      MONGO_URI=your-mongodb-connection-string
      JWT_SECRET=your-jwt-secret
      PAYPAL_CLIENT_ID=your-paypal-client-id
      ```
5. Start the development server:
    ```bash
    npm start
    ```

## Usage

1. Run the backend server:
    ```bash
    npm run server
    ```
2. Run the frontend:
    ```bash
    npm run client
    ```
3. Open your browser and navigate to `http://localhost:3000`.

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch:
    ```bash
    git checkout -b feature-name
    ```
3. Commit your changes:
    ```bash
    git commit -m "Add feature-name"
    ```
4. Push to the branch:
    ```bash
    git push origin feature-name
    ```
5. Open a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For questions or feedback, please contact kairatbek.davranbekov.kk@gmail.com