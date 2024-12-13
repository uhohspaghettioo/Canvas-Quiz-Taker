// ==UserScript==
// @name         quizzy
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://csulb.instructure.com/courses/*/quizzes/*/take/questions/*
// @match        https://csulb.instructure.com/courses/*/quizzes/*/take*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=instructure.com
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
  "use strict";

  function areAnswersEquivalent(a, b) {
    const normalize = (str) =>
      str.trim().endsWith(".") ? str.trim().slice(0, -1) : str.trim();
    return normalize(a) === normalize(b);
  }

  function classifyQuestionType(question, answers) {
    if (answers.length > 1)
    {
      return "Multiple_Choice/True_False";
    }
    else
    {
        return "Long Essay";
    }

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
    const questionElements = document.querySelectorAll("div.question_text.user_content.enhanced");

    // Exit if no questions found
    if (!questionElements.length) return;

    questionElements.forEach((qElement) =>
    {
      const question = qElement.textContent.trim();

      // the answer divs are siblings or at least close to the question elements
      const answersParent = qElement.closest(".answers") || qElement.nextElementSibling;

      if (answersParent)
      {
        const answerElements = answersParent.querySelectorAll(".answer_label");

        const answers = [];

        // if there are no answer elements, we need to check if it is matching, which has answers under a different class
        if (!answerElements.length)
        {
          const matchingAnswers = answersParent.querySelectorAll(".answer");

          if (matchingAnswers.length)
          {
            matchingAnswers.forEach((matchingAnswer) =>
            {
              const answerText = matchingAnswer.textContent.trim();
              answers.push(answerText);
            });
          }
        }

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
  GM.xmlHttpRequest({
    method: "POST",
    url: "http://localhost:5000/process_data",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": "1234", // Add this line for authentication
    },
    data: JSON.stringify({
      data: data,
    }),
    onload: function (response) {
      if (response.status === 200) {
        const processedData = JSON.parse(response.responseText);
        console.log(processedData);

        // Loop through each processed data item
        processedData.forEach((item, index) => {
          const questionElement = document.querySelectorAll(
            "div.question_text.user_content.enhanced"
          )[index];

          const gptAnswers = item.gpt_response
            .split("~")
            .map((answer) => answer.trim());

          if (item.answers.length === 0) {
            const gptResponseDiv = document.createElement("div");
            gptResponseDiv.className = "gpt-response";

            const questionPointsHolders = document.querySelectorAll(
              ".question_points_holder"
            );
            if (questionPointsHolders.length > 0) {
              questionPointsHolders.forEach((holder, i) => {
                holder.addEventListener("click", (event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  if (processedData[i]) {
                    copyToClipboard(processedData[i].gpt_response);
                  }
                });
              });
            }
          } else {
            const answersParent =
              questionElement.closest(".answers") || questionElement.nextElementSibling;
            const answerElements = answersParent.querySelectorAll(".answer_label");
            const dropdownElements = answersParent.querySelectorAll(".option");

            gptAnswers.sort((a, b) => b.length - a.length);

            gptAnswers.forEach((gptAnswer) => {
              answerElements.forEach((answerElement) => {
                const answerText = answerElement.textContent.trim();
                if (areAnswersEquivalent(answerElement.textContent, gptAnswer)) {
                  if (answerElement.querySelector("strong")) {
                    answerElement.innerHTML = `<strong>${
                      answerText.startsWith(".")
                        ? answerElement.querySelector("strong").textContent
                        : "." + answerElement.querySelector("strong").textContent
                    }</strong>`;
                  } else {
                    answerElement.textContent = answerText.startsWith(".")
                      ? answerText
                      : "." + answerText;
                  }
                }
              });

              dropdownElements.forEach((dropdownElement) => {
                const dropdownText = dropdownElement.textContent.trim();
                if (areAnswersEquivalent(dropdownElement.textContent, gptAnswer)) {
                  if (dropdownElement.querySelector("strong")) {
                    dropdownElement.innerHTML = `<strong>${
                      dropdownText.startsWith(".")
                        ? dropdownElement.querySelector("strong").textContent
                        : "." + dropdownElement.querySelector("strong").textContent
                    }</strong>`;
                  } else {
                    dropdownElement.textContent = dropdownText.startsWith(".")
                      ? dropdownText
                      : "." + dropdownText;
                  }
                }
              });
            });
          }
        });
      } else {
        console.error("Error: Failed to process data");
      }
    },
    onerror: function (error) {
      console.error("Error:", error);
    },
  });
}


  // Using MutationObserver to watch for changes in the DOM
  const observer = new MutationObserver(grabData);

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
