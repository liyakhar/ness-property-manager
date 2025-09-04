"use client";

import * as React from "react";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface UpdateItem {
  id: number;
  name: string;
  update: string;
  date: Date;
}

interface AddUpdateDialogProps {
  onAddUpdate: (update: Omit<UpdateItem, "id">) => void;
}

export const AddUpdateDialog: React.FC<AddUpdateDialogProps> = ({ onAddUpdate }) => {
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    update: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.update.trim()) {
      return;
    }

    onAddUpdate({
      name: formData.name.trim(),
      update: formData.update.trim(),
      date: new Date(formData.date),
    });

    setFormData({
      name: "",
      update: "",
      date: new Date().toISOString().split("T")[0],
    });
    setOpen(false);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Добавить обновление
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-[425px]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Добавить обновление</DialogTitle>
          <DialogDescription>Добавьте новое обновление в систему. Заполните все поля.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Имя
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="col-span-3"
                  placeholder="Введите имя"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="update" className="text-right">
                  Обновление
                </Label>
                <Textarea
                  id="update"
                  value={formData.update}
                  onChange={(e) => handleInputChange("update", e.target.value)}
                  className="col-span-3"
                  placeholder="Опишите обновление"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Дата
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter className="flex-shrink-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Отмена
              </Button>
              <Button type="submit">Добавить</Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
