import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, Facebook, Loader2 } from "lucide-react";
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

const loginSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const {
    login,
    error: authError,
    loading,
    loginWithGoogle,
    loginWithFacebook,
  } = useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSocialSubmitting, setIsSocialSubmitting] = useState<string | null>(
    null,
  );

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setError(null);
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại");
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
        <h1 className="text-2xl font-bold">{siteConfig.name}</h1>
        <p className="mt-2 text-gray-600">Đăng nhập vào trang quản trị</p>
      </div>

      {(error || authError) && (
        <Alert variant="destructive">
          <AlertDescription>{error || authError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
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
            control={form.control}
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

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || loading || isSocialSubmitting !== null}
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
          disabled={isSubmitting || loading || isSocialSubmitting !== null}
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
          disabled={isSubmitting || loading || isSocialSubmitting !== null}
        >
          {isSocialSubmitting === "google" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Mail className="mr-2 h-4 w-4" />
          )}
          Google
        </Button>
      </div>
    </div>
  );
}
