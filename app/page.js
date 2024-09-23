'use client'

import { useState, useEffect } from "react";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [mainTaskInput, setMainTaskInput] = useState("");
  const [subtaskInput, setSubtaskInput] = useState("");
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);
  const [displayedTask, setDisplayedTask] = useState(""); // To store the randomly displayed subtask

  // Load tasks from local storage when the component mounts
  useEffect(() => {
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks)); // Parse the stored JSON string
    }
  }, []);

  // Function to save tasks to local storage
  function saveToLocalStorage(updatedTasks) {
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  }

  // Function to add a main task
  function addMainTask() {
    if (mainTaskInput.trim() === "") {
      alert("Please enter a main task");
      return;
    }

    const updatedTasks = [...tasks, { mainTask: mainTaskInput, subtasks: [] }];
    setTasks(updatedTasks);
    saveToLocalStorage(updatedTasks); // Save the new tasks to local storage
    setMainTaskInput(""); // Clear the input field
  }

  // Function to add a subtask
  function addSubtask() {
    if (selectedTaskIndex === null) {
      alert("Please select a main task to add subtasks");
      return;
    }

    if (subtaskInput.trim() === "") {
      alert("Please enter a subtask");
      return;
    }

    const updatedTasks = [...tasks];
    updatedTasks[selectedTaskIndex].subtasks.push(subtaskInput);
    setTasks(updatedTasks);
    saveToLocalStorage(updatedTasks); // Save the updated tasks to local storage
    setSubtaskInput(""); // Clear the input field
  }

  // Function to get a random task and subtask
  function getRandTask() {
    if (tasks.length === 0) {
      alert("No tasks available");
      return;
    }

    // Randomly select a main task
    const randMainTaskIndex = Math.floor(Math.random() * tasks.length);
    const selectedMainTask = tasks[randMainTaskIndex];

    // If the selected main task has no subtasks, display the main task itself
    if (selectedMainTask.subtasks.length === 0) {
      alert("This task has no subtasks.");
      return;
    }

    // Randomly select a subtask from the selected main task
    const randSubtaskIndex = Math.floor(Math.random() * selectedMainTask.subtasks.length);
    const randomSubtask = selectedMainTask.subtasks[randSubtaskIndex];

    // Display the random subtask
    setDisplayedTask(randomSubtask);

    // Log the main task and its subtasks
    console.log("Main Task:", selectedMainTask.mainTask);
    console.log("Subtasks:", selectedMainTask.subtasks);
  }

  // Function to remove a subtask
  function removeSubtask(taskIndex, subtaskIndex) {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex].subtasks = updatedTasks[taskIndex].subtasks.filter((_, i) => i !== subtaskIndex);

    // If the main task no longer has subtasks, you may want to remove it as well
    if (updatedTasks[taskIndex].subtasks.length === 0) {
      updatedTasks.splice(taskIndex, 1); // Remove the entire main task if needed
    }

    setTasks(updatedTasks);
    saveToLocalStorage(updatedTasks); // Save the updated tasks to local storage
  }

  // Function to check if all subtasks are completed
  function areAllSubtasksCompleted(subtasks) {
    return subtasks.length === 0 || subtasks.every((subtask) => subtask.completed);
  }

  // Render the task list
  function renderTasks() {
    return tasks.map((task, taskIndex) => (
      <li key={taskIndex}>
        <div
          className={`font-bold ${areAllSubtasksCompleted(task.subtasks) ? "line-through" : ""}`}
          onClick={() => setSelectedTaskIndex(taskIndex)} // Click to select main task
        >
          {task.mainTask}
        </div>
        <ul className="ml-4 list-disc">
          {task.subtasks.map((subtask, subtaskIndex) => (
            <li key={subtaskIndex} className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                onChange={() => removeSubtask(taskIndex, subtaskIndex)} // Remove the subtask when checked
              />
              <span>{subtask}</span>
            </li>
          ))}
        </ul>
      </li>
    ));
  }

  return (
    <div className="">
      <header className="">
        <div className="">
          <a href="#" className="">
            Task Randomizer
          </a>
        </div>
        <div className="">
          <button
            onClick={addMainTask}
            className="bg-green-600 rounded-2xl py-2 px-4"
            aria-label="Add Button"
          >
            Add Main Task
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* COLUMN 1: Task Management */}
        <div className="grid-cols-1">
          <h2>Add Main Task</h2>
          <input
            type="text"
            value={mainTaskInput}
            onChange={(e) => setMainTaskInput(e.target.value)}
            className="border px-2 py-1"
            placeholder="Enter main task"
          />
          <h2 className="mt-4">Add Subtask</h2>
          <input
            type="text"
            value={subtaskInput}
            onChange={(e) => setSubtaskInput(e.target.value)}
            className="border px-2 py-1"
            placeholder="Enter subtask"
          />
          <button
            onClick={addSubtask}
            className="bg-blue-600 text-white rounded-2xl py-2 px-4 mt-2"
          >
            Add Subtask
          </button>

          <h3 className="mt-6">Tasks</h3>
          <ul className="list-none mt-2">{renderTasks()}</ul>
        </div>

        {/* COLUMN 2: Random Task Generator */}
        <div className="grid-cols-1">
          <button
            onClick={getRandTask}
            className="bg-purple-600 text-white rounded-2xl py-2 px-4"
            aria-label="Generate Random Task"
          >
            GENERATE RANDOM TASK
          </button>

          {/* Display the random subtask */}
          <h3 className="mt-4">Random Subtask: {displayedTask}</h3>
        </div>
      </div>
    </div>
  );
}
