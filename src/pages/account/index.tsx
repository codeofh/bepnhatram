import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Calendar, 
  Save, 
  Loader2, 
  ShoppingBag, 
  Settings, 
  ChevronRight
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Layout } from "@/components/Layout/Layout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToastContext } from "@/contexts/ToastContext";
import { siteConfig } from "@/config/siteConfig";

// Form schema for profile information
const profileFormSchema = z.object({
  displayName: z.string().min(2, {
    message: "Tên hiển thị phải có ít nhất 2 ký tự.",
  }),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function AccountPage() {
  const router = useRouter();
  const { user, loading } = useAuthContext();
  const { showSuccess, showInfo } = useToastContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Setup form with default values from user
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      phone: "",
    },
  });

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
    if (!loading && !user) {
      router.push('/');
    } else if (user) {
      // Update form values with user data
      form.reset({
        displayName: user.displayName || "",
        phone: user.phoneNumber || "",
      });
    }
  }, [user, loading, router, form]);

  // Get user initials for avatar fallback
  const getUserInitials = (): string => {
    if (!user || !user.displayName) return '?';
    
    const nameParts = user.displayName.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    
    // This would update the user profile in a real application
    // For now, we'll just show a success message
    setTimeout(() => {
      showInfo("Tính năng đang được phát triển. Thông tin tài khoản sẽ được cập nhật sau.");
      setIsSubmitting(false);
    }, 1000);
  };

  if (loading || !isClient) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>Tài khoản của tôi - {siteConfig.name}</title>
        <meta name="description" content="Quản lý thông tin tài khoản cá nhân" />
      </Head>

      <div className="container py-8 px-4 md:py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Account navigation sidebar */}
          <aside className="w-full md:w-64">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 bg-green-600 text-white">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{user.displayName || 'Người dùng'}</CardTitle>
                    <CardDescription className="text-sm truncate">{user.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  <Link href="/account" className="flex items-center px-4 py-2 bg-gray-100">
                    <User className="mr-3 h-4 w-4" />
                    <span className="text-sm font-medium">Thông tin tài khoản</span>
                  </Link>
                  <Link href="/account/orders" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                    <ShoppingBag className="mr-3 h-4 w-4" />
                    <span className="text-sm font-medium">��ơn hàng của tôi</span>
                  </Link>
                  <Link href="/account/settings" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                    <Settings className="mr-3 h-4 w-4" />
                    <span className="text-sm font-medium">Cài đặt tài khoản</span>
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main content area */}
          <div className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin tài khoản</CardTitle>
                <CardDescription>
                  Xem và cập nhật thông tin cá nhân của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Họ và tên</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input className="pl-10" placeholder="Nguyễn Văn A" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <FormLabel>Email</FormLabel>
                        <div className="relative mt-1.5">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            className="pl-10" 
                            value={user?.email || ''} 
                            disabled 
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Email không thể thay đổi</p>
                      </div>

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số điện thoại</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input className="pl-10" placeholder="0912345678" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <ShieldCheck className="h-5 w-5 text-green-500" />
                        <h3 className="font-medium">Tài khoản của bạn</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm">Xác thực email</span>
                          </div>
                          <span className="text-sm text-green-600 font-medium">Đã xác thực</span>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm">Ngày tham gia</span>
                          </div>
                          <span className="text-sm text-gray-600">{user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('vi-VN') : 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Lưu thay đổi
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Đơn hàng gần đây</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <ShoppingBag className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Bạn chưa có đơn hàng nào</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="ghost" asChild size="sm">
                    <Link href="/account/orders">
                      Xem tất cả
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Quản lý mật khẩu</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">Thay đổi mật khẩu tài khoản và cài đặt bảo mật bổ sung.</p>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="ghost" asChild size="sm">
                    <Link href="/account/settings">
                      Cài đặt bảo mật
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}