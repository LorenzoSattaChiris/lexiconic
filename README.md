<a id="readme-top"></a>

<br />
<div align="center">
  <a href="https://github.com/LorenzoSattaChiris/lexiconic.git">
    <img src="assets/logo/icon.png" alt="Logo" width="80" height="auto">
  </a>

<h3 align="center">Lexiconic</h3>

  <p align="center">
    Lexiconic is an AI-powered document revision tool designed to enhance creative writing. Users can highlight text, request intelligent revisions, and track changes with detailed explanations. Built with a sleek interface and seamless integration of advanced AI models, Lexiconic will make your lexic truly iconic.
    <br />
    <a href="https://lexiconic.tech" target="_blank"><strong>Explore the Tool »</strong></a>
    <br />
    <br />
    <a href="/DEMO.md">View Demo</a>
    &middot;
    <a href="/CHANGELOG.md">View Changelog</a>
    &middot;
    <a href="/TESTING.md">View Unit Testing</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

**Lexiconic** is an AI-powered document revision tool designed as part of a technical challenge for [Agathon.ai](Agathon.ai). The project provides a seamless writing and editing experience by integrating advanced language models (LLMs) to assist users in revising and enhancing their text. Key features include:

- Text Highlighting and Editing: Users can select specific sections of a document and request context-aware AI suggestions.
- Revision History: Clear before-and-after comparisons with explanations for changes, ensuring transparency.
- LLM Integration: Advanced prompt engineering ensures high-quality revisions and meaningful explanations.
- User-Friendly Interface: A sleek and intuitive design for effortless interaction with the tool.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- EJS, CSS, JS
- Node
- Express
- ChatGPT API

_For explanations, please refer to the [Documentation](/DOCUMENTATION.md)_


<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

This are short instructions on how to clone and work on this repository locally.

### Installation

1. Get an API Key at [https://platform.openai.com/account/api-keys
   ](https://platform.openai.com/account/api-keys)
2. Clone the repo
   ```sh
   git clone https://github.com/LorenzoSattaChiris/lexiconic.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Create a Root File Called: ".env" and enter your API
   ```js
   OPENAI_API_KEY = YOUR_API_ KEY_HERE
   ```
5. Change git remote url to avoid accidental pushes to base project
   ```sh
   git remote set-url origin github_username/repo_name
   git remote -v # confirm the changes
   ```
6. Run (in development mode)
   ```sh
   npm start
   ```
7. Or Run with Hot Reload

```sh
 npm run s
```

### NPM Libraries Used

```json
  "dependencies": {
    "autolinker": "^4.1.0",
    "axios": "^1.7.9",
    "compression": "^1.7.5",
    "cookie-parser": "^1.4.7",
    "dotenv": "^16.4.7",
    "ejs": "^3.1.10",
    "express": "^4.21.2",
    "express-rate-limit": "^7.5.0",
    "express-subdomain": "^1.0.6",
    "helmet": "^8.0.0",
    "isomorphic-dompurify": "^2.20.0",
    "mammoth": "^1.9.0",
    "marked": "^15.0.6",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "pdf-parse": "^1.1.1",
    "turndown": "^7.2.0",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "browser-sync": "^3.0.3",
    "concurrently": "^9.1.0",
    "markdown-toc": "^1.2.0",
    "nodemon": "^3.1.7"
  }
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

The Platform can be used locally or at [lexiconic.tech](lexiconic.tech).

_For more examples, please refer to the [Demo](/DEMO.md)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

See the [Changelog](/CHANGELOG.md) for a full list of future features by version.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the Proprietary License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Lorenzo Satta Chiris - ls1044@exeter.ac.uk

Project Link: [https://github.com/LorenzoSattaChiris/lexiconic.git](https://github.com/LorenzoSattaChiris/lexiconic.git)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

- [Readme Adapted from Best README Template](https://github.com/othneildrew/Best-README-Template)
- [GitHub](https://github.com/)
- [Icons 8](https://icons8.com/)
- [Google Fonts](https://fonts.google.com/)
- [ChatGPT](https://openai.com/)
- [Quill](https://quilljs.com/)
- [Notyf](https://carlosroso.com/notyf/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
