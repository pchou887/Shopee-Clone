[![NPM](https://img.shields.io/badge/NPM-ba443f?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/)
[![node](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/en/)
[![typescript](https://img.shields.io/badge/TypeScript-007acc?style=for-the-badge&logo=TypeScript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DBFB?style=for-the-badge&logo=React&logoColor=white)](https://react.dev/)
[![HTML](https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://www.w3schools.com/html/)
[![CSS](https://img.shields.io/badge/CSS-264de4?style=for-the-badge&logo=CSS3&logoColor=white)](https://www.w3schools.com/css/)
[![socket.io](https://img.shields.io/badge/socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Redis](https://img.shields.io/badge/Redis-D82C20?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![MongoDB](https://img.shields.io/badge/mongoDB-4DB33D?style=for-the-badge&logo=mongoDB&logoColor=white)](https://www.mongodb.com/)
[![docker](https://img.shields.io/badge/docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
# Shopee-Clone

This is a Shopee-inspired website, where buyers can purchase products and use the shopping cart, while sellers can perform product and permission CRUD operations. Additionally, the platform features a queuing system for product purchases during high-demand events.

This is my home page ---> [Shopee Clone](https://hyperushle.com)
![Home-page](https://github.com/pchou887/Shopee-Clone/assets/118956591/c6c3ec64-5197-4aae-82e4-212d832d3834)

## Server Structure
![user flow](https://github.com/pchou887/Shopee-Clone/assets/118956591/d16926c8-ecd9-4af4-a466-6206c34d4854)

## Features

### Snatch Purchase
The page for snatching products is located at the top right corner of the homepage under two icons.
![Snatch](https://github.com/pchou887/Shopee-Clone/assets/118956591/d7000032-fcd9-42ae-b87a-775b31ce8cd6)

This is the architecture diagram of the flash sale page.
1. Enters the flash sale page, the client will request data from the server to fetch the necessary information for the webpage. Additionally, the client will establish a connection with another Socket.IO server.
2. When the user selects the desired type and quantity and clicks the button, an event will be sent to the Socket.IO server.
3. The server will then check the status of the queue to determine if it exceeds the team's capacity. It will immediately respond to the client with the current status.
4. The queue worker continuously monitors the status of the queue and, when a user is eligible to enter the order page, it utilizes Redis pub/sub technology to send real-time notifications to the Socket.IO server.
5. The Socket.IO server, in turn, responds to the user, ensuring that the user can purchase the previously selected quantity of items without any issues.
6. The number of people allowed to enter the order page is controlled to be within the range of 5 to 20 individuals. As a result, direct payment operations can be performed with the MySQL server. Each order has a time limit, and during the payment process, the system will also verify whether the order has exceeded the time limit.
- With the introduction of the "order check worker," you've implemented a mechanism to monitor the order statuses in real-time. By setting a 5-minute payment limit, the worker can track and detect orders that have exceeded the time frame for payment. When this happens, the worker will promptly send the order quantity back to the Socket.IO server, allowing the server to reflect the updated inventory on the webpage.

![SnapUp](https://github.com/pchou887/Shopee-Clone/assets/118956591/bbb4eaa9-5bbd-4f3c-9195-8928903b2fb7)


### Customer Support
- Store Chat

If users have customer service permissions within the store, they can click to access the customer support page. On the left side are the customers who have previously chatted with the store, in the middle are the chat records, and on the right side are the orders previously completed by that customer.
![customer](https://github.com/pchou887/Shopee-Clone/assets/118956591/e993b174-2fc2-469f-b2a3-1ce5528fbd85)

- User Chat

Users can view the previously conversed stores and their chat records within their chat rooms.
![chat](https://github.com/pchou887/Shopee-Clone/assets/118956591/8155a545-9736-434f-a23d-54ad40917c03)

### Permission Management
After entering the marketplace, the permission management section will be directly displayed on the left-hand menu. Users with managerial positions or above will have the capability to perform CRUD operations on employee permissions and see the corresponding options in the menu. We utilize RBAC (Role-Based Access Control) to differentiate the permissions for each position.
![Permission](https://github.com/pchou887/Shopee-Clone/assets/118956591/7ff56ce1-3d01-4f54-a715-22b270314918)

## Test account
- Jerry
  - Email: pchou@gmail.com
  - Password: 0000
- Viper
  - Email: viper@gmail.com
  - Password: 000000
