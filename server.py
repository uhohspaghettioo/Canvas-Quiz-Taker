from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from openai import OpenAI
import logging
from time import sleep

# Initialize Flask App
app = Flask(__name__)
CORS(app)

# Config Variables
API_KEY_PATH = "key.txt"
SECRET_API_KEY_PATH = "secret_key.txt"
MODEL_NAME = "gpt-4"
SERVER_HOST = "127.0.0.1"
SERVER_DEBUG_MODE = True

# Initialize Logging
logging.basicConfig(
    filename="gpt_logs.txt",
    level=logging.INFO,
    format="%(asctime)s - %(message)s",
    datefmt="%d-%b-%y %H:%M:%S",
)

# Read API keys from file
with open(API_KEY_PATH, "r") as f:
    Client = OpenAI(api_key=f.read().strip())

with open(SECRET_API_KEY_PATH, "r") as f:
    SECRET_API_KEY = f.read().strip()

def gpt_query(question, answers_string, instruction):
    """
    Query GPT with a given question, answers, and instruction.
    Returns the assistant's reply.
    """
    try:
        response = Client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": instruction},
                {"role": "user", "content": question},
                {"role": "user", "content": answers_string},
            ]
        )
        return response.choices[0].message.content if response.choices else None
    except Exception as e:  # Consider specific exception handling
        logging.error(f"Error in GPT query: {e}")
        return None

@app.route("/process_data", methods=["POST"])
def process_data():
    provided_api_key = request.headers.get("X-API-KEY")
    logging.info(f"Received headers: {request.headers}")
    
    if not provided_api_key or provided_api_key != SECRET_API_KEY:
        abort(401)  # Unauthorized

    incoming_data = request.json
    if not incoming_data or "data" not in incoming_data:
        abort(400)  # Bad request

    processed_data = process_incoming_data(incoming_data["data"])
    return jsonify(processed_data)

def process_incoming_data(data):
    processed_data = []
    for item in data:
        processed_item = process_single_item(item)
        if processed_item:
            processed_data.append(processed_item)
            sleep(2)  # introduce a delay between API calls
    return processed_data

def process_single_item(item):
    question_type = item.get("type")
    question = item.get("question")
    answers = item.get("answers")
    
    # Ensure all required data is present
    if not (question_type and question):
        logging.error(f"Invalid item structure: {item}")
        return None

    # Combine answers into a string
    answers_string = " |;| ".join(answers)

    # Generate explanation instruction
    instruction_explanation = generate_instruction_explanation(question, answers_string)
    
    # Query GPT for explanation
    explanation = gpt_query(question, answers_string, instruction_explanation)
    logging.info(f"\nQuestion:\n{question},\nGPT-Explanation:\n{explanation}\n")
    
    # If the explanation is None (e.g., due to an error), don't proceed further
    if explanation is None:
        return None

    # Combine the original question with the explanation
    explicit_explanation = generate_explicit_explanation(question, explanation)

    # Generate instruction based on the question type
    instruction = generate_instruction(question_type, answers_string)

    # Query GPT with the explicit explanation and instruction
    try:
        assistant_reply = gpt_query(explicit_explanation, answers_string, instruction)
        logging.info(f"\nGPT Exact Answer: \n{assistant_reply}")

        # If the assistant's reply is None (e.g., due to an error), don't proceed further
        if assistant_reply is None:
            return None

        # Create the processed item with the original question, its potential answers, and the GPT response
        processed_item = {
            "gpt_response": assistant_reply,
            "question": question,
            "answers": answers,
        }
        return processed_item
    except openai.error.RateLimitError:
        logging.error("Rate limit exceeded.")
        return None

def generate_instruction_explanation(question, answers_string):
    return f"Please explain the thought process or reasoning behind how you would answer the question: '{question}'. Given the options: {answers_string}."

def generate_explicit_explanation(question, instruction_explanation):
    return f"In response to the question '{question}', the thought process is as follows: {instruction_explanation}"

def generate_instruction(question_type, answers_string):
    if question_type == "Multiple_Choice/True_False":
        return f"""
            You're assisting with a quiz. First, you will be provided with an explanation or background information along with the main question and its options. Your task is to determine the correct answer from the provided options. Your answer should:
            1. Strictly use the provided options.
            2. Not introduce any additional punctuation or words.
            3. Be as concise as possible.

            If there are multiple correct answers, separate them with a '~' this is very important for the format of the code. It's expected that the explanation contains clues or directly gives away the answer.

            Example:
            Explanation: Even numbers are integers that can be divided evenly by 2.
            Question: Which of these are even numbers?
            Options: {answers_string}
            Response: 2~4
            """
    else:
        return f"""
            You're receiving the thought process for and an attempted answer for a long answer/short answer question. 
            Please do your best to give a concise and accurate answer to all parts of the question using the context.
            """

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
    app.run(host=SERVER_HOST, debug=SERVER_DEBUG_MODE)
