import React from 'react'
import './App.css'

let historyPointer = 0
let historyPointerMax = 0
let searchMode = false

const listOfCommands = [
  'start',
  'debug',
]

function App() {
  // Create a list of terminal lines
  const [lines, setLines] = React.useState([
    "Welcome to the terminal quiz!",
    "Type 'start' to begin."
  ])

  const [input, setInput] = React.useState("")

  // List of strings that the user has typed
  const [history, setHistory] = React.useState<string[]>([])

  const lineStart = "pucko:$ "

  // Read all keys pressed by the user
    const handleKeyDown = (event: KeyboardEvent) => {
      // If the user presses backspace, remove the last character from the input
      if (event.key === "Backspace") {
        // If ctrl is pressed, remove the last word separated by spaces
        if (event.ctrlKey) {
          setInput(input.split(" ").slice(0, -1).join(" "))
          return;
        }

        setInput(input.slice(0, -1))
        return;
      }

      // If the user presses enter, submit the input
      if (event.key === "Enter") {
        const handleResult = handleEnter()

        if(handleResult) {
          // Add the input to the list of lines
          setLines([...lines, lineStart + input, handleResult])
        } else {
          // Add the input to the list of lines
          setLines([...lines, lineStart + input])
        }

        if (input !== "") {
          const tmpHistory = [...history, input]

          // Add the input to the history
          setHistory(tmpHistory)


          // Set pointer length to the current history length
          historyPointer = tmpHistory.length -1
          historyPointerMax = tmpHistory.length -1
        }

        // Clear the input
        setInput("")
        return;
      }

      // If ctrl l is pressed, clear the terminal
      if (event.key === "l" && event.ctrlKey) {
        event.preventDefault()

        // Clear the terminal
        setLines([])
        // Clear input
        setInput("")

        return;
      }

      // If ctrl r is pressed, search the history
      if (event.key === "r" && event.ctrlKey) {
        event.preventDefault()

        // Toggle search mode
        searchMode = !searchMode

        return;
      }
      

      if (event.key === "Tab") {
        event.preventDefault()
        // Find number of commands that start with the input
        const commands = listOfCommands.filter(command => command.startsWith(input))

        if(commands.length === 1) {
          setInput(commands[0])
        }
      }

      // Ignore key presses that don't produce a character
      if (event.key.length > 1) return

      // Add the key to the input
      setInput(input + event.key)
    }

  // Key presses are global, so we need to add and remove the event listener
  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // When the user presses enter, check the input
  const handleEnter = () => {
    // If the user types 'start', start the quiz
    if (input === "start") {
      // Add a new line to the terminal
      return "Starting the quiz...";
    }

    if (input === "debug") {
      return "historyPointer: " + historyPointer + ", historyPointerMax: " + historyPointerMax + ", history: " + history;
    }

    // If the types nothing, do nothing
    if (input === "") {
      return "";
    }

    return `Command \"${input}\" not found`;
  }

  React.useEffect(() => {
            // Scroll to the bottom of the terminal
            window.scrollTo(0, document.body.scrollHeight)
  }, [lines])

  return (
    <div className="App" id="app">
      {/* Print the lines here */}
      {lines.map((line, index) => {
        return <p key={index} className="terminal-text">{line}</p>
      })}
      {/* Print the input here */}
      <p className="terminal-text terminal-input" id="input">{lineStart + input}</p>
    </div>
  )
}

export default App
