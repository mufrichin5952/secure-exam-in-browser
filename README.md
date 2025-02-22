# Secure Exam Browser

A secure browser-based examination system that integrates with Google Forms.

## Features
- Token-based access control
- Real-time timer
- Security measures against cheating
- Mobile compatibility
- Automatic submission
- Security violation logging

## Setup Instructions
1. Create Google Spreadsheet for tokens
2. Deploy Google Apps Script
3. Update config.js with script URL
4. Host files on web server

## File Structure
- index.html - Login page
- exam.html - Examination page
- end.html - Completion page
- assets/
  - css/style.css - Styling
  - js/
    - config.js - Configuration
    - security.js - Security measures
    - exam.js - Exam handler

## Security Features
- Tab switching prevention
- Copy-paste prevention
- Screen capture prevention
- Multiple monitor detection
- Mobile orientation lock
- Network monitoring

## Requirements
- Web server
- Google Forms
- Google Spreadsheet
- Modern web browser