'use client'

import { useState, useEffect } from "react";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [mainTaskInput, setMainTaskInput] = useState("");
  const [subtaskInput, setSubtaskInput] = useState("");
  const [selectedMainTask, setSelectedMainTask] = useState(null);
  const [displayedTask, setDisplayedTask] = useState("");
  const [showMainTaskModal, setShowMainTaskModal] = useState(false); // Modal for main task
  const [showSubtaskModal, setShowSubtaskModal] = useState(false); // Modal for subtask
  const [selectedForRandom, setSelectedForRandom] = useState([]); // Stores tasks selected for randomization
  const [completedTasks, setCompletedTasks] = useState([]); // For completed tasks

  // Load tasks from local storage when the component mounts
  useEffect(() => {
    const storedTasks = localStorage.getItem("tasks");
    const storedCompletedTasks = localStorage.getItem("completedTasks");
    if (storedTasks) setTasks(JSON.parse(storedTasks));
    if (storedCompletedTasks) setCompletedTasks(JSON.parse(storedCompletedTasks));
  }, []);

  // Function to save tasks to local storage
  function saveToLocalStorage(updatedTasks) {
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  }

  // Function to save completed tasks to local storage
  function saveCompletedTasksToLocalStorage(updatedCompletedTasks) {
    localStorage.setItem("completedTasks", JSON.stringify(updatedCompletedTasks));
  }

  // Function to add a main task (through modal)
  function addMainTask() {
    if (mainTaskInput.trim() === "") {
      alert("Please enter a main task");
      return;
    }

    const updatedTasks = [...tasks, { mainTask: mainTaskInput, subtasks: [], completed: false }];
    setTasks(updatedTasks);
    saveToLocalStorage(updatedTasks);
    setMainTaskInput(""); // Clear the input field
    setShowMainTaskModal(false); // Close the modal
  }

  // Function to add a subtask to the selected main task
  function addSubtask() {
    if (!selectedMainTask || !subtaskInput.trim()) return;
  
    const updatedTasks = [...tasks];
    updatedTasks[selectedMainTask].subtasks.push({
      name: subtaskInput,
      completed: false,
    });
    setTasks(updatedTasks);
    setSubtaskInput('');
    closeSubtaskModal();
  }
  
  // Function to mark subtasks as completed
 // Function to mark subtasks as completed
