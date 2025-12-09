import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

// Example Type
interface Item {
  _id?: string;
  name: string;
  description: string;
}

// API helper (replace with your real backend URL)
const API_URL = "http://localhost:3000/api/items";

export default function AdminPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState<Item>({ name: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch Items
  const load = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (editingId) {
      await fetch(`${API_URL}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setForm({ name: "", description: "" });
    setEditingId(null);
    load();
  };

  const edit = (item: Item) => {
    setEditingId(item._id || null);
    setForm({ name: item.name, description: item.description });
  };

  const remove = async (id: string) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-slate-800 shadow-xl"
      >
        <h2 className="text-2xl font-bold mb-4">{editingId ? "Edit Item" : "Add Item"}</h2>

        <div className="space-y-4">
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <Button className="w-full" onClick={save}>
            {editingId ? "Update" : "Create"}
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold mb-4">Items</h2>

        {items.map((item) => (
          <Card key={item._id} className="bg-slate-800 text-white rounded-2xl">
            <CardContent className="p-4">
              <h3 className="text-xl font-semibold">{item.name}</h3>
              <p className="opacity-80">{item.description}</p>

              <div className="flex gap-3 mt-3">
                <Button size="sm" onClick={() => edit(item)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(item._id!)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  );
}
