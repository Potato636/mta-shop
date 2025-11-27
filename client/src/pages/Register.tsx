import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertUserSchema, type User } from "@shared/schema";
import { Loader2, UserPlus } from "lucide-react";

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      serial: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const { confirmPassword, ...registerData } = data;
      const response = await apiRequest("POST", "/api/auth/register", registerData);
      return response.json();
    },
    onSuccess: (data: User) => {
      // Auto-login after registration
      login(data);
      toast({
        title: t("auth.accountCreated"),
        description: "Your account has been created and you are now logged in.",
      });
      // Redirect to home after a short delay to show the toast
      setTimeout(() => {
        setLocation("/");
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8 sm:px-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary">
            <span className="font-heading text-2xl font-bold text-primary-foreground">M</span>
          </div>
          <CardTitle className="text-2xl" data-testid="text-page-title">{t("auth.createAccount")}</CardTitle>
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
                    <FormLabel>{t("auth.serial")} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your MTA serial"
                        {...field}
                        data-testid="input-serial"
                      />
                    </FormControl>
                    <FormDescription>Your unique MTA client serial number</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.email")} *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="example@email.com"
                        autoComplete="email"
                        {...field}
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.phone")} *</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+55 11 99999-9999"
                        {...field}
                        data-testid="input-phone"
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
                    <FormLabel>{t("auth.password")} *</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter a secure password"
                        autoComplete="new-password"
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
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.confirmPassword")} *</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        {...field}
                        data-testid="input-confirm-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
                data-testid="button-register"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t("auth.createAccount")}
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {t("auth.alreadyHaveAccount")}{" "}
                <Link href="/login">
                  <a className="text-primary hover:underline" data-testid="link-login">
                    {t("auth.signInHere")}
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
