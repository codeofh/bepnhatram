"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Facebook, Mail, X, Loader2, ArrowLeft } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ForgotPasswordForm } from "@/components/Auth/ForgotPasswordForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToastContext } from "@/contexts/ToastContext";
import { useAuthContext } from "@/contexts/AuthContext";

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

// Sign up form schema
const signupSchema = z
  .object({
    name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
    email: z.string().email({ message: "Email không hợp lệ" }),
    password: z
      .string()
      .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState("login");
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [isSignupSubmitting, setIsSignupSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { showSuccess, showError } = useToastContext();
  const { user, register, login, loginWithGoogle, loginWithFacebook, error } =
    useAuthContext();

  // Reset states when user changes or when the dialog opens/closes
  useEffect(() => {
    if (user) {
      setIsLoginSubmitting(false);
      setIsSignupSubmitting(false);
      if (open) {
        onOpenChange(false);
      }
    }
  }, [user, open, onOpenChange]);

  // Reset error when dialog opens/closes or tab changes
  useEffect(() => {
    setAuthError(null);
    setShowForgotPassword(false);
  }, [open, activeTab]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Signup form
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onLoginSubmit(data: LoginFormValues) {
    setIsLoginSubmitting(true);
    setAuthError(null);

    try {
      const result = await login(data.email, data.password);
      if (result) {
        loginForm.reset();
        onOpenChange(false);
      }
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setIsLoginSubmitting(false);
    }
  }

  async function onSignupSubmit(data: SignupFormValues) {
    setIsSignupSubmitting(true);
    setAuthError(null);

    try {
      console.log("Registration attempt with:", data.name, data.email);
      const result = await register(data.name, data.email, data.password);
      console.log("Registration result:", result);

      if (result) {
        showSuccess("Đăng ký tài khoản thành công!");
        signupForm.reset();
        onOpenChange(false);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setAuthError("Đăng ký thất bại. Vui lòng thử lại sau.");
    } finally {
      setIsSignupSubmitting(false);
    }
  }

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    try {
      if (provider === "google") {
        setIsLoginSubmitting(true);
        const result = await loginWithGoogle();
        if (result) {
          onOpenChange(false);
        }
      } else if (provider === "facebook") {
        setIsLoginSubmitting(true);
        const result = await loginWithFacebook();
        if (result) {
          onOpenChange(false);
        }
      }
    } catch (err) {
      console.error(`${provider} login error:`, err);
      setAuthError(`Đăng nhập bằng ${provider} thất bại`);
    } finally {
      setIsLoginSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        // Reset forms and states when closing dialog
        if (!newOpen) {
          loginForm.reset();
          signupForm.reset();
          setAuthError(null);
          setIsLoginSubmitting(false);
          setIsSignupSubmitting(false);
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {showForgotPassword
              ? "Quên mật khẩu"
              : activeTab === "login"
                ? "Đăng nhập"
                : "Đăng ký"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {showForgotPassword
              ? "Nhập email của bạn để lấy lại mật khẩu"
              : activeTab === "login"
                ? "Đăng nhập để đặt món và xem lịch sử đơn hàng"
                : "Tạo tài khoản để đặt món và nhận ưu đãi"}
          </DialogDescription>
        </DialogHeader>

        {(authError || error) && (
          <Alert variant="destructive">
            <AlertDescription>{authError || error}</AlertDescription>
          </Alert>
        )}

        {showForgotPassword ? (
          <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
        ) : (
          <Tabs
            defaultValue="login"
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              setAuthError(null);
              setIsLoginSubmitting(false);
              setIsSignupSubmitting(false);
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Đăng nhập</TabsTrigger>
              <TabsTrigger value="signup">Đăng ký</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" {...field} />
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
                          <Input
                            type="password"
                            placeholder="******"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoginSubmitting}
                    >
                      {isLoginSubmitting ? (
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
                        onClick={() => setShowForgotPassword(true)}
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
                  <span className="bg-background px-2 text-muted-foreground">
                    Hoặc đăng nhập với
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="w-1/2"
                  onClick={() => handleSocialLogin("facebook")}
                  disabled={isLoginSubmitting}
                >
                  <Facebook className="mr-2 h-4 w-4" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  className="w-1/2"
                  onClick={() => handleSocialLogin("google")}
                  disabled={isLoginSubmitting}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Google
                </Button>
              </div>
            </TabsContent>

            <TabsContent
              value="signup"
              className="max-h-[75vh] overflow-y-auto pr-2"
            >
              <Form {...signupForm}>
                <form
                  onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={signupForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ tên</FormLabel>
                        <FormControl>
                          <Input placeholder="Nguyễn Văn A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="******"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Xác nhận mật khẩu</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="******"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSignupSubmitting}
                  >
                    {isSignupSubmitting ? (
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
                  <span className="bg-background px-2 text-muted-foreground">
                    Hoặc ��ăng ký với
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="w-1/2"
                  onClick={() => handleSocialLogin("facebook")}
                  disabled={isSignupSubmitting}
                >
                  <Facebook className="mr-2 h-4 w-4" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  className="w-1/2"
                  onClick={() => handleSocialLogin("google")}
                  disabled={isSignupSubmitting}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Google
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
