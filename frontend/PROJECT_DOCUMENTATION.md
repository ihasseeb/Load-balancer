# TadChat - Project Documentation

## Project Overview

TadChat is a real-time video and text chat application built with CodeIgniter 4, WebSocket, and WebRTC. It enables users to communicate with each other through text and video calls. The application also provides a RESTful API for integration with other platforms like iOS applications.

---

## Technologies Used

### Backend

- **CodeIgniter 4** (PHP 8.0.12) - Web Framework
- **Ratchet** - WebSocket Library for real-time communication
- **MySQL/MariaDB** - Database
- **PHP 7.4+** - Server-side language

### Frontend

- **JavaScript (Vanilla)** - Client-side logic
- **jQuery** - DOM manipulation and AJAX
- **WebRTC** - Peer-to-peer audio/video communication
- **Material Design for Bootstrap (MDB)** - UI Framework
- **AJAX** - Asynchronous HTTP requests

### Key Libraries

- PSR/Log - Logging standard
- Laminas/Escaper - Security
- Kint-PHP - Debugging

---

## How the Project Works

### 1. Authentication System

- Users must log in before accessing the chat interface
- The application uses email and password-based authentication
- Passwords are encrypted using PHP's `password_verify()` function
- User sessions are managed through CodeIgniter's session system
- Authentication is enforced via filters on protected routes

### 2. User Connection Management

- When a user logs in, their session is stored
- Upon connecting to the WebSocket server, the user's connection information is saved to a database table
- The application tracks online/offline status
- All connected clients receive updates about new users coming online or going offline

### 3. WebSocket Communication

- Real-time messaging is handled through WebSocket connections
- The WebSocket server runs separately and manages connections
- Messages from one user are broadcast to all other connected clients
- When a user disconnects, their connection is removed from the database

### 4. WebRTC Video/Audio Calls

- Once two users are connected via WebSocket, they can initiate WebRTC calls
- WebRTC establishes peer-to-peer connections for high-quality audio/video
- Signaling information is exchanged through the WebSocket channel
- Users can see online users and initiate calls to them

### 5. RESTful API

- The application provides API endpoints for external integrations
- Allows mobile apps and other platforms to authenticate and access chat features
- Separates API logic from web interface

---

## Project Structure

### Key Directories

- **app/Controllers/** - Request handlers (Login, Chat, Server, API)
- **app/Models/** - Database models (UsersModel, ConnectionModel)
- **app/Libraries/** - Custom libraries (WebSocket implementation)
- **app/Views/** - Frontend templates (loginView, chatView)
- **app/Config/** - Application configuration files
- **public/js/** - Client-side JavaScript files
- **public/css/** - Stylesheets
- **database/Migrations/** - Database schema definitions

### Key Files

- **tadchat.sql** - Database backup with tables and sample data
- **spark** - CodeIgniter command-line interface
- **composer.json** - PHP dependencies
- **Routes.php** - Application routing configuration

---

## Installation & Setup Guide

### Step 1: Prerequisites

Ensure your system has:

- **XAMPP/WAMP/LAMP** (Apache, MySQL, PHP 7.4+)
- **Composer** - PHP dependency manager
- **Node.js** (optional, if using npm)
- **Git** (optional, for version control)

### Step 2: Download/Clone Project

```
Navigate to your web root (htdocs for XAMPP):
cd c:\xampp\htdocs\
```

### Step 3: Install Dependencies

```
Open command prompt in project folder:
composer install
```

### Step 4: Database Setup

1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Create a new database named "tadchat"
3. Import the tadchat.sql file:
   - Select the tadchat database
   - Click "Import" tab
   - Choose tadchat.sql file and click "Go"

### Step 5: Configure Database Connection

Edit `app/Config/Database.php`:

- Set database name: "tadchat"
- Set username: "root"
- Set password: "" (empty for default XAMPP setup)
- Ensure hostname is "localhost"

### Step 6: Run Database Migrations

```
Open command prompt in project folder:
php spark migrate
```

### Step 7: Start the Web Server

For Apache/XAMPP, the server runs automatically. Project will be accessible at:

```
http://localhost/TadChat-Codeigniter4/
```

### Step 8: Start WebSocket Server

Open command prompt and run:

```
php spark websocket:start
```

or if there's a server command:

```
php spark server:start
```

The WebSocket server typically runs on port 8080 or similar.

### Step 9: Access the Application

1. Open browser: http://localhost/TadChat-Codeigniter4/
2. You'll see the login page
3. Create an account or use existing credentials
4. Click login to access the chat interface
5. You can see online users and initiate video/text calls

---

## How to Use

### Registration & Login

1. On the login page, click "Register" button
2. Fill in your first name, last name, email, and password
3. Account is created in the database
4. Use your email and password to log in

### Chat Interface

1. After login, you'll see all online users
2. Click on any user to start a video/text chat
3. Text messages appear in real-time
4. Video calls connect directly between peers using WebRTC

### Disconnecting

1. Click "Logout" to exit
2. Your connection is removed from the online users list
3. All connected users are notified of your logout

---

## Key Features

✓ **Real-time Text Chat** - Instant messaging via WebSocket
✓ **Video/Audio Calls** - Peer-to-peer using WebRTC
✓ **User Authentication** - Secure login system
✓ **Online Status** - See who's connected in real-time
✓ **RESTful API** - For external platform integration
✓ **Responsive UI** - Material Design interface
✓ **Connection Management** - Automatic tracking of users

---

## System Requirements

- **Server**: Apache with PHP 7.4 or higher (PHP 8.0 recommended)
- **Database**: MySQL 5.7+ or MariaDB 10.3+
- **RAM**: Minimum 512 MB
- **Disk Space**: Minimum 200 MB
- **Browsers**: Modern browsers supporting WebRTC (Chrome, Firefox, Edge, Safari)

---

## Troubleshooting

| Problem                    | Solution                                                     |
| -------------------------- | ------------------------------------------------------------ |
| Database connection error  | Check Database.php config, verify MySQL is running           |
| WebSocket connection fails | Ensure WebSocket server is running on correct port           |
| Cannot log in              | Verify user exists in database, check password               |
| Video/audio not working    | Check browser WebRTC support, allow microphone/camera access |
| 404 Not Found errors       | Clear browser cache, check Routes.php configuration          |

---

## Future Enhancements

- File sharing capability
- Message history and persistence
- User profiles and avatars
- Group chat functionality
- Screen sharing feature
- End-to-end encryption
- Mobile app integration via existing API

---

## Support & Maintenance

For issues or questions:

1. Check CodeIgniter 4 documentation: https://codeigniter.com
2. Check Ratchet WebSocket documentation
3. Review WebRTC resources for signaling issues
4. Check browser console for JavaScript errors

---

**Project Created**: Learning project for WebSocket and WebRTC implementation
**Framework**: CodeIgniter 4
**Last Updated**: 2025
