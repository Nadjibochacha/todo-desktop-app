import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import Swal from "sweetalert2";
import { v4 as uuidv4 } from "uuid";
import "./App.css";
import Footer from "./footer";

function App() {
  const [tasks, setTasks] = useState([]);

  // Add Task Function
  const handleAddTask = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Add New Task",
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="Task Title">` +
        `<input id="swal-input2" type="date" class="swal2-input">` + 
        `<input id="swal-input3" type="time" class="swal2-input">`,
      focusConfirm: false,
      preConfirm: () => {
        const title = document.getElementById("swal-input1").value;
        const date = document.getElementById("swal-input2").value;
        const time = document.getElementById("swal-input3").value;
        if (!title || !time || !date) {
          Swal.showValidationMessage("Please enter both title, date and time");
        }
        return { task: title, date, time };
      },
    });

    if (formValues && formValues.task && formValues.time && formValues.date) {
      const newTask = {
        id: uuidv4(),
        task: formValues.task,
        date: formValues.date,
        time: formValues.time,
        status: "pending",
      };
      const updated = [...tasks, newTask];
      setTasks(updated);
      await invoke("save_tasks", { tasks: updated }); 
    }
  };

  // Delete Task
  const handleDelete = async (id) => {
    const updated = tasks.filter((task) => task.id !== id);
    setTasks(updated);
    await invoke("save_tasks", { tasks: updated });
  };

  // Edit Task
  const handleEdit = async (taskToEdit) => {
    const { value: formValues } = await Swal.fire({
      title: "Edit Task",
      html:
        `<input id="swal-input1" class="swal2-input" value="${taskToEdit.task}">` +
        `<input id="swal-input2" type="date" class="swal2-input" value="${taskToEdit.date}">` +
        `<input id="swal-input3" type="time" class="swal2-input" value="${taskToEdit.time}">`,
      focusConfirm: false,
      preConfirm: () => {
        const title = document.getElementById("swal-input1").value;
        const date = document.getElementById("swal-input2").value;
        const time = document.getElementById("swal-input3").value;
        if (!title || !time || !date) {
          Swal.showValidationMessage("Please enter both title, date and time");
        }
        return { task: title, date, time };
      },
    });

    if (formValues && formValues.task && formValues.time && formValues.date) {
      const updated = tasks.map((t) =>
        t.id === taskToEdit.id
          ? { ...t, task: formValues.task, date: formValues.date, time: formValues.time }
          : t
      );
      setTasks(updated);
      await invoke("save_tasks", { tasks: updated });
    }
  };

  // Mark Task as Completed
  const handelCheck = (id) => {
    const updated = tasks.map((task) =>
      task.id === id ? { ...task, status: "completed" } : task
    );
    setTasks(updated);
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const loaded = await invoke("load_tasks");
        setTasks(loaded);
      } catch (err) {
        console.warn("Backend not ready, using default tasks.", err);
      }
    };
    fetchTasks();
  }, []);

  return (
    <>
      <main className="min-h-screen bg-gray-900 text-white p-6">
        <h1 className="text-center text-5xl font-bold mb-6">To-Do List</h1>

        <div className="flex justify-center mb-6">
          <button
            onClick={handleAddTask}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition transform hover:scale-105 shadow-md"
          >
            ➕ Add Task
          </button>
        </div>

        <div className="overflow-x-auto max-w-4xl mx-auto">
          {tasks.length > 0 ? (
            <table className="table-auto w-full border border-gray-700 text-center">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-2 border">Done</th>
                  <th className="p-2 border">Task</th>
                  <th className="p-2 border">Time</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border border-gray-700 hover:bg-gray-800 transition"
                  >
                    <td className="p-2 border">
                      <input
                        type="checkbox"
                        checked={task.status === "completed"}
                        onChange={() => handelCheck(task.id)}
                        className="w-5 h-5"
                      />
                    </td>
                    <td className="p-2 border">{task.task}</td>
                    <td className="p-2 border">
                      {task.date} {task.time}
                    </td>
                    <td className="p-2 border space-x-2">
                      <button
                        onClick={() => handleEdit(task)}
                        className="bg-yellow-500 hover:bg-yellow-400 px-2 py-1 rounded text-sm"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-sm"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-lg mt-6">
              🎉 No tasks today, enjoy your day!
            </p>
          )}
        </div>
        <Footer />
      </main>
    </>
  );
}

export default App;
