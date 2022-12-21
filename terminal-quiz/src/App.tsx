import React from "react";
import "./App.css";
import {
  eventEmitter,
  changeRoom,
  getRoom,
  setHost,
  getIsHost,
} from "./protocol/main";

let historyPointer = 0;
let historyPointerMax = 0;
let searchMode = false;

const listOfCommands = [
  "start",
  "debug",
  "changeRoom",
  "getRoom",
  "setHost",
  "setUserName",
];

function App() {
  // Lisen for incoming messages and console.log them
  React.useEffect(() => {
    eventEmitter.on("messageIncoming", (message) => {
      if (message.type === "start") {
        setLines(["Game started!"]);
        setGameRunning(true);
      }
    });
  }, []);

  // Try trivia api to check availability
  React.useEffect(() => {
    fetch("https://the-trivia-api.com/api/questions?limit=0")
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "error") {
          setLines([
            "The trivia api is currently unavailable, please try again later",
          ]);
        }
      })
      .catch((error) => {
        setLines([
          "The trivia api is currently unavailable, please try again later",
        ]);
      });
  }, []);

  // Creates a state for if the game is running
  const [gameRunning, setGameRunning] = React.useState(false);

  const [userName, setUserName] = React.useState("");

  const [answering, setAnswering] = React.useState(false);

  type Answer = {
    userName: string;
    score: number;
  };

  const [scores, setScores] = React.useState<Answer[]>([]);

  type Question = {
    question: string;
    answers: string[];
    correctAnswer: string;
    timeOut: number;
    askTime: number;
  };

  const [question, setQuestion] = React.useState<Question>({
    question: "",
    answers: [],
    correctAnswer: "",
    timeOut: 0,
    askTime: 0,
  });

  // Function to print question and answers to the terminal
  const printQuestion = (question: Question): void => {
    // Set answering to true
    setAnswering(true);
    setTimeout(() => {
      // Set answering to false
      setAnswering(false);
      setLines((lines) => [
        ...lines,
        "Time's up! The correct answer was: " + question.correctAnswer,
      ]);
    }, question.timeOut * 1000);

    // Print the question to the terminal
    setLines(() => ["Question: " + question.question]);
    // Print the answers to the terminal with numbers
    setLines((lines) => [
      ...lines,
      "1. " + question.answers[0],
      "2. " + question.answers[1],
      "3. " + question.answers[2],
      "4. " + question.answers[3],
    ]);
  };

  const [answers, setAnswers] = React.useState<string[]>([]);

  // Create a list of terminal lines
  const [lines, setLines] = React.useState([
    "Welcome to the terminal quiz!",
    "Type 'start' to begin.",
  ]);

  const [input, setInput] = React.useState("");

  // List of strings that the user has typed
  const [history, setHistory] = React.useState<string[]>([]);

  const lineStart = `${getRoom()}:$ `;

  // Print question when it is received
  React.useEffect(() => {
    eventEmitter.on("messageIncoming", (message) => {
      if (message.type === "question") {
        console.log("Got question");
        printQuestion(message.question);
        setQuestion(message.question);
        setAnswers(message.answers);
      }
    });
  }, []);

  // Save the answers of the users
  React.useEffect(() => {
    eventEmitter.on("messageIncoming", (message) => {
      if (message.type === "answer" && getIsHost()) {
        // Check if answer is correct
        console.log(message.answer);

        if (message.answer == "correct") {
          // Print the answer to the terminal
          setLines((lines) => [
            ...lines,
            message.userName + " answered correctly!",
          ]);

          // Calculate the score
          const answerTime = message.answerTime;

          const timeOut = message.timeOut * 1000;

          const score = Math.round((timeOut - answerTime) * 100);
          console.log(score);

          // Add the score to the list of scores
          setScores((scores) => [
            ...scores,
            { userName: message.userName, score: score },
          ]);
        } else {
          // Print the answer to the terminal
          setLines((lines) => [
            ...lines,
            message.userName + " answered incorrectly!",
          ]);
        }
      }
    });
  }, []);

  // Read all keys pressed by the user
  const handleKeyDown = (event: KeyboardEvent) => {
    // If the user presses backspace, remove the last character from the input
    if (event.key === "Backspace") {
      // If ctrl is pressed, remove the last word separated by spaces
      if (event.ctrlKey) {
        setInput(input.split(" ").slice(0, -1).join(" "));
        return;
      }

      setInput(input.slice(0, -1));
      return;
    }

    // If the user presses enter, submit the input
    if (event.key === "Enter") {
      const handleResult = handleEnter();

      if (handleResult) {
        // Add the input to the list of lines
        setLines([...lines, lineStart + input, handleResult]);
      } else {
        // Add the input to the list of lines
        setLines([...lines, lineStart + input]);
      }

      if (input !== "") {
        const tmpHistory = [...history, input];

        // Add the input to the history
        setHistory(tmpHistory);

        // Set pointer length to the current history length
        historyPointer = tmpHistory.length - 1;
        historyPointerMax = tmpHistory.length - 1;
      }

      // Clear the input
      setInput("");
      return;
    }

    // If ctrl l is pressed, clear the terminal
    if (event.key === "l" && event.ctrlKey) {
      event.preventDefault();

      // Clear the terminal
      setLines([]);
      // Clear input
      setInput("");

      return;
    }

    // If ctrl r is pressed, search the history
    if (event.key === "r" && event.ctrlKey) {
      event.preventDefault();

      // Toggle search mode
      searchMode = !searchMode;

      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      // Find number of commands that start with the input
      const commands = listOfCommands.filter((command) =>
        command.startsWith(input)
      );

      if (commands.length === 1) {
        setInput(commands[0]);
      }
    }

    // Ignore key presses that don't produce a character
    if (event.key.length > 1) return;

    // Add the key to the input
    setInput(input + event.key);
  };

  // Key presses are global, so we need to add and remove the event listener
  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // When the user presses enter, check the input
  const handleEnter = (): string => {
    if (gameRunning) {
      return handleAnswer(input);
    }

    // If the user types 'start', start the quiz
    if (input === "start") {
      // If the game is already running, return
      if (gameRunning) return "The game is already running";

      if (getIsHost() === false)
        return "You are not the host, you can't start the quiz";

      eventEmitter.emit("messageOutgoing", {
        time: Date.now(),
        type: "start",
      });

      // Set the game to running
      setGameRunning(true);

      // Add a new line to the terminal
      return "Starting the quiz, type next to get the next question";
    }

    if (input === "debug") {
      return (
        "historyPointer: " +
        historyPointer +
        ", historyPointerMax: " +
        historyPointerMax +
        ", history: " +
        history
      );
    }

    if (input.startsWith("changeRoom")) {
      if (input.split(" ").length !== 2)
        return 'Invalid use of command changeRoom, use "changeRoom <room>"';
      const room = input.split(" ")[1];
      if (room == "")
        return 'Invalid use of command changeRoom, use "changeRoom <room>"';
      changeRoom(room);
      return "Changing room to " + room;
    }

    if (input === "getRoom") {
      if (getRoom() == "") return "Room is not set, use changeRoom <room>";
      return "Room is " + getRoom();
    }

    if (input == "setHost") {
      return setHost();
    }

    if (input.startsWith("setUserName")) {
      if (input.split(" ").length !== 2)
        return 'Invalid use of command setUserName, use "setUserName <name>"';
      const name = input.split(" ")[1];
      if (name == "")
        return 'Invalid use of command setUserName, use "setUserName <name>"';
      setUserName(name);
      return "Changing name to " + name;
    }

    // If the types nothing, do nothing
    if (input === "") {
      return "";
    }

    return `Command \"${input}\" not found`;
  };

  React.useEffect(() => {
    // Scroll to the bottom of the terminal
    window.scrollTo(0, document.body.scrollHeight);
  }, [lines]);

  // Function to handle answering when game is running
  const handleAnswer = (answer: string): string => {
    if (answer === "") return "";

    // Send numbers between 1 and 4 to the server
    if (answer == "1" || answer == "2" || answer == "3" || answer == "4") {
      if (!getIsHost()) {
        // Check if the answer is correct
        if (
          question.answers[parseInt(answer) - 1] === question.correctAnswer &&
          answering
        ) {
          setAnswering(false);

          eventEmitter.emit("messageOutgoing", {
            time: Date.now(),
            type: "answer",
            answer: "correct",
            answerTime: Date.now() - question.askTime,
            userName: userName,
            timeOut: question.timeOut,
          });

          return "Correct answer";
        }
        setAnswering(false);

        if (!answering) {
          return "You already answered";
        }

        eventEmitter.emit("messageOutgoing", {
          time: Date.now(),
          type: "answer",
          answer: "incorrect",
          answerTime: Date.now() - question.askTime,
          userName: userName,
          timeOut: question.timeOut,
        });
        return "Incorrect answer";
      } else {
        if (!answering) {
          return "You already answered";
        }
        // If the user is the host, save the answer directly to scores
        if (
          question.answers[parseInt(answer) - 1] === question.correctAnswer &&
          answering
        ) {
          const answerTime = Date.now() - question.askTime;

          const timeOut = question.timeOut;

          const score = Math.round((timeOut - answerTime) * 100);

          // Add the score to the list of scores
          setScores((scores) => [
            ...scores,
            { userName: userName, score: score },
          ]);

          setAnswering(false);

          return "Correct answer";
        } else {
          setAnswering(false);
          return "Incorrect answer";
        }
      }
    }

    // If the user types 'next', get the next question
    if (answer === "next" && getIsHost()) {
      console.log("next");
      // Get the next question from trivia using the trivia API
      fetch("https://the-trivia-api.com/api/questions?limit=1")
        .then((response) => response.json())
        .then((data) => {
          let answers = data[0].incorrectAnswers
            .concat(data[0].correctAnswer)
            .sort(() => Math.random() - 0.5);

          const timeOut = 10;

          const question: Question = {
            question: data[0].question,
            answers: answers,
            correctAnswer: data[0].correctAnswer,
            timeOut: timeOut,
            askTime: Date.now(),
          };

          setQuestion(question);

          eventEmitter.emit("messageOutgoing", {
            time: Date.now(),
            type: "question",
            question: question,
          });

          printQuestion(question);
        });

      return "";
    }

    if (answer === "done" && getIsHost()) {
      const scoresByName: { [key: string]: number } = {};

      scores.forEach((score) => {
        if (scoresByName[score.userName]) {
          scoresByName[score.userName] += score.score;
        } else {
          scoresByName[score.userName] = score.score;
        }
      });

      const combinedScores = Object.entries(scoresByName).map(
        ([userName, score]) => ({
          userName,
          score,
        })
      );

      const top3Scores = combinedScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      // Print the top 3 scores
      let top3String = "Top 3 scores:";
      top3Scores.forEach((score, index) => {
        top3String += `
        ${index + 1}. ${score.userName} - ${score.score}`;
      });

      // Set the game to not running
      setGameRunning(false);

      changeRoom("");

      // Add a new line to the terminal
      return top3String;
    }

    // If the user types 'leave', leave the quiz
    if (answer === "leave") {
      // Set the game to not running
      setGameRunning(false);

      changeRoom("");

      // Add a new line to the terminal
      return "Leaving the quiz...";
    }

    // If the user types anything else, return an error
    return `Command \"${answer}\" not found, please enter a number between 1 and 4 or type 'leave' to leave the quiz`;
  };

  return (
    <div className="App" id="app">
      {/* Print the lines here */}
      {lines.map((line, index) => {
        return (
          <p key={index} className="terminal-text">
            {line}
          </p>
        );
      })}
      {/* Print the input here */}
      <p className="terminal-text terminal-input" id="input">
        {lineStart + input}
      </p>
    </div>
  );
}

export default App;