function completeSubtask(taskIndex, subtaskIndex) {
  const updatedTasks = [...tasks];
  updatedTasks[taskIndex].subtasks[subtaskIndex].completed = true;

  // Check if all subtasks are completed
  const allCompleted = updatedTasks[taskIndex].subtasks.every(
    (subtask) => subtask.completed
  );

  // If all subtasks are completed, move the main task to completedTasks
  if (allCompleted) {
    const completedTask = {
        mainTask: updatedTasks[taskIndex].mainTask,
        subtasks: updatedTasks[taskIndex].subtasks,
        completedDate: new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false // Use 24-hour format
        }),
    };
    const updatedCompletedTasks = [...completedTasks, completedTask];
    setCompletedTasks(updatedCompletedTasks);
    saveCompletedTasksToLocalStorage(updatedCompletedTasks);

    // Remove the completed task from the original tasks array
    updatedTasks.splice(taskIndex, 1);
}


  setTasks(updatedTasks);
  saveToLocalStorage(updatedTasks); // Save the updated tasks to local storage
}



  

  // Function to get a random task and subtask from selected tasks
  function getRandTask() {
    if (selectedForRandom.length === 0) {
      alert("No tasks selected for randomization");
      return;
    }

    const randMainTaskIndex = Math.floor(Math.random() * selectedForRandom.length);
    const selectedMainTask = tasks[selectedForRandom[randMainTaskIndex]];

    if (selectedMainTask.subtasks.length === 0) {
      alert("This task has no subtasks.");
      return;
    }

    const randSubtaskIndex = Math.floor(Math.random() * selectedMainTask.subtasks.length);
    const randomSubtask = selectedMainTask.subtasks[randSubtaskIndex];

    setDisplayedTask(randomSubtask.name);
    console.log("Main Task:", selectedMainTask.mainTask);
    console.log("Subtasks:", selectedMainTask.subtasks);
  }

  // Function to handle selecting tasks for randomizer
  function toggleTaskSelection(index) {
    const updatedSelected = [...selectedForRandom];
    if (updatedSelected.includes(index)) {
      const idx = updatedSelected.indexOf(index);
      updatedSelected.splice(idx, 1);
    } else {
      updatedSelected.push(index);
    }
    setSelectedForRandom(updatedSelected);
  }

  // Open/close modals
  function openMainTaskModal() {
    setShowMainTaskModal(true);
  }

  function openSubtaskModal() {
    setShowSubtaskModal(true);
  }

  function closeMainTaskModal() {
    setShowMainTaskModal(false);
  }

  function closeSubtaskModal() {
    setShowSubtaskModal(false);
  }

  // Render the task list
  function renderTasks() {
    return tasks.map((task, taskIndex) => (
      <li key={taskIndex}>
        <div className="flex items-center justify-between">
          <div
            className={`font-bold ${task.subtasks.length > 0 && task.subtasks.every(sub => sub.completed) ? "line-through" : ""}`}
          >
            {task.mainTask}
          </div>
          <div className="flex items-center">
            <button
              className="ml-2 bg-blue-500 text-white px-2 py-1 rounded"
              onClick={() => openSubtaskModal(taskIndex)}
            >
              +
            </button>
            <input
              type="checkbox"
              className="ml-4"
              checked={selectedForRandom.includes(taskIndex)}
              onChange={() => toggleTaskSelection(taskIndex)}
            />
          </div>
        </div>
        <ul className="ml-4 list-disc">
          {task.subtasks.map((subtask, subtaskIndex) => (
            <li key={subtaskIndex} className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={subtask.completed}
                onChange={() => completeSubtask(taskIndex, subtaskIndex)}
              />
              <span>{subtask.name}</span>
            </li>
          ))}
        </ul>
      </li>
    ));
  }
  
  // Render the completed tasks
  function renderCompletedTasks() {
    return completedTasks.map((task, index) => (
      <li key={index}>
        <div className="font-bold">
          {task.mainTask} - <span className="italic">Completed on: {task.completedDate}</span>
        </div>
        <ul className="ml-4 list-disc">
          {task.subtasks.map((subtask, subtaskIndex) => (
            <li key={subtaskIndex}>
              <span>{subtask.name}</span>
            </li>
          ))}
        </ul>
      </li>
    ));
  }

  return (
    <div className="">
      <header className="flex justify-between items-center py-4 px-8 bg-gray-100">
        <div className="">
          <a href="#" className="text-2xl font-bold text-gray-800">
            Task Randomizer
          </a>
        </div>
        <div className="">
          <button
            onClick={openMainTaskModal}
            className="bg-green-600 text-white rounded-2xl py-2 px-4"
            aria-label="Add Button"
          >
            Add Main Task
          </button>
        </div>
      </header>
  
      <div className="grid grid-cols-3 gap-4 mt-4 px-8">
        {/* COLUMN 1: Task Management */}
        <div className="grid-cols-1">
          <h2 className="text-xl font-semibold">Tasks</h2>
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
          <h3 className="mt-4 text-lg font-medium">Random Subtask: {displayedTask}</h3>
        </div>
  
        {/* COLUMN 3: Completed Tasks */}
        <div className="grid-cols-1">
          <h2 className="text-xl font-semibold">Completed Tasks</h2>
          <ul className="list-none mt-2">{renderCompletedTasks()}</ul>
        </div>
      </div>
  
      {/* MODAL FOR MAIN TASK */}
      {showMainTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Add Main Task</h2>
            <input
              type="text"
              value={mainTaskInput}
              onChange={(e) => setMainTaskInput(e.target.value)}
              placeholder="Enter main task"
              className="border p-2 w-full mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={addMainTask}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg mr-2"
              >
                Add Task
              </button>
              <button
                onClick={closeMainTaskModal}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
  
      {/* MODAL FOR SUBTASK */}
{showSubtaskModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-8 rounded shadow-lg">
      <h2 className="mb-4 text-lg font-semibold">Add Subtask</h2>
      <input
        type="text"
        value={subtaskInput}
        onChange={(e) => setSubtaskInput(e.target.value)}
        placeholder="Enter subtask"
        className="border p-2 w-full mb-4"
      />
      <select
        className="border p-2 w-full mb-4"
        value={selectedMainTask || ""} // Ensure selectedMainTask is not null
        onChange={(e) => setSelectedMainTask(e.target.value)}
      >
        <option value="" disabled>Select a main task</option> {/* Disabled option */}
        {tasks.map((task, index) => (
          <option key={index} value={index}>
            {task.mainTask}
          </option>
        ))}
      </select>
      <div className="flex justify-end">
        <button
          onClick={addSubtask}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg mr-2"
        >
          Add Subtask
        </button>
        <button
          onClick={closeSubtaskModal}
          className="bg-gray-400 text-white px-4 py-2 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
</div>)}
