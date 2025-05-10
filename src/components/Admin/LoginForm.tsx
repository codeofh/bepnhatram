import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Lock,
  Mail,
  Facebook,
  Loader2,
  User as UserIcon,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { siteConfig } from "@/config/siteConfig";
import { useAuthContext } from "@/contexts/AuthContext";
import { User } from "firebase/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteSettings } from "@/lib/firebaseSettings";

const loginSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
    email: z.string().email({ message: "Email không hợp lệ" }),
    password: z
      .string()
      .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

interface LoginFormProps {
  siteSettings?: SiteSettings;
}

export function LoginForm({ siteSettings = siteConfig }: LoginFormProps) {
  const {
    login,
    register,
    resetPassword,
    error: authError,
    loading,
    loginWithGoogle,
    loginWithFacebook,
  } = useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSocialSubmitting, setIsSocialSubmitting] = useState<string | null>(
    null,
  );
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const forgotPasswordForm = useForm<{ email: string }>({
    resolver: zodResolver(
      z.object({
        email: z.string().email({ message: "Email không hợp lệ" }),
      }),
    ),
    defaultValues: {
      email: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onLoginSubmit(data: LoginFormValues) {
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onForgotPasswordSubmit(data: { email: string }) {
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      const result = await resetPassword(data.email);
      if (result) {
        setSuccessMessage(
          `Đã gửi email đặt lại mật khẩu đến ${data.email}. Vui lòng kiểm tra hộp thư của bạn.`,
        );
        forgotPasswordForm.reset();
      } else {
        setError("Không thể g��i email đặt lại mật khẩu");
      }
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi đặt lại mật khẩu");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onRegisterSubmit(data: RegisterFormValues) {
    setError(null);
    setIsSubmitting(true);
    try {
      await register(data.name, data.email, data.password);
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    setError(null);
    setIsSocialSubmitting(provider);

    try {
      let result: User | null = null;

      if (provider === "google" && loginWithGoogle) {
        result = await loginWithGoogle();
      } else if (provider === "facebook" && loginWithFacebook) {
        result = await loginWithFacebook();
      }

      if (!result) {
        setError(`Đăng nhập bằng ${provider} thất bại`);
      }
    } catch (err: any) {
      console.error(`${provider} login error:`, err);
      setError(
        `Đăng nhập bằng ${provider} thất bại: ${err.message || "Lỗi không xác định"}`,
      );
    } finally {
      setIsSocialSubmitting(null);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {siteSettings.name}
        </h1>
        <p className="mt-2 text-gray-600">Trang quản trị</p>
      </div>

      {(error || authError) && (
        <Alert variant="destructive">
          <AlertDescription>{error || authError}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {showForgotPassword ? (
        <div className="mt-6 space-y-6">
          <h2 className="text-lg font-medium">Quên mật khẩu</h2>
          <p className="text-sm text-gray-600">
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu
          </p>

          <Form {...forgotPasswordForm}>
            <form
              onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)}
              className="space-y-6"
            >
              <FormField
                control={forgotPasswordForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="admin@example.com"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    "Gửi liên kết đặt lại"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại đăng nhập
                </Button>
              </div>
            </form>
          </Form>
        </div>
      ) : (
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Đăng nhập</TabsTrigger>
            <TabsTrigger value="register">Đăng ký</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-6">
            <Form {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="admin@example.com"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type="password"
                            placeholder="******"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      isSubmitting || loading || isSocialSubmitting !== null
                    }
                  >
                    {isSubmitting || loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang đăng nhập...
                      </>
                    ) : (
                      "Đăng nhập"
                    )}
                  </Button>

                  <div className="text-center">
                    <Button
                      variant="link"
                      className="text-sm text-blue-600 p-0 h-auto"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      type="button"
                    >
                      Quên mật khẩu?
                    </Button>
                  </div>
                </div>
              </form>
            </Form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  Hoặc đăng nhập với
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="w-1/2"
                onClick={() => handleSocialLogin("facebook")}
                disabled={
                  isSubmitting || loading || isSocialSubmitting !== null
                }
              >
                {isSocialSubmitting === "facebook" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Facebook className="mr-2 h-4 w-4" />
                )}
                Facebook
              </Button>
              <Button
                variant="outline"
                className="w-1/2"
                onClick={() => handleSocialLogin("google")}
                disabled={
                  isSubmitting || loading || isSocialSubmitting !== null
                }
              >
                {isSocialSubmitting === "google" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Google
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="register" className="mt-6">
            <Form {...registerForm}>
              <form
                onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ tên</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Nguyễn Văn A"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="admin@example.com"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type="password"
                            placeholder="******"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xác nhận mật khẩu</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type="password"
                            placeholder="******"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    isSubmitting || loading || isSocialSubmitting !== null
                  }
                >
                  {isSubmitting || loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang đăng ký...
                    </>
                  ) : (
                    "Đăng ký"
                  )}
                </Button>
              </form>
            </Form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  Hoặc đăng ký với
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="w-1/2"
                onClick={() => handleSocialLogin("facebook")}
                disabled={
                  isSubmitting || loading || isSocialSubmitting !== null
                }
              >
                {isSocialSubmitting === "facebook" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Facebook className="mr-2 h-4 w-4" />
                )}
                Facebook
              </Button>
              <Button
                variant="outline"
                className="w-1/2"
                onClick={() => handleSocialLogin("google")}
                disabled={
                  isSubmitting || loading || isSocialSubmitting !== null
                }
              >
                {isSocialSubmitting === "google" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Google
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
