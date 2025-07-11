import { useState, useEffect } from "react";
import { X, Plus, Check, Trash2, Edit3, Save } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const ToDoModal = ({ onClose }) => {
  const { authUser } = useAuthStore();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  // Get user-specific localStorage key
  const getStorageKey = () => `todos_${authUser?._id || 'guest'}`;

  // Load todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem(getStorageKey());
    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch (error) {
        console.error("Error parsing todos from localStorage:", error);
        setTodos([]);
      }
    }
  }, [authUser]);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem(getStorageKey(), JSON.stringify(todos));
  }, [todos, authUser]);

  const addTodo = () => {
    if (!newTodo.trim()) {
      toast.error("Please enter a todo item");
      return;
    }

    const todo = {
      id: Date.now(),
      text: newTodo.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTodos([...todos, todo]);
    setNewTodo("");
    toast.success("Todo added!");
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
    toast.success("Todo deleted!");
  };

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  const saveEdit = () => {
    if (!editingText.trim()) {
      toast.error("Todo cannot be empty");
      return;
    }

    setTodos(todos.map(todo => 
      todo.id === editingId ? { ...todo, text: editingText.trim() } : todo
    ));
    setEditingId(null);
    setEditingText("");
    toast.success("Todo updated!");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <div>
            <h2 className="text-lg font-semibold">My ToDo List</h2>
            <p className="text-sm text-base-content/60">
              {completedCount} of {totalCount} completed
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-base-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Todo */}
        <div className="p-4 border-b border-base-300">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              className="input input-bordered input-sm flex-1"
              placeholder="Add a new todo..."
            />
            <button 
              onClick={addTodo}
              className="btn btn-primary btn-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Todo List */}
        <div className="flex-1 overflow-y-auto p-4">
          {todos.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              <div className="text-4xl mb-2">📝</div>
              <p>No todos yet!</p>
              <p className="text-sm">Add your first todo above</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todos.map((todo) => (
                <div 
                  key={todo.id} 
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    todo.completed 
                      ? 'bg-success/10 border-success/20' 
                      : 'bg-base-200 border-base-300'
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      todo.completed
                        ? 'bg-success border-success text-success-content'
                        : 'border-base-content/30 hover:border-primary'
                    }`}
                  >
                    {todo.completed && <Check className="w-3 h-3" />}
                  </button>

                  {/* Todo Text */}
                  <div className="flex-1 min-w-0">
                    {editingId === todo.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          className="input input-bordered input-xs flex-1"
                          autoFocus
                        />
                        <button 
                          onClick={saveEdit}
                          className="btn btn-success btn-xs"
                        >
                          <Save className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={cancelEdit}
                          className="btn btn-ghost btn-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <p className={`text-sm ${
                        todo.completed 
                          ? 'line-through text-base-content/60' 
                          : 'text-base-content'
                      }`}>
                        {todo.text}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {editingId !== todo.id && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditing(todo)}
                        className="btn btn-ghost btn-xs"
                        disabled={todo.completed}
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {todos.length > 0 && (
          <div className="p-4 border-t border-base-300">
            <div className="flex justify-between text-sm text-base-content/60">
              <span>{todos.filter(t => !t.completed).length} remaining</span>
              <span>{completedCount} completed</span>
            </div>
            {totalCount > 0 && (
              <div className="w-full bg-base-300 rounded-full h-2 mt-2">
                <div 
                  className="bg-success h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                ></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToDoModal;