'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const addColumnSchema = z.object({
  id: z.string().min(1, 'ID колонки обязателен'),
  header: z.string().min(1, 'Заголовок колонки обязателен'),
  type: z.enum(['text', 'number', 'date', 'select', 'boolean']),
});

type AddColumnFormData = z.infer<typeof addColumnSchema>;

interface AddColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddColumn: (column: { id: string; header: string; type: string }) => void;
}

export function AddColumnDialog({ open, onOpenChange, onAddColumn }: AddColumnDialogProps) {
  const form = useForm<AddColumnFormData>({
    resolver: zodResolver(addColumnSchema),
    defaultValues: {
      id: '',
      header: '',
      type: 'text',
    },
  });

  const onSubmit = async (data: AddColumnFormData) => {
    try {
      onAddColumn(data);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Не удалось добавить колонку:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Добавить новую колонку</DialogTitle>
          <DialogDescription>
            Создайте новую колонку для отображения дополнительной информации в таблице.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID колонки</FormLabel>
                  <FormControl>
                    <Input placeholder="полеКолонки" {...field} className="font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="header"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Заголовок колонки</FormLabel>
                  <FormControl>
                    <Input placeholder="Название колонки" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип данных</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип данных" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="text">Текст</SelectItem>
                      <SelectItem value="number">Число</SelectItem>
                      <SelectItem value="date">Дата</SelectItem>
                      <SelectItem value="select">Выбор</SelectItem>
                      <SelectItem value="boolean">Да/Нет</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Отмена
              </Button>
              <Button type="submit">Добавить колонку</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
