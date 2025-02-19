import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "./styles.css";

export default function FinanceTracker() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    amount: "",
    date: "",
    description: "",
    category: "",
  });
  const [editingId, setEditingId] = useState(null); // Track the ID of the transaction being edited
  const [categories] = useState([
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Others",
  ]);
  const [budgets, setBudgets] = useState({
    Food: 500,
    Transport: 300,
    Shopping: 200,
    Bills: 400,
    Others: 100,
  });

  // Load transactions from localStorage if available
  useEffect(() => {
    const savedTransactions = JSON.parse(localStorage.getItem("transactions"));
    if (savedTransactions) {
      setTransactions(savedTransactions);
    }
  }, []);

  // Save transactions to localStorage when they change
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem("transactions", JSON.stringify(transactions));
    }
  }, [transactions]);

  const totalExpenses = transactions.reduce(
    (acc, t) => acc + parseFloat(t.amount),
    0
  );

  const categoryExpenses = categories.map((cat) => ({
    name: cat,
    value: transactions
      .filter((t) => t.category === cat)
      .reduce((acc, t) => acc + parseFloat(t.amount), 0),
  }));

  const budgetVsActual = categories.map((cat) => ({
    name: cat,
    budget: budgets[cat] || 0,
    actual: transactions
      .filter((t) => t.category === cat)
      .reduce((acc, t) => acc + parseFloat(t.amount), 0),
  }));

  const addTransaction = () => {
    // Basic form validation
    if (!form.amount || !form.date || !form.description || !form.category) {
      alert("All fields are required!");
      return;
    }

    if (editingId !== null) {
      // Edit the transaction
      setTransactions(
        transactions.map((t) => (t.id === editingId ? { ...t, ...form } : t))
      );
      setEditingId(null); // Clear editing state
    } else {
      // Add new transaction
      const newTransaction = {
        id: transactions.length + 1,
        ...form,
      };
      setTransactions([...transactions, newTransaction]);
    }

    // Clear the form
    setForm({
      amount: "",
      date: "",
      description: "",
      category: "",
    });
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const editTransaction = (id) => {
    const transactionToEdit = transactions.find((t) => t.id === id);
    setForm({
      amount: transactionToEdit.amount,
      date: transactionToEdit.date,
      description: transactionToEdit.description,
      category: transactionToEdit.category,
    });
    setEditingId(id); // Set the ID to track the transaction being edited
  };

  return (
    <div className="finance-tracker-container">
      <h1 className="title">Personal Finance Tracker</h1>
      <div className="form-container">
        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button onClick={addTransaction}>
          {editingId ? "Update Transaction" : "Add Transaction"}
        </button>
      </div>

      <div className="summary-section">
        <h2>Total Expenses: ${totalExpenses}</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={categoryExpenses}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>

        <h2>Category Breakdown</h2>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={categoryExpenses}
              dataKey="value"
              nameKey="name"
              outerRadius={150}
              fill="#8884d8"
              label
            >
              {categoryExpenses.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index % 2 === 0 ? "#ff7300" : "#387908"}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        <h2>Budget vs Actual</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={budgetVsActual}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="budget" fill="#ff7300" />
            <Bar dataKey="actual" fill="#387908" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="transaction-list">
        {transactions.map((t) => (
          <div key={t.id} className="transaction-item">
            <span>
              {t.date} - {t.description} - ${t.amount} ({t.category})
            </span>
            <button onClick={() => editTransaction(t.id)}>Edit</button>
            <button onClick={() => deleteTransaction(t.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
