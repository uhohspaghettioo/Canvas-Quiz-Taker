---

# DeepThoughts: Flask & Tampermonkey for Canvas

DeepThoughts bridges Canvas quizzes and the GPT API. Using a Tampermonkey script, it captures quiz questions, processes them with the GPT model, and returns intelligent answers.

## 🚀 Getting Started

### 🛠 Prerequisites

- **Python**: Ensure you have [Python (3.x recommended)](https://www.python.org/downloads/) installed.

- **Libraries**: Install the required Python libraries:
   ```bash
   pip install Flask flask_cors openai
   ```

- **Tampermonkey**: Get the [Tampermonkey browser extension](https://www.tampermonkey.net/) to integrate with Canvas.

### 🌐 Setup

1. **Get the Code**:
   ```bash
   git clone https://github.com/uhohspaghettioo/gpcheater.git
   cd gpcheater
   ```

2. **Insert API Keys**: Add your OpenAI API key to `key.txt`
      ``` Note: Secret key for server auth is by default 1234 ```
3. **Change Canvas**: change the links in [quizzy.js](quizzy.user.js) to be your university

### 🔥 Running the Server

Start the Flask server with:
```bash
python server.py
```
> **Note:** Depending on your OS, use `python3` if `python` doesn't work.

The server will initiate at `127.0.0.1`.

### ✨ **Key Features**

- 🔍 **Automatic Data Extraction**: 
  - Stay on the Canvas quiz page while the tool automatically extracts questions and potential answers.
  
- 🌐 **Seamless Integration**: 
  - Data is sent to the Flask server, and GPT's responses are elegantly displayed directly on the Canvas quiz.
  
- 🌟 **Answer Highlighting**: 
  - GPT-suggested multiple-choice answers are marked, but not noticeable to the untrained eye. try to spot the correct answer here:
  - ![image](https://github.com/uhohspaghettioo/gpcheater/assets/153341004/a6964427-c6dd-4ade-967d-4a37fd088237)
  - spoilers: its the one with the . in front of it

  
- 🖱️ **Click-to-Copy**: 
  - Easily copy GPT's responses with just a click.
  
  - **Try It Out**: Here's a close-up of the button to press for copying during the test:
  - ![image](https://github.com/uhohspaghettioo/gpcheater/assets/153341004/793dc23b-0d33-4f72-9132-66ff9bb394fb)
  - this is very obvious to canvas logs, use with your own discretion
  - also only for FRQ questions, wont copy anything for MC


## Setup Guide for Canvas Assistance

1. 📦 **Install Tampermonkey**: 
    - Download and install the [Tampermonkey extension](https://www.tampermonkey.net/).

2. 📝 **Insert Script**: 
    - Open the Tampermonkey dashboard, create a new script, and paste the provided JS code.

3. 🖊️ **Edit Your Script File**:
    - Make necessary edits based on your configuration.
    - make sure your key.txt matches your personal OpenAPI API key, and that your account has funding.

4. 🖋️ **Edit Your Server File (if needed)**:
    - Modify as per your requirements.

5. 💡 **Engage with Canvas**: 
    - Navigate to a Canvas quiz and see the script in action, processing questions and presenting GPT responses.

6. 🖱️ **Interact with Responses**: 
    - Observe highlighted answers.
    - Use the click-to-copy feature for instant answer retrieval.

7. 🤝 **Support & Feedback**: 
    - Need help or have suggestions? Please open an issue in the repository or reach out to the project maintainer.
    - create a PR or open an issue to contribute :)

---
