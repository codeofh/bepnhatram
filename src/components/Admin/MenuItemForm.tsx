import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Trash2, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MenuItem, SizeOption } from "@/data/menuItems";

const sizeOptionSchema = z.object({
  name: z.string().min(1, { message: "Tên kích thước không được trống" }),
  price: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, { message: "Giá phải là số dương" }),
  ),
});

const menuItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Tên món ăn không được trống" }),
  description: z.string(),
  price: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, { message: "Giá phải là số dương" }),
  ),
  category: z.string().min(1, { message: "Vui lòng chọn danh mục" }),
  rating: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(1).max(5),
  ),
  displayOrder: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().optional(),
  ),
  image: z.string().min(1, { message: "URL hình ảnh không được trống" }),
  sizes: z.array(sizeOptionSchema).optional(),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

interface MenuItemFormProps {
  initialData?: MenuItem;
  onSubmit: (data: MenuItemFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function MenuItemForm({
  initialData,
  onSubmit,
  isSubmitting,
}: MenuItemFormProps) {
  const [sizes, setSizes] = useState<SizeOption[]>(initialData?.sizes || []);

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      id: initialData?.id || "",
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      category: initialData?.category || "",
      rating: initialData?.rating || 4,
      displayOrder: initialData?.displayOrder || 0,
      image: initialData?.image || "",
      sizes: initialData?.sizes || [],
    },
  });

  const handleSubmit = async (data: MenuItemFormValues) => {
    data.sizes = sizes;
    await onSubmit(data);
  };

  const addSize = () => {
    setSizes([...sizes, { name: "", price: 0 }]);
  };

  const removeSize = (index: number) => {
    const newSizes = [...sizes];
    newSizes.splice(index, 1);
    setSizes(newSizes);
  };

  const updateSize = (
    index: number,
    field: keyof SizeOption,
    value: string | number,
  ) => {
    const newSizes = [...sizes];
    if (field === "price") {
      newSizes[index][field] = Number(value);
    } else {
      newSizes[index][field] = value as string;
    }
    setSizes(newSizes);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên món ăn</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập tên món ăn" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giá (VNĐ)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập mô tả món ăn"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Danh mục</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="special">Đặc biệt</SelectItem>
                    <SelectItem value="main">Món chính</SelectItem>
                    <SelectItem value="chicken">Gà ủ muối</SelectItem>
                    <SelectItem value="chicken-feet">Chân gà</SelectItem>
                    <SelectItem value="drinks">Đồ uống</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Đánh giá (1-5)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thứ tự hiển thị</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                  />
                </FormControl>
                <FormDescription>Số nhỏ hiển thị trước</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Hình ảnh</FormLabel>
              <FormControl>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                    />
                  </div>
                  <Button
                    type="button"
                    className="flex items-center justify-center"
                    variant="outline"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Size options section */}
        <div className="border rounded-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Tùy chọn kích thước</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSize}
              className="h-8"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm kích thước
            </Button>
          </div>

          {sizes.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              Chưa có tùy chọn kích thước nào
            </p>
          ) : (
            <div className="space-y-4">
              {sizes.map((size, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center"
                >
                  <div>
                    <FormLabel className={index !== 0 ? "sr-only" : ""}>
                      Tên kích thước
                    </FormLabel>
                    <Input
                      placeholder="Nhỏ, Vừa, Lớn..."
                      value={size.name}
                      onChange={(e) =>
                        updateSize(index, "name", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <FormLabel className={index !== 0 ? "sr-only" : ""}>
                      Giá (VNĐ)
                    </FormLabel>
                    <Input
                      type="number"
                      placeholder="0"
                      value={size.price}
                      onChange={(e) =>
                        updateSize(index, "price", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSize(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="ml-2">Xóa</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? "Đang cập nhật..." : "Đang thêm..."}
              </>
            ) : initialData ? (
              "Cập nhật"
            ) : (
              "Thêm món ăn"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
