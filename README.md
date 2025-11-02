# BridgeHealth

A full-stack healthcare application built with Vue.js and Express, featuring blockchain integration and cloud storage capabilities.

## Overview

BridgeHealth is a modern healthcare management platform that combines a Vue.js frontend with an Express.js backend. The application includes authentication, file management, and integration with Solana blockchain and cloud storage services.

## Tech Stack

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **Vue Router** - Official routing library
- **Vuex** - State management
- **Vite** - Next-generation frontend tooling
- **Sass** - CSS preprocessor

### Backend
- **Express.js** - Web application framework
- **MongoDB** (via Mongoose) - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service

### Additional Services
- **Solana Web3.js** - Blockchain integration
- **AWS SDK** - Amazon Web Services integration
- **Google Cloud Storage** - File storage
- **Multer** - File upload handling

## Prerequisites

- Node.js (v14 or higher recommended)
- MongoDB instance
- AWS account (if using AWS services)
- Google Cloud account (if using GCS)
- Solana wallet (if using blockchain features)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bridgehealth
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `server` directory with the following variables:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
GCS_BUCKET_NAME=your_gcs_bucket
EMAIL_HOST=your_email_host
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
```

## Development

### Run the development server (frontend):
```bash
npm run dev
```

### Run the backend server:
```bash
npm run server
```

### Run both simultaneously:
You may want to use a tool like `concurrently` to run both servers at once, or open separate terminal windows.

## Production

### Build for production:
```bash
npm run build
```

### Preview production build:
```bash
npm run preview
```

## Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run server` - Start Express backend with nodemon
- `npm start` - Launch Electron app

## Project Structure

```
bridgehealth/
├── client/          # Vue.js frontend
│   ├── src/
│   └── vite.config.js
├── server/          # Express.js backend
│   └── index.js
└── package.json
```

## Features

- User authentication with JWT
- Secure password hashing
- File upload and storage
- Email notifications
- Blockchain integration (Solana)
- Cloud storage (AWS S3, Google Cloud Storage)
- RESTful API
- Responsive design

## Security

- Passwords are hashed using bcrypt
- JWT tokens for secure authentication
- Constant-time buffer comparison for security-sensitive operations
- CORS enabled for cross-origin requests

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue in the repository.
