import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, Loader2, ExternalLink } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { SliderItem } from "@/hooks/useSliderManagement";

const sliderSchema = z.object({
  title: z.string().min(1, { message: "Tiêu đề không được trống" }),
  description: z.string(),
  image: z.string().min(1, { message: "URL hình ảnh không được trống" }),
  cta: z.string().min(1, { message: "Nội dung nút không được trống" }),
  ctaLink: z.string().optional(),
  isActive: z.boolean().default(true),
});

type SliderFormValues = z.infer<typeof sliderSchema>;

interface SliderFormProps {
  initialData?: SliderItem;
  onSubmit: (data: SliderFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function SliderForm({
  initialData,
  onSubmit,
  isSubmitting,
}: SliderFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || null,
  );

  const form = useForm<SliderFormValues>({
    resolver: zodResolver(sliderSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      image: initialData?.image || "",
      cta: initialData?.cta || "Xem thêm",
      ctaLink: initialData?.ctaLink || "/menu",
      isActive: initialData?.isActive ?? true,
    },
  });

  const handleSubmit = async (data: SliderFormValues) => {
    await onSubmit(data);
  };

  const handleImagePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setImagePreview(value);
    form.setValue("image", value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tiêu đề slider" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả ngắn cho slider"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="cta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nút kêu gọi</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ví dụ: Đặt ngay, Xem thêm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Văn bản hiển thị trên nút kêu gọi hành động
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ctaLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Liên kết nút</FormLabel>
                    <FormControl>
                      <Input placeholder="/menu" {...field} />
                    </FormControl>
                    <FormDescription>
                      Đường dẫn khi nhấn vào nút, ví dụ: /menu
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="displayOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thứ tự hiển thị</FormLabel>
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
                    <FormDescription>
                      Số nhỏ hơn sẽ hiển thị trước (ví dụ: 0 hiển thị đầu tiên)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 h-full">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Trạng thái hiển thị
                      </FormLabel>
                      <FormDescription>
                        Bật để hiển thị slider này trên trang chủ
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div>
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL hình ảnh</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <Input
                            placeholder="https://example.com/image.jpg"
                            {...field}
                            onChange={handleImagePreview}
                          />
                        </div>
                        <Button
                          type="button"
                          className="flex items-center justify-center"
                          variant="outline"
                          disabled
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </Button>
                      </div>

                      {imagePreview && (
                        <div className="mt-4">
                          <p className="mb-2 text-sm text-gray-500">
                            Xem trước:
                          </p>
                          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="h-full w-full object-cover"
                              onError={() => {
                                // Handle image loading error
                                setImagePreview(null);
                              }}
                            />
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            Hình ảnh tỷ lệ 16:9 sẽ hiển thị tốt nhất. Khuyến
                            nghị kích thước tối thiểu 1280x720px.
                          </p>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
              "Thêm slider"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
