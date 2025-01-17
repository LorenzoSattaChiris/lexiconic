# **DOCUMENTATION.md**

## 1. File Structure

Divided content between main pages (ejs), css and js folders.
Several secondary folders such as assets, db, routes, test, utils...

## 2. Architecture Decisions

The Architecture was choosen in order to balance simplicity (due to the time constraint) yet flexibility. It is one of the simplest architecture existing for web applications, with a direct front-end / back-end communication via express. I tried to design all the steps with scalability, safety and performance in mind. The user inputs are sanitised and checked. Modularity is used as much as possible (with plenty of improvements needed). Additionally, iterative testing allowed to review the various aspects of the application.

## 2. Dependencies

- **autolinker**: Automatically hyperlinks URLs, email addresses, and mentions in text.
- **axios**: Handles HTTP requests for fetching data from APIs (e.g., synonyms, definitions).
- **compression**: Compresses HTTP responses for faster load times.
- **cookie-parser**: Parses cookies for managing user sessions or preferences.
- **dotenv**: Loads environment variables from `.env` for secure configuration.
- **ejs**: Renders dynamic HTML templates for views.
- **express**: The core web framework for handling routes and middleware.
- **express-rate-limit**: Prevents abuse by limiting requests per IP.
- **express-subdomain**: Simplifies subdomain-based routing (e.g., dashboard at `app.yoursite.com`). (Not Used Here - Often Helpful to distinguish between marketing and "dashboard" websites)
- **helmet**: Adds HTTP headers for enhanced app security.
- **morgan**: Logs HTTP requests for debugging and analytics.
- **isomorphic-dompurify**: Sanitizes user inputs to prevent XSS attacks.
- **multer**: Handles file uploads (e.g., documents for conversion).
- **mammoth**: Converts DOCX files to clean HTML or Markdown.
- **marked**: Converts Markdown to HTML for rendering.
- **pdf-parse**: Extracts text from PDF files.
- **turndown**: Converts HTML into Markdown.
- **xlsx**: Parses Excel or CSV files into JSON format.

### **Dev Dependencies**

- **browser-sync**: Enables live-reloading during development for faster iteration.
- **concurrently**: Runs multiple npm scripts (e.g., server and live-reload) simultaneously.
- **markdown-toc**: Creates a table of contents for Markdown files.
- **nodemon**: Restarts the server automatically during development when files change.

## 4. Prompt Engineering

I used the following prompt engineering techniques:

- Give ChatGPT a Role
- Give a Delimiter (""")
- Give a Context
- Step by Step Instructions
- Prompt Protection
- Limit the Size of the Prompt
- Give Parameters (Max Tokens, Temperature) adjusted via iterative development (testing)
- Divide into system and user prompt
- Iteratively testing and refining the prompts

There are several examples of Improvement I've made to the prompts following tests. Here are some examples:
- Added: "Use THREE dashes (---)" after ChatGPT used only -- once. Another Fix Could be that the frontend function accounts for both --- and --
- Added: "If no context is provided, still give a revision." as a fallback on code issues. However, the context should always be defined. 
- Added: "The Length of your suggestions should be similar to the length of the Selected Text". After ChatGPT kept making much longer and loosely related suggestions. This greatly improved the suggestion focus and quality.
- Added a Stronger System Prompt in the Explanation in order to give guideliens to make the explanation truly interesting and not only ChatGPT gibberish. 
- Added: "Present suggestions with humility ("This might improve..." rather than "This is better")" After ChatGPT kept roasting my writing. Helped greatly to improve ChatGPT reflection capabilities. Maybe in the future the tool could  let the user select amongst multiple "Write Coach" personas. 
- Added: "Do not talk about a typo if there is not a typo" As Sometimes ChatGPT was focusing on useless details rather than what truly mattered. 
- Added: Not too long (KEEP IT CONCISE). As sometimes ChatGPT was trying to write a book out of an explanation. 
- And more...

## 5. Setup Instructions

Refer to the [README.md](./README.md) for how to run the project.

## 6. General Code Guidelines

- **Consistency**: Follow naming and commenting conventions.
- **Security**: Sanitize user input, use safety middleware.
- **Maintainability**: Modularize routes & utilities.
- **Scalability**: Prepare for further work.
