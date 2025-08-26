"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarIcon, Edit2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableCellProps {
  value: unknown;
  onSave: (value: unknown) => void;
  type?: "text" | "number" | "date" | "select" | "textarea" | "status" | "apartment" | "apartmentNumber" | "occupancy" | "propertyType" | "readiness";
  options?: { value: string; label: string }[];
  properties?: Array<{ id: string; apartmentNumber: string; location: string }>;
}

export function EditableCell({
  value,
  onSave,
  type = "text",
  options = [],
  properties = []
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string | number | Date | undefined>(
    typeof value === 'string' || typeof value === 'number' || value instanceof Date ? value : undefined
  );
  const [tempDate, setTempDate] = useState<Date | undefined>(
    value instanceof Date ? value : undefined
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    let finalValue = editValue;
    
    if (type === "date" && tempDate) {
      finalValue = tempDate;
    }
    
    onSave(finalValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(
      typeof value === 'string' || typeof value === 'number' || value instanceof Date ? value : undefined
    );
    setTempDate(value instanceof Date ? value : undefined);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const renderEditInput = () => {
    switch (type) {
      case "textarea":
        return (
          <Textarea
            ref={textareaRef}
            value={typeof editValue === 'string' ? editValue : ""}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[80px] w-full"
            placeholder="Введите текст..."
          />
        );
      
      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !tempDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {tempDate ? format(tempDate, "PPP") : <span>Выберите дату</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={tempDate}
                onSelect={setTempDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      
      case "select":
        return (
          <Select value={typeof editValue === 'string' ? editValue : ""} onValueChange={setEditValue}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Выберите значение" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case "occupancy":
        return (
          <Select value={typeof editValue === 'string' ? editValue : ""} onValueChange={setEditValue}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Выберите статус" />
            </SelectTrigger>
            <SelectContent>
              {/* Use provided options if any; otherwise default to occupancy statuses */}
              {(options.length ? options : [
                { value: "свободна", label: "Свободна" },
                { value: "занята", label: "Занята" },
              ]).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "propertyType":
        return (
          <Select value={typeof editValue === 'string' ? editValue : ""} onValueChange={setEditValue}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Выберите тип" />
            </SelectTrigger>
            <SelectContent>
              {(options.length ? options : [
                { value: "аренда", label: "Аренда" },
                { value: "продажа", label: "Продажа" },
              ]).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "readiness":
        return (
          <Select value={typeof editValue === 'string' ? editValue : ""} onValueChange={setEditValue}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Выберите готовность" />
            </SelectTrigger>
            <SelectContent>
              {(options.length ? options : [
                { value: "меблированная", label: "Меблированная" },
                { value: "немеблированная", label: "Немеблированная" },
              ]).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case "status":
        return (
          <Select value={typeof editValue === 'string' ? editValue : ""} onValueChange={setEditValue}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Выберите статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Текущий</SelectItem>
              <SelectItem value="past">Прошлый</SelectItem>
              <SelectItem value="future">Будущий</SelectItem>
              <SelectItem value="upcoming">Скоро</SelectItem>
            </SelectContent>
          </Select>
        );
      
      case "apartment":
        return (
          <Select value={typeof editValue === 'string' ? editValue : ""} onValueChange={setEditValue}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Выберите квартиру" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  #{property.apartmentNumber} - {property.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case "number":
        return (
          <Input
            ref={inputRef}
            type="number"
            value={typeof editValue === 'string' || typeof editValue === 'number' ? String(editValue) : ""}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full"
            placeholder="Введите число..."
          />
        );
      
      case "apartmentNumber":
        return (
          <Input
            ref={inputRef}
            type="number"
            value={typeof editValue === 'string' || typeof editValue === 'number' ? String(editValue) : ""}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full"
            placeholder="Введите номер квартиры..."
          />
        );
      
      default:
        return (
          <Input
            ref={inputRef}
            value={typeof editValue === 'string' ? editValue : ""}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full"
            placeholder="Введите текст..."
          />
        );
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        {renderEditInput()}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            className="h-8 w-8 p-0"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  const renderDisplayValue = () => {
    if (type === "date" && value instanceof Date) {
      return format(value, "dd/MM/yyyy");
    }
    
    if (type === "status") {
      const getStatusDisplay = (status: string) => {
        switch (status) {
          case "current":
            return { variant: "default" as const, text: "Текущий", className: "bg-green-100 text-green-800 hover:bg-green-100" };
          case "past":
            return { variant: "secondary" as const, text: "Прошлый", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" };
          case "future":
            return { variant: "outline" as const, text: "Будущий", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" };
          case "upcoming":
            return { variant: "outline" as const, text: "Скоро", className: "bg-orange-100 text-orange-800 hover:bg-orange-100" };
          default:
            return { variant: "secondary" as const, text: "Неизвестно", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" };
        }
      };
      
      const statusDisplay = getStatusDisplay(typeof value === 'string' ? value : '');
      return (
        <Badge variant={statusDisplay.variant} className={statusDisplay.className}>
          {statusDisplay.text}
        </Badge>
      );
    }
    
    if (type === "occupancy") {
      const occupancy = typeof value === 'string' ? value : '';
      const isVacant = occupancy === "свободна";
      const className = isVacant
        ? "bg-green-50 text-green-700 hover:bg-green-50"
        : "bg-orange-50 text-orange-700 hover:bg-orange-50";
      // Prefer provided option label if available (allows context-aware labels like "Продана")
      const matchedOption = options.find(opt => opt.value === occupancy);
      const text = matchedOption
        ? matchedOption.label
        : occupancy === "занята" ? "Занята" : occupancy === "свободна" ? "Свободна" : "-";
      return (
        <Badge variant="outline" className={className}>
          {text}
        </Badge>
      );
    }
    
    if (type === "select") {
      if (!value) return <span className="text-muted-foreground text-sm">-</span>;
      
      const option = options.find(opt => opt.value === value);
      if (option) {
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            {option.label}
          </Badge>
        );
      }
      return value ? String(value) : <span className="text-muted-foreground text-sm">-</span>;
    }
    
    if (type === "apartment") {
      if (!value) return <span className="text-muted-foreground text-sm">-</span>;
      
      const property = properties.find(p => p.id === value);
      if (property) {
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              #{property.apartmentNumber}
            </Badge>
          </div>
        );
      }
      return value ? String(value) : <span className="text-muted-foreground text-sm">-</span>;
    }
    
    if (type === "apartmentNumber") {
      if (value === undefined || value === null || value === "") {
        return <span className="text-muted-foreground text-sm">-</span>;
      }
      return (
        <Badge variant="outline" className="font-mono">
          #{String(value)}
        </Badge>
      );
    }
    
    if (type === "propertyType") {
      const propType = typeof value === 'string' ? value : '';
      const isRent = propType === "аренда";
      const className = isRent
        ? "bg-amber-50 text-amber-700 hover:bg-amber-50"
        : "bg-slate-50 text-slate-700 hover:bg-slate-50";
      const text = propType === "аренда" ? "Аренда" : propType === "продажа" ? "Продажа" : "-";
      return (
        <Badge variant="outline" className={className}>
          {text}
        </Badge>
      );
    }

    if (type === "readiness") {
      const readiness = typeof value === 'string' ? value : '';
      // Render readiness as plain text without badge styling
      return <span>{readiness === "меблированная" ? "Меблированная" : readiness === "немеблированная" ? "Немеблированная" : "-"}</span>;
    }

    if (type === "textarea") {
      return value ? (
        <div className="max-w-[200px]">
          <div className="text-muted-foreground truncate text-sm" title={String(value)}>
            {String(value)}
          </div>
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      );
    }
    
    return value ? String(value) : <span className="text-muted-foreground text-sm">-</span>;
  };

  return (
    <div className="group flex items-center gap-2">
      <div className="flex-1">{renderDisplayValue()}</div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
