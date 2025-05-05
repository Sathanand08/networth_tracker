# CrediKhaata - Shopkeeper Credit Management API

CrediKhaata is a RESTful backend service built with Node.js, Express, and MongoDB that allows shopkeepers to manage customer credit accounts. The system enables tracking of credit sales (loans), recording repayments, and generating alerts for overdue payments.

## Table of Contents

- [Features](#features)
- [Project Setup](#project-setup)
- [Dependencies](#dependencies)
- [API Documentation](#api-documentation)
- [Running the Application](#running-the-application)
- [Demonstration](#demonstration)

## Features

- User authentication with JWT
- Customer management
- Loan tracking and management
- Repayment recording
- Loan status monitoring (pending, paid, overdue)
- Summary statistics and reporting
- Overdue payment alerts

## Project Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/credikhaata.git
   cd credikhaata
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/credikhaata
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=30d
   ```
   
   Replace `your_jwt_secret_here` with a secure random string and update the MongoDB URI if needed.

4. Start the application:
   ```bash
   npm start
   ```

## Dependencies

- **express**: Web framework for Node.js
- **mongoose**: MongoDB object modeling tool
- **jsonwebtoken**: JWT implementation for authentication
- **bcryptjs**: Library for hashing passwords
- **validator**: Library for string validation
- **moment**: Library for date manipulation
- **dotenv**: Module to load environment variables
- **pdfkit**: PDF generation library (for receipt generation)
- **twilio**: API client for SMS/WhatsApp notifications

## API Documentation

### Authentication Endpoints

#### Register a New User

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "shopName": "John's General Store",
    "phone": "1234567890"
  }
  ```
- **Response**: 
  ```json
  {
    "status": "success",
    "token": "jwt_token_here",
    "data": {
      "user": {
        "name": "John Doe",
        "email": "john@example.com",
        "shopName": "John's General Store",
        "phone": "1234567890",
        "_id": "user_id_here",
        "createdAt": "2023-08-15T12:00:00.000Z"
      }
    }
  }
  ```

#### Login

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**: 
  ```json
  {
    "status": "success",
    "token": "jwt_token_here",
    "data": {
      "user": {
        "_id": "user_id_here",
        "name": "John Doe",
        "email": "john@example.com",
        "shopName": "John's General Store"
      }
    }
  }
  ```

### Customer Endpoints

All customer endpoints require authentication. Include the JWT token in the request header:
```
Authorization: Bearer your_jwt_token
```

#### Create Customer

- **URL**: `/api/customers`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "Jane Smith",
    "phone": "9876543210",
    "address": "123 Main St",
    "trustScore": 8
  }
  ```
- **Response**: 
  ```json
  {
    "status": "success",
    "data": {
      "customer": {
        "name": "Jane Smith",
        "phone": "9876543210",
        "address": "123 Main St",
        "trustScore": 8,
        "totalCredit": 0,
        "totalRepaid": 0,
        "user": "user_id_here",
        "_id": "customer_id_here",
        "createdAt": "2023-08-15T12:30:00.000Z"
      }
    }
  }
  ```

#### Get All Customers

- **URL**: `/api/customers`
- **Method**: `GET`
- **Response**: 
  ```json
  {
    "status": "success",
    "results": 1,
    "data": {
      "customers": [
        {
          "_id": "customer_id_here",
          "name": "Jane Smith",
          "phone": "9876543210",
          "address": "123 Main St",
          "trustScore": 8,
          "totalCredit": 0,
          "totalRepaid": 0,
          "user": "user_id_here",
          "createdAt": "2023-08-15T12:30:00.000Z"
        }
      ]
    }
  }
  ```

#### Get Single Customer

- **URL**: `/api/customers/:id`
- **Method**: `GET`
- **Response**: 
  ```json
  {
    "status": "success",
    "data": {
      "customer": {
        "_id": "customer_id_here",
        "name": "Jane Smith",
        "phone": "9876543210",
        "address": "123 Main St",
        "trustScore": 8,
        "totalCredit": 0,
        "totalRepaid": 0,
        "user": "user_id_here",
        "createdAt": "2023-08-15T12:30:00.000Z"
      }
    }
  }
  ```

#### Update Customer

- **URL**: `/api/customers/:id`
- **Method**: `PATCH`
- **Body**:
  ```json
  {
    "trustScore": 9,
    "address": "456 New Street"
  }
  ```
- **Response**: 
  ```json
  {
    "status": "success",
    "data": {
      "customer": {
        "_id": "customer_id_here",
        "name": "Jane Smith",
        "phone": "9876543210",
        "address": "456 New Street",
        "trustScore": 9,
        "totalCredit": 0,
        "totalRepaid": 0,
        "user": "user_id_here",
        "createdAt": "2023-08-15T12:30:00.000Z"
      }
    }
  }
  ```

#### Delete Customer

- **URL**: `/api/customers/:id`
- **Method**: `DELETE`
- **Response**: 
  ```json
  {
    "status": "success",
    "data": null
  }
  ```

### Loan Endpoints

All loan endpoints require authentication. Include the JWT token in the request header.

#### Create Loan

- **URL**: `/api/loans`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "amount": 5000,
    "description": "Groceries purchase",
    "dueDate": "2023-12-31",
    "customer": "customer_id_here"
  }
  ```
- **Response**: 
  ```json
  {
    "status": "success",
    "data": {
      "loan": {
        "amount": 5000,
        "description": "Groceries purchase",
        "dueDate": "2023-12-31T00:00:00.000Z",
        "status": "pending",
        "remainingAmount": 5000,
        "customer": "customer_id_here",
        "user": "user_id_here",
        "repayments": [],
        "_id": "loan_id_here",
        "createdAt": "2023-08-15T13:00:00.000Z"
      }
    }
  }
  ```

#### Get All Loans

- **URL**: `/api/loans`
- **Method**: `GET`
- **Query Parameters**:
  - `status`: Filter by status (pending, paid, overdue)
  - `customer`: Filter by customer ID
- **Response**: 
  ```json
  {
    "status": "success",
    "results": 1,
    "data": {
      "loans": [
        {
          "_id": "loan_id_here",
          "amount": 5000,
          "description": "Groceries purchase",
          "dueDate": "2023-12-31T00:00:00.000Z",
          "status": "pending",
          "remainingAmount": 5000,
          "customer": {
            "_id": "customer_id_here",
            "name": "Jane Smith",
            "phone": "9876543210"
          },
          "user": "user_id_here",
          "repayments": [],
          "createdAt": "2023-08-15T13:00:00.000Z"
        }
      ]
    }
  }
  ```

#### Get Single Loan

- **URL**: `/api/loans/:id`
- **Method**: `GET`
- **Response**: 
  ```json
  {
    "status": "success",
    "data": {
      "loan": {
        "_id": "loan_id_here",
        "amount": 5000,
        "description": "Groceries purchase",
        "dueDate": "2023-12-31T00:00:00.000Z",
        "status": "pending",
        "remainingAmount": 5000,
        "customer": {
          "_id": "customer_id_here",
          "name": "Jane Smith",
          "phone": "9876543210"
        },
        "user": "user_id_here",
        "repayments": [],
        "createdAt": "2023-08-15T13:00:00.000Z"
      }
    }
  }
  ```

#### Record Repayment

- **URL**: `/api/loans/:id/repayment`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "amount": 2000,
    "notes": "First installment"
  }
  ```
- **Response**: 
  ```json
  {
    "status": "success",
    "data": {
      "loan": {
        "_id": "loan_id_here",
        "amount": 5000,
        "description": "Groceries purchase",
        "dueDate": "2023-12-31T00:00:00.000Z",
        "status": "pending",
        "remainingAmount": 3000,
        "customer": "customer_id_here",
        "user": "user_id_here",
        "repayments": [
          {
            "amount": 2000,
            "date": "2023-08-15T13:30:00.000Z",
            "notes": "First installment"
          }
        ],
        "createdAt": "2023-08-15T13:00:00.000Z"
      }
    }
  }
  ```

#### Get Loan Summary

- **URL**: `/api/loans/summary`
- **Method**: `GET`
- **Response**: 
  ```json
  {
    "status": "success",
    "data": {
      "totalLoaned": 5000,
      "totalCollected": 2000,
      "overdueAmount": 0,
      "avgRepaymentTime": 0,
      "totalPending": 3000
    }
  }
  ```

#### Get Overdue Loans

- **URL**: `/api/loans/overdue`
- **Method**: `GET`
- **Response**: 
  ```json
  {
    "status": "success",
    "results": 1,
    "data": {
      "overdueLoans": [
        {
          "_id": "overdue_loan_id_here",
          "amount": 3000,
          "description": "Electronics purchase",
          "dueDate": "2023-07-31T00:00:00.000Z",
          "status": "overdue",
          "remainingAmount": 1500,
          "customer": {
            "_id": "customer_id_here",
            "name": "John Smith",
            "phone": "9876543210"
          },
          "user": "user_id_here",
          "repayments": [
            {
              "amount": 1500,
              "date": "2023-08-01T10:00:00.000Z",
              "notes": "Partial payment"
            }
          ],
          "createdAt": "2023-07-15T11:00:00.000Z"
        }
      ]
    }
  }
  ```

## Running the Application

1. Ensure MongoDB is running
2. Start the application:
   ```bash
   npm start
   ```
3. The API will be available at `http://localhost:3000`

## Demonstration

You can test the API using Postman or any API testing tool. Here's a basic workflow:

1. **Register a new user**:
   ```
   POST http://localhost:3000/api/auth/register
   Content-Type: application/json
   
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "password123",
     "shopName": "John's General Store",
     "phone": "1234567890"
   }
   ```

2. **Login to get JWT token**:
   ```
   POST http://localhost:3000/api/auth/login
   Content-Type: application/json
   
   {
     "email": "john@example.com",
     "password": "password123"
   }
   ```

3. **Create a customer**:
   ```
   POST http://localhost:3000/api/customers
   Content-Type: application/json
   Authorization: Bearer your_jwt_token
   
   {
     "name": "Jane Smith",
     "phone": "9876543210",
     "address": "123 Main St",
     "trustScore": 8
   }
   ```

4. **Create a loan for the customer**:
   ```
   POST http://localhost:3000/api/loans
   Content-Type: application/json
   Authorization: Bearer your_jwt_token
   
   {
     "amount": 5000,
     "description": "Groceries purchase",
     "dueDate": "2023-12-31",
     "customer": "customer_id_here"
   }
   ```

5. **Record a repayment**:
   ```
   POST http://localhost:3000/api/loans/loan_id_here/repayment
   Content-Type: application/json
   Authorization: Bearer your_jwt_token
   
   {
     "amount": 2000,
     "notes": "First installment"
   }
   ```

6. **View loan summary**:
   ```
   GET http://localhost:3000/api/loans/summary
   Authorization: Bearer your_jwt_token
   ```

7. **Check for overdue loans**:
   ```
   GET http://localhost:3000/api/loans/overdue
   Authorization: Bearer your_jwt_token
   ```
