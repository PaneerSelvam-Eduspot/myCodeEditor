# Browser Code Editor

A lightweight, browser-based code editor for writing, running, and previewing **HTML, CSS, and JavaScript** in real time.

Built with vanilla JavaScript, the project focuses on browser APIs, client-side state management, code execution through a sandboxed iframe, and practical editor interactions.

## Screenshots

<img width="1533" height="772" alt="image" src="https://github.com/user-attachments/assets/62821287-d513-45b6-8d19-ed2f1f3d4ad5" />

[🔗 Live Demo](https://browser-code-editor.netlify.app/)

## Features

- Write HTML, CSS, and JavaScript using **Ace Editor**.
- Run code and render the result in a live preview panel.
- Open the preview in a separate browser window.
- Save projects to `localStorage`.
- Download projects as JSON files.
- Load previously saved JSON project files.
- Restore the latest project automatically when the application starts.
- View logs, warnings, and errors in an output console.
- Clear or toggle the output console.
- Responsive two-column layout that switches to a single-column layout on smaller screens.
- Keyboard-accessible editor tabs with arrow-key navigation.

## Validation and Execution

Before rendering the preview, the editor performs lightweight checks:

- **HTML:** Compares opening and closing tag counts to identify possible mismatches.
- **CSS:** Checks whether opening and closing braces are balanced.
- **JavaScript:** Uses `new Function()` to detect syntax errors before execution.

The preview is generated using an iframe `srcdoc` document containing the user's HTML, CSS, and JavaScript:

```text
HTML + CSS + JavaScript
          ↓
      srcdoc document
          ↓
   Sandboxed iframe preview
```

The iframe uses the following sandbox permissions:

```html
sandbox="allow-scripts allow-same-origin allow-modals"
```

These checks are intended as basic feedback rather than a complete HTML, CSS, or JavaScript validation system.

## Project Persistence

Projects are represented as JSON objects containing the editor content:

```json
{
  "version": 1,
  "kind": "web-only",
  "html": "...",
  "css": "...",
  "js": "..."
}
```

The application uses `localStorage` for browser persistence and also supports exporting and importing projects as JSON files.

The saved project format is normalized when loading, allowing the application to handle both the current top-level structure and an older nested `web` structure.

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl + Enter` | Run the current web project |
| `Ctrl + S` | Save the project locally and download it as JSON |
| `Ctrl + J` | Toggle the output console |
| `Arrow Left / Arrow Right` | Navigate between HTML, CSS, and JavaScript tabs |

> On macOS, the editor uses `Command + Enter` and `Command + S` for the run and save actions.

## Tech Stack

- **HTML5** — Application structure
- **CSS3** — Responsive layout and visual styling
- **Vanilla JavaScript (ES6+)** — Application logic and browser interactions
- **Ace Editor** — HTML, CSS, and JavaScript editing
- **LocalStorage** — Client-side project persistence
- **File API and Blob API** — Project import and JSON export
- **Sandboxed iframe** — Live code preview
- **Font Awesome** — Interface icons
- **Netlify** — Deployment

No frontend framework or backend service is used.

## Architecture Overview

The application is organized around a few focused responsibilities:

| Responsibility | Implementation |
| --- | --- |
| Editor management | Ace Editor instances for HTML, CSS, and JavaScript |
| Preview generation | Builds an HTML document using `srcdoc` |
| Validation | Lightweight HTML, CSS, and JavaScript checks |
| Persistence | `StorageService` using `localStorage` |
| File handling | `FileService` for JSON export and import |
| Logging | `Logger` for timestamps, warnings, errors, and clearing output |
| UI interaction | Vanilla JavaScript event listeners and keyboard handlers |

The project keeps the implementation framework-free, making browser APIs and application behavior explicit.

## Running Locally

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd myCodeEditor
```

### 2. Run the project

Because this is a static frontend project, it can be served using any local static server.

For example, with VS Code:

- Install the **Live Server** extension.
- Open the project folder.
- Start Live Server from `index.html`.

You can also deploy the project directly to a static hosting provider such as Netlify.

## Limitations

- Validation is lightweight and does not fully parse HTML, CSS, or JavaScript.
- HTML validation compares tag counts and may not detect every structural mismatch.
- CSS validation checks brace balance but does not validate CSS syntax.
- JavaScript validation checks syntax before execution but does not provide a full runtime error system for the preview.
- Preview console messages are not captured directly in the parent output console.
- Projects are stored locally in the current browser and are not synchronized across devices.
- The project does not include authentication, cloud storage, collaborative editing, or a backend execution environment.
- Executing user-provided code in a browser iframe should not be treated as a complete security boundary for untrusted production workloads.

## Future Improvements

- Capture `console.log`, warnings, and runtime errors from the preview iframe.
- Add stronger HTML, CSS, and JavaScript validation.
- Add theme switching.
- Introduce autosave support.
- Improve runtime error reporting in the preview.
- Add project naming and multiple saved projects.

## What I Learned

- How browser-based code editors manage multiple editor instances.
- How to generate a live preview using an iframe and `srcdoc`.
- How to use browser storage and JSON serialization for project persistence.
- How to use the File API and Blob API for project export and import.
- How to organize browser logic into focused services such as storage, file handling, and logging.
- How to implement keyboard shortcuts and accessible tab navigation.
- How to handle basic validation and browser execution errors without external frameworks.

## Found something to fix?
Since I am a developer who is always learning, I might have missed something! If you find a bug or have a suggestion on how I can make the Promise logic better, please feel free to open an Issue or send a Pull Request. I would love to learn from your feedback!

## Author

[LinkedIn](https://www.linkedin.com/in/paneerselvam/)

## License

Open for learning and experimentation.

## Like this project?
If you are feeling generous, [Buy me a Coffee!](https://ko-fi.com/paneerselvam)

