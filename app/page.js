"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [mainTaskInput, setMainTaskInput] = useState("");
  const [subtaskInput, setSubtaskInput] = useState("");
  const [selectedMainTask, setSelectedMainTask] = useState(null);
  const [displayedTask, setDisplayedTask] = useState("");
  const [showMainTaskModal, setShowMainTaskModal] = useState(false); // Modal for main task
  const [showSubtaskModal, setShowSubtaskModal] = useState(false); // Modal for subtask
  const [showRandomTaskModal, setShowRandomTaskModal] = useState(false); // Modal for random task
  const [selectedForRandom, setSelectedForRandom] = useState([]); // Stores tasks selected for randomization
  const [completedTasks, setCompletedTasks] = useState([]); // For completed tasks

  useEffect(() => {
    const storedTasks = localStorage.getItem("tasks");
    const storedCompletedTasks = localStorage.getItem("completedTasks");
    if (storedTasks) setTasks(JSON.parse(storedTasks));
    if (storedCompletedTasks) setCompletedTasks(JSON.parse(storedCompletedTasks));
  }, []);
  
  function saveToLocalStorage(updatedTasks) {
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  }
  
  function saveCompletedTasksToLocalStorage(updatedCompletedTasks) {
    localStorage.setItem("completedTasks", JSON.stringify(updatedCompletedTasks));
  }
  
  function addMainTask() {
    if (mainTaskInput.trim() === "") {
      alert("Please enter a main task");
      return;
    }
  
    const updatedTasks = [
      ...tasks, 
      { mainTask: mainTaskInput, subtasks: [], completed: false }
    ];
    setTasks(updatedTasks);
    saveToLocalStorage(updatedTasks);
    setMainTaskInput(""); 
    setShowMainTaskModal(false);
  }
  
  function addSubtask() {
    if (!selectedMainTask || !subtaskInput.trim()) return;
  
    const updatedTasks = [...tasks];
    // Ensure subtasks array exists before pushing
    if (!updatedTasks[selectedMainTask].subtasks) {
      updatedTasks[selectedMainTask].subtasks = [];
    }
    updatedTasks[selectedMainTask].subtasks.push({
      name: subtaskInput,
      completed: false,
    });
    setTasks(updatedTasks);
    saveToLocalStorage(updatedTasks);  // Save updated tasks to local storage
    setSubtaskInput('');
    closeSubtaskModal();
  }
  
  function completeSubtask(taskIndex, subtaskIndex) {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex].subtasks[subtaskIndex].completed = true;

    const allCompleted = updatedTasks[taskIndex].subtasks.every(
      (subtask) => subtask.completed
    );

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
          hour12: false 
        }),
      };
      const updatedCompletedTasks = [...completedTasks, completedTask];
      setCompletedTasks(updatedCompletedTasks);
      saveCompletedTasksToLocalStorage(updatedCompletedTasks);

      updatedTasks.splice(taskIndex, 1);
    }

    setTasks(updatedTasks);
    saveToLocalStorage(updatedTasks); 
  }

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
    setShowRandomTaskModal(true);
  }

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

  function closeRandomTaskModal() {
    setShowRandomTaskModal(false);
  }

  // Get the list of main tasks
  const mainTasks = tasks.map((task, index) => ({
    label: task.mainTask,
    value: index,
  }));

  function renderTasks() {
    return tasks.map((task, taskIndex) => (
      <li key={taskIndex}>
        <div className="flex items-center justify-between">
          <div
            className={`font-bold ${task.subtasks.length > 0 && task.subtasks.every(sub => sub.completed) ? "line-through" : ""}`}
          >
            {task.mainTask}
          </div>
          <input
            type="checkbox"
            className="ml-4"
            checked={selectedForRandom.includes(taskIndex)}
            onChange={() => toggleTaskSelection(taskIndex)}
          />
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

  function completeRandomTask() {
    // Assuming displayedTask is the task's name or ID you want to complete
    const taskToComplete = tasks.find(task => task.mainTask === displayedTask); // Adjust if you're using an ID or index
  
    if (taskToComplete) {
      // Update the task as completed
      const updatedTasks = tasks.map(task => {
        if (task.mainTask === taskToComplete.mainTask) { // Match by task identifier
          return { ...task, completed: true };
        }
        return task;
      });
  
      setTasks(updatedTasks); // Update state with new tasks
      saveToLocalStorage(updatedTasks); // Save updated tasks to local storage
      closeRandomTaskModal(); // Close the modal after completing the task
    } else {
      alert("Task not found"); // Handle case where task isn't found
    }
  }
  

  return (
    <div className="">
      <header className="flex justify-between items-center py-4 px-8 bg-gray-100">
        <div className="">
          <a href="#" className="text-2xl font-bold text-gray-800">
            Task Randomizer
          </a>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={openMainTaskModal}
            className="bg-green-600 text-white rounded-2xl py-2 px-4"
            aria-label="Add Button"
          >
            Add Main Task
          </button>
          <button
            onClick={openSubtaskModal}
            className="bg-blue-600 text-white rounded-2xl py-2 px-4"
            aria-label="Add Subtask Button"
          >
            Add Subtask
          </button>
          <button 
            onClick={getRandTask}
            className=" bg-purple-500 text-white rounded-2xl py-2 px-4"
            aria-label="Show Random Task Button"
            >
              Show Random Task
            </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 mt-4 px-8">
        {/* COLUMN 1: Task Management */}
        <div className="grid-cols-1">
          <h2 className="text-xl font-semibold">Tasks</h2>
          <ul className="list-none mt-2">{renderTasks()}</ul>
        </div>

        {/* COLUMN 2: Completed Tasks */}
        <div className="grid-cols-1">
          <h2 className="text-xl font-semibold">Completed Tasks</h2>
          <ul className="list-none mt-2">{renderCompletedTasks()}</ul>
        </div>
      </div>

      {/* MODAL FOR MAIN TASK */}
      {showMainTaskModal && (
        <div className="fixed inset-0 w-full bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white w-1/3 p-8 rounded-3xl text-black shadow-lg">
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
                className="bg-green-600 text-white py-2 px-4 rounded-xl mr-2"
              >
                Add Task
              </button>
              <button
                onClick={closeMainTaskModal}
                className="bg-gray-300 py-2 px-4 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FOR SUBTASK */}
      {showSubtaskModal && (
        <div className="fixed inset-0 w-full bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white w-1/3 text-black p-8 rounded-3xl shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Add Subtask</h2>
            <select 
            value={selectedMainTask !== null ? selectedMainTask : ""}
              onChange={(e) => setSelectedMainTask(e.target.value)}
              className="border p-2 w-full mb-4"
            >
              <option value="">Select Main Task</option>
              {mainTasks.map((task) => (
                <option key={task.value} value={task.value}>
                  {task.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              placeholder="Enter subtask"
              className="border text-black p-2 w-full mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={addSubtask}
                className="bg-blue-600 text-white py-2 px-4 rounded-xl mr-2"
              >
                Add Subtask
              </button>
              <button
                onClick={closeSubtaskModal}
                className="bg-gray-300 py-2 px-4 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FOR RANDOM TASK */}
{showRandomTaskModal && (
  <div className="fixed inset-0 w-full bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white text-black w-1/3 p-8 rounded-3xl shadow-lg">
      <h2 className="mb-4 text-lg font-semibold">Random Task</h2>
      <p className="text-center text-xl">{displayedTask}</p>
      <div className="flex justify-between mt-4">
        <button
          onClick={completeRandomTask}
          className="bg-green-500 text-white py-2 px-4 rounded-xl"
        >
          Complete
        </button>
        <button
          onClick={closeRandomTaskModal}
          className="bg-gray-300 text-white py-2 px-4 rounded-xl"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
