from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from time import sleep
import openai
import logging


app = Flask(__name__)
CORS(app)

# Config Variables
API_KEY_PATH = "key.txt"
SECRET_API_KEY_PATH = "secret_key.txt"
MODEL_NAME = "gpt-4"
SERVER_HOST = "127.0.0.1"
SERVER_DEBUG_MODE = True

logging.basicConfig(
    filename="gpt_logs.txt",
    level=logging.INFO,
    format="%(asctime)s - %(message)s",
    datefmt="%d-%b-%y %H:%M:%S",
)


def gpt_query(question, answers_string, instruction):
    """
    Query GPT with a given question, answers, and instruction.
    Returns the assistant's reply.
    """
    messages = [
        {"role": "system", "content": instruction},
        {"role": "user", "content": question},
        {"role": "user", "content": answers_string},
    ]

    completion = openai.ChatCompletion.create(model=MODEL_NAME, messages=messages)
    return completion.choices[0].message["content"].strip()


# Read API keys from file
with open(API_KEY_PATH, "r") as f:
    openai.api_key = f.read().strip()

with open(SECRET_API_KEY_PATH, "r") as f:
    SECRET_API_KEY = f.read().strip()


@app.route("/process_data", methods=["POST"])
def process_data():
    # API Key authentication
    provided_api_key = request.headers.get("X-API-KEY")
    if not provided_api_key or provided_api_key != SECRET_API_KEY:
        abort(401)  # Unauthorized

    incoming_data = request.json
    if not incoming_data or "data" not in incoming_data:
        abort(400)  # Bad request

    data = incoming_data["data"]
    processed_data = []

    for item in data:
        question_type = item["type"]
        question = item["question"]
        answers = item["answers"]
        answers_string = " |;| ".join(answers)

        instruction_explanation = f"Please explain the thought process or reasoning behind how you would answer the question: '{question}'. Given the options: {answers_string}."
        explanation = gpt_query(question, answers_string, instruction_explanation)
        logging.info(f"\nQuestion:\n {question},\n GPT-Explanation:\n {explanation}\n")

        # Combine the original question with the explanation
        explicit_explanation = f"In response to the question '{question}', the thought process is as follows: {explanation}"

        if question_type == "Multiple_Choice/True_False":
            instruction = """
            You're assisting with a quiz. First, you will be provided with an explanation or background information along with the main question and its options. Your task is to determine the correct answer from the provided options. Your answer should:
            1. Strictly use the provided options.
            2. Not introduce any additional punctuation or words.
            3. Be as concise as possible.

            If there are multiple correct answers, separate them with a '~'. It's expected that the explanation contains clues or directly gives away the answer.

            Example:
            Explanation: Even numbers are integers that can be divided evenly by 2.
            Question: Which of these are even numbers?
            Options: 1 |;| 2 |;| 3 |;| 4 |;| 5
            Response: 2~4
            """
        else:
            instruction = """
            You're recieving the thought process for and an attempted answer for a long answer/short answer question. 
            please do your best to give a concise and accurate answer to all parts of the question using the context.
            """

        # Use question with OpenAI API
        try:
            # Extract the assistant's reply from the response
            assistant_reply = gpt_query(explicit_explanation, answers_string, instruction)
            logging.info(f"\nGPT Exact Answer: \n{assistant_reply}")

            # Append the original question, its potential answers, and the GPT-3 response
            processed_item = {
                "gpt_response": assistant_reply,
                "question": question,
                "answers": item["answers"],
            }
            processed_data.append(processed_item)
            sleep(2)  # introduce a 5-second delay between API calls
        except openai.error.RateLimitError:
            return (
                jsonify({"error": "Rate limit exceeded. Please try again later."}),
                429,
            )  # HTTP 429 Too Many Requests

    return jsonify(processed_data)


@app.errorhandler(400)
def bad_request_error(error):
    return jsonify({"error": "Bad Request"}), 400


@app.errorhandler(401)
def unauthorized_error(error):
    return jsonify({"error": "Unauthorized"}), 401


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal Server Error"}), 500


if __name__ == "__main__":
    app.run(host=SERVER_HOST, debug=SERVER_DEBUG_MODE)  # Limit IP binding to localhost
