import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { loginSchema, type LoginCredentials, type User } from "@shared/schema";
import { Loader2, LogIn } from "lucide-react";

const loginFormSchema = loginSchema.extend({
  rememberMe: z.boolean().optional().default(false),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [rememberMeChecked, setRememberMeChecked] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      serial: "",
      password: "",
      rememberMe: false,
    },
  });

  useEffect(() => {
    // Load remembered credentials if they exist
    const remembered = localStorage.getItem("rememberMeCredentials");
    if (remembered) {
      try {
        const { serial, password } = JSON.parse(remembered);
        form.setValue("serial", serial);
        form.setValue("password", password);
        form.setValue("rememberMe", true);
        setRememberMeChecked(true);
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [form]);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const { rememberMe, ...loginData } = data;
      const response = await apiRequest("POST", "/api/auth/login", loginData);
      return { user: await response.json(), rememberMe };
    },
    onSuccess: ({ user, rememberMe }) => {
      login(user);
      
      // Handle "Remember me" functionality
      if (rememberMe) {
        localStorage.setItem(
          "rememberMeCredentials",
          JSON.stringify({
            serial: form.getValues("serial"),
            password: form.getValues("password"),
          })
        );
      } else {
        localStorage.removeItem("rememberMeCredentials");
      }
      
      toast({
        title: t("auth.welcome"),
        description: t("auth.loginSuccess"),
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || t("auth.invalidCredentials"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8 sm:px-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary">
            <span className="font-heading text-2xl font-bold text-primary-foreground">M</span>
          </div>
          <CardTitle className="text-2xl" data-testid="text-page-title">{t("auth.welcome")}</CardTitle>
          <CardDescription>
            {t("auth.signInHere")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="serial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.serial")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your MTA serial"
                        {...field}
                        data-testid="input-serial"
                      />
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
                    <FormLabel>{t("auth.password")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        {...field}
                        data-testid="input-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          setRememberMeChecked(checked as boolean);
                        }}
                        data-testid="checkbox-remember-me"
                      />
                    </FormControl>
                    <FormLabel className="mb-0 cursor-pointer font-normal">
                      {t("auth.rememberMe")}
                    </FormLabel>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    {t("auth.signIn")}
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {t("auth.dontHaveAccount")}{" "}
                <Link href="/register">
                  <a className="text-primary hover:underline" data-testid="link-register">
                    {t("auth.createHere")}
                  </a>
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
