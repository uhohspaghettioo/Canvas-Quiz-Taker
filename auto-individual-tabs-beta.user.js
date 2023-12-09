// ==UserScript==
// @name         auto-individual-tabs-prod
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://csulb.instructure.com/courses/*/quizzes/*/take/questions/*
// @match        https://csulb.instructure.com/courses/*/quizzes/*/take*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=instructure.com
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function areAnswersEquivalent(a, b) {
    const normalize = (str) =>
      str.trim().endsWith(".") ? str.trim().slice(0, -1) : str.trim();
    return normalize(a) === normalize(b);
  }

  function classifyQuestionType(question, answers) {
    return answers.length > 1
      ? "Multiple_Choice/True_False"
      : "Essay/Short_Answer";
  }

  function copyToClipboard(text) {
    const textarea = document.createElement("textarea");
    textarea.textContent = text;
    textarea.style.position = "fixed"; // Prevent scrolling to the bottom of the page when appending
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand("copy");
    } catch (ex) {
      console.warn("Copy to clipboard failed.", ex);
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }

  let hasRun = false;

  function grabData() {
    if (hasRun) return;

    const questionsData = [];
    const questionElements = document.querySelectorAll(
      "div.question_text.user_content.enhanced"
    );

    // Exit if no questions found
    if (!questionElements.length) return;

    questionElements.forEach((qElement) => {
      const question = qElement.textContent.trim();

      // Assuming the answer divs are siblings or at least close to the question elements
      const answersParent =
        qElement.closest(".answers") || qElement.nextElementSibling;

      if (answersParent) {
        const answerElements = answersParent.querySelectorAll(".answer_label");

        const answers = [];

        answerElements.forEach((aElement) => {
          answers.push(aElement.textContent.trim());
        });
        const questiontype = classifyQuestionType(question, answers);

        questionsData.push({
          question: question,
          answers: answers,
          type: questiontype,
        });
      }
    });

    sendDataToServer(questionsData);

    hasRun = true;
    observer.disconnect();
  }

  function sendDataToServer(data) {
    fetch("http://localhost:5000/process_data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": "1234", // Add this line
      },
      body: JSON.stringify({
        data: data,
      }),
    })
      .then((response) => response.json())
      .then((processedData) => {
        console.log(processedData);

        // Loop through each processed data item
        processedData.forEach((item, index) => {
          // Locate the corresponding question on the page
          const questionElement = document.querySelectorAll(
            "div.question_text.user_content.enhanced"
          )[index];

          // Split the GPT response into potential multiple answers
          const gptAnswers = item.gpt_response
            .split("~")
            .map((answer) => answer.trim());

          // If there are no answer choices provided (numAnswers is 0)
          if (item.answers.length === 0) {
            const gptResponseDiv = document.createElement("div");
            gptResponseDiv.className = "gpt-response"; // adding a class for styling (optional)

            if (item.gpt_response.length > 0) {
              // Get all elements with the class "question_points_holder"
              const questionPointsHolders = document.querySelectorAll(
                ".question_points_holder"
              );

              // Add click events to "question_points_holder" elements if they exist
              if (questionPointsHolders.length > 0) {
                questionPointsHolders.forEach((questionPointsHolder, i) => {
                  questionPointsHolder.addEventListener("click", (event) => {
                    event.stopPropagation();
                    event.preventDefault(); // Prevent any default behavior

                    // Ensure there's a corresponding item in processedData for this index
                    if (processedData[i]) {
                      copyToClipboard(processedData[i].gpt_response);
                    }
                  });
                });
              }

              // Create a toggle button for the GPT response visibility
              const toggleButton = document.createElement("button");
              toggleButton.className = "toggle-button";
              toggleButton.textContent = "⇕"; // using a simple up-down arrow for visual representation
              toggleButton.style.fontSize = "10px";
              toggleButton.style.cursor = "pointer";
              toggleButton.style.background = "none";
              toggleButton.style.border = "none";

              toggleButton.addEventListener("click", (event) => {
                event.stopPropagation();
                event.preventDefault();
                const content = gptResponseDiv.querySelector(
                  ".gpt-response-content"
                );
                if (
                  content.style.display === "none" ||
                  content.style.maxHeight === "0px"
                ) {
                  content.style.display = "block";
                  content.style.maxHeight = "1000px"; // or any other suitable max-height value
                } else {
                  content.style.display = "none";
                  content.style.maxHeight = "0";
                }
              });

              // Create a div for the GPT response content
              const contentDiv = document.createElement("div");
              contentDiv.className = "gpt-response-content";
              contentDiv.style.display = "none";
              contentDiv.style.transition = "max-height 0.3s ease-in-out";
              contentDiv.style.overflow = "hidden";
              contentDiv.style.maxHeight = "0";
              contentDiv.textContent = processedData[index].gpt_response;

              // Append elements to the main div
              gptResponseDiv.appendChild(toggleButton);
              gptResponseDiv.appendChild(contentDiv);
            } else {
              gptResponseDiv.textContent = "";
            }

            // Insert the created div after the "questionElement"
            questionElement.parentNode.insertBefore(
              gptResponseDiv,
              questionElement.nextSibling
            );
          } else {
            // The logic for handling multiple choice questions...
            const answersParent =
              questionElement.closest(".answers") ||
              questionElement.nextElementSibling;
            const answerElements =
              answersParent.querySelectorAll(".answer_label");

            gptAnswers.sort((a, b) => b.length - a.length);

            gptAnswers.forEach((gptAnswer) => {
              answerElements.forEach((answerElement) => {
                const answerText = answerElement.textContent.trim();

                // Check if the GPT response contains the stripped original answer text
                if (
                  areAnswersEquivalent(answerElement.textContent, gptAnswer)
                ) {
                  // Modify the answer's text (or any other attribute) as desired
                  if (answerElement.querySelector("strong")) {
                    // It's already bolded, let's modify it
                    if (!answerText.startsWith(".")) {
                      answerElement.innerHTML = `<strong>.${
                        answerElement.querySelector("strong").textContent
                      }</strong>`;
                    } else {
                      answerElement.innerHTML = `<strong>${
                        answerElement.querySelector("strong").textContent
                      }</strong>`;
                    }
                  } else {
                    // It's not bolded, let's modify it
                    if (!answerText.startsWith(".")) {
                      answerElement.textContent = `.${answerText}`;
                    } else {
                      answerElement.textContent = `${answerText}`;
                    }
                  }
                }
              });
            });
          }
        });
      })

      // ... rest of the code
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  // Using MutationObserver to watch for changes in the DOM
  const observer = new MutationObserver(grabData);

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
