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
   git clone https://github.com/jonathankirtland/flaskgpt
   cd flaskgpt
   ```

2. **Create API Key Files**:

   - **On Linux & macOS**:
     ```bash
     touch key.txt
     touch secret_key.txt
     ```

   - **On Windows**:
     ```bash
     echo > key.txt
     echo > secret_key.txt
     ```

3. **Insert API Keys**: Add your OpenAI API key to `key.txt` and your secret key to `secret_key.txt`.
      ``` Remember: you create the secret key, it can be 123 if you want ```

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
  - GPT-suggested multiple-choice answers are clearly highlighted.
  - ![GPT Answer Highlight](https://github.com/jonathankirtland/flaskgpt/assets/42749198/535710c4-34b6-4cf7-8269-334b8f80f4cf)
  
- 🖱️ **Click-to-Copy**: 
  - Easily copy GPT's responses with just a click.
  
  - **Try It Out**: Here's a close-up of the button to press for copying:
    - ![Clickable Example Close-up](https://github.com/jonathankirtland/flaskgpt/assets/42749198/650ca76c-9f0a-41f1-ac61-2bbfe4638008)
    - And heres what is shown on the screen after getting your response:
    - ![General Look](https://github.com/jonathankirtland/flaskgpt/assets/42749198/18986987-b480-41b3-8e41-ed258f3f6f0d)

### 📋 Usage Instructions

## Setup Guide for Canvas Assistance

1. 📦 **Install Tampermonkey**: 
    - Download and install the [Tampermonkey extension](https://www.tampermonkey.net/).

2. 📝 **Insert Script**: 
    - Open the Tampermonkey dashboard, create a new script, and paste the provided JS code.

3. 🖊️ **Edit Your Script File**:
    - Make necessary edits based on your configuration.
    - make sure your secret api key matches the text file secret_key.txt
    - ![Tampermonkey Script Configuration](https://github.com/jonathankirtland/flaskgpt/assets/42749198/a5fd1214-d992-4e8a-9435-d2bbd9a225a2)

4. 🖋️ **Edit Your Server File (if needed)**:
    - Modify as per your requirements.
    - ![Server File Configuration](https://github.com/jonathankirtland/flaskgpt/assets/42749198/3e88df1e-427f-4cbf-b86c-f877a3d360a4)

5. 💡 **Engage with Canvas**: 
    - Navigate to a Canvas quiz and see the script in action, processing questions and presenting GPT-3 responses.

6. 🖱️ **Interact with Responses**: 
    - Observe highlighted answers.
    - Use the click-to-copy feature for instant answer retrieval.

7. 🤝 **Support & Feedback**: 
    - Need help or have suggestions? Please open an issue in the repository or reach out to the project maintainer.

---
