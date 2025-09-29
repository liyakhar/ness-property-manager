'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Textarea } from '@/components/ui/textarea';

import { type AddPropertyFormData, addPropertySchema } from './schema';

interface AddPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProperty: (property: AddPropertyFormData) => Promise<void>;
}

export function AddPropertyDialog({ open, onOpenChange, onAddProperty }: AddPropertyDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AddPropertyFormData>({
    resolver: zodResolver(addPropertySchema),
    defaultValues: {
      apartmentNumber: undefined,
      location: '',
      rooms: 1,
      readinessStatus: 'немеблированная',
      propertyType: 'аренда',
      occupancyStatus: 'свободна',
      apartmentContents: '',
      urgentMatter: '',
      urgentMatterResolved: false,
    },
  });

  const onSubmit = async (data: AddPropertyFormData) => {
    setIsLoading(true);
    try {
      await onAddProperty(data);
      toast.success('Недвижимость успешно добавлена');
      form.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error adding property:', errorMessage);
      toast.error('Не удалось добавить недвижимость');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-[425px]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Добавить Новую Недвижимость</DialogTitle>
          <DialogDescription>
            Добавьте новую недвижимость в ваш портфель. Заполните детали ниже.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="apartmentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Номер Квартиры</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="101, 2A, 3B, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Расположение</FormLabel>
                    <FormControl>
                      <Input placeholder="Центральный район, 1 этаж" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Количество Комнат</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        placeholder="2"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="readinessStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Статус Готовности</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите статус" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="меблированная">Меблированная</SelectItem>
                        <SelectItem value="немеблированная">Немеблированная</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тип Недвижимости</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите тип" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="аренда">Для Аренды</SelectItem>
                        <SelectItem value="продажа">Для Продажи</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="occupancyStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Статус Заселения</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите статус" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="занята">Занята</SelectItem>
                        <SelectItem value="свободна">Свободна</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apartmentContents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>В квартире есть (Необязательно)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Опишите что есть в квартире (мебель, техника, и т.д.)..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="urgentMatter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Срочные Вопросы (Необязательно)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Любые срочные вопросы или необходимый ремонт..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="urgentMatterResolved"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Проблема уже решена</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter className="flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Добавление...
                    </>
                  ) : (
                    'Добавить Недвижимость'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
