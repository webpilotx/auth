# Auth App

This is a simple authentication app built with React. It provides user login and registration functionality with client-side validation and Turnstile CAPTCHA integration for enhanced security.

## Features

- **Login and Registration**: Users can log in or register with a username and password.
- **Client-Side Validation**: Ensures form inputs meet specific requirements before submission.
  - Username: 3-20 characters.
  - Password: At least 8 characters, including one uppercase letter, one lowercase letter, and one number.
  - Password confirmation for registration.
- **Turnstile CAPTCHA**: Protects against automated submissions by requiring CAPTCHA verification.
- **Error Handling**: Displays user-friendly error messages for invalid inputs or server errors.
- **Responsive Design**: Optimized for various screen sizes.

## Technologies Used

- **React**: Frontend framework.
- **React Turnstile**: CAPTCHA integration.
- **Tailwind CSS**: Styling.
- **Fetch API**: For making API requests.

## Setup Instructions

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd auth
   ```

2. **Install Dependencies**:

   ```bash
   pnpm install
   ```

3. **Environment Variables**:
   Create a `.env` file in the root directory and add the following:

   ```
   VITE_TURNSTILE_SITEKEY=<your-turnstile-sitekey>
   TURNSTILE_SECRET_KEY=<your-turnstile-secret-key>
   DB_FILE_NAME=<path-to-your-database-file>
   JWT_SECRET=<your-jwt-secret>
   ```

4. **Run the Development Server**:

   ```bash
   pnpm run dev
   ```

5. **Build for Production** (Client-Side Only):

   ```bash
   pnpm run build
   ```

6. **Start the Server**:
   After building the client-side, run the server using:

   ```bash
   node server.js
   ```

## API Endpoints

- **Login**: `POST /auth/api/login`

  - Request Body: `{ username, password, turnstileToken }`
  - Response: `{ token }`

- **Register**: `POST /auth/api/register`
  - Request Body: `{ username, password, confirmPassword, turnstileToken }`
  - Response: `{ token }`

## Screenshots

### Login Page

![Login Page](https://via.placeholder.com/600x400?text=Login+Page)

### Registration Page

![Registration Page](https://via.placeholder.com/600x400?text=Registration+Page)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
