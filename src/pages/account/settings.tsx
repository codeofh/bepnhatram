import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  User, 
  ShoppingBag, 
  Settings, 
  Shield, 
  Lock, 
  Bell, 
  Eye, 
  EyeOff, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Layout } from "@/components/Layout/Layout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToastContext } from "@/contexts/ToastContext";
import { siteConfig } from "@/config/siteConfig";

// Form schema for password change
const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, {
    message: "Mật khẩu hiện tại phải có ít nhất 6 ký tự.",
  }),
  newPassword: z.string().min(6, {
    message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user, loading } = useAuthContext();
  const { showSuccess, showInfo } = useToastContext();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    promotions: false,
  });

  // Setup form
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Get user initials for avatar fallback
  const getUserInitials = (): string => {
    if (!user || !user.displayName) return '?';
    
    const nameParts = user.displayName.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  const onSubmit = async (data: PasswordFormValues) => {
    setIsSubmitting(true);
    
    // This would update the password in a real application
    // For now, we'll just show a success message
    setTimeout(() => {
      showInfo("Tính năng đang được phát triển. Mật khẩu sẽ được cập nhật sau.");
      form.reset();
      setIsSubmitting(false);
    }, 1000);
  };

  const handleNotificationChange = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    
    showInfo("Tính năng đang được phát triển. Cài đặt thông báo sẽ được lưu sau.");
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
        <title>Cài đặt tài khoản - {siteConfig.name}</title>
        <meta name="description" content="Quản lý cài đặt và bảo mật tài khoản" />
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
                  <Link href="/account" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                    <User className="mr-3 h-4 w-4" />
                    <span className="text-sm font-medium">Thông tin tài khoản</span>
                  </Link>
                  <Link href="/account/orders" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                    <ShoppingBag className="mr-3 h-4 w-4" />
                    <span className="text-sm font-medium">Đơn hàng của tôi</span>
                  </Link>
                  <Link href="/account/settings" className="flex items-center px-4 py-2 bg-gray-100">
                    <Settings className="mr-3 h-4 w-4" />
                    <span className="text-sm font-medium">Cài đặt tài khoản</span>
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main content area */}
          <div className="flex-1 space-y-6">
            {/* Password Change Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-blue-600" />
                  <CardTitle>Đổi mật khẩu</CardTitle>
                </div>
                <CardDescription>
                  Cập nhật mật khẩu đăng nhập của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {user.providerData && user.providerData[0]?.providerId !== 'password' && (
                      <Alert className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Tài khoản liên kết</AlertTitle>
                        <AlertDescription>
                          Bạn đang đăng nhập bằng tài khoản {user.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Facebook'}.
                          B���n không cần đặt mật khẩu cho tài khoản này.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <FormField
                      control={form.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mật khẩu hiện tại</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Nhập mật khẩu hiện tại"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1 h-8 w-8 p-0"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mật khẩu mới</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Nhập mật khẩu mới"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Mật khẩu phải có ít nhất 6 ký tự
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Xác nhận mật khẩu mới"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang cập nhật...
                        </>
                      ) : (
                        "Cập nhật mật khẩu"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <CardTitle>Cài đặt thông báo</CardTitle>
                </div>
                <CardDescription>
                  Quản lý các thông báo bạn nhận được
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Thông báo qua email</label>
                      <p className="text-xs text-gray-500">Nhận thông báo qua địa chỉ email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={() => handleNotificationChange('emailNotifications')}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Cập nhật đơn hàng</label>
                      <p className="text-xs text-gray-500">Nhận thông báo khi đơn hàng có thay đổi trạng thái</p>
                    </div>
                    <Switch
                      checked={notificationSettings.orderUpdates}
                      onCheckedChange={() => handleNotificationChange('orderUpdates')}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Ưu đãi và khuyến mãi</label>
                      <p className="text-xs text-gray-500">Nhận thông tin về ưu đãi và khuyến mãi mới</p>
                    </div>
                    <Switch
                      checked={notificationSettings.promotions}
                      onCheckedChange={() => handleNotificationChange('promotions')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <CardTitle>Bảo mật tài khoản</CardTitle>
                </div>
                <CardDescription>
                  Cài đặt bảo mật bổ sung cho tài khoản của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertTitle className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Tài khoản của bạn đang được bảo vệ
                    </AlertTitle>
                    <AlertDescription>
                      Các tính năng bảo mật nâng cao như xác thực hai yếu tố sẽ được phát triển trong thời gian tới.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}