"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@lib/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@lib/components/ui/form";
import { Input } from "@lib/components/ui/input";
import { Button } from "@lib/components/ui/button";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import { signUpSchema } from "schema/userAuthenticationSchema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@lib/auth-client";

function page() {
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (userData: any) => {
    const { email, password, name } = userData;
    const { data, error } = await authClient.signUp.email(
      {
        email, // user email address
        password, // user password -> min 8 characters by default
        name, // user display name
        callbackURL: "/sign-in", // A URL to redirect to after the user verifies their email (optional)
      },
      {
        onRequest: () => {
          //show loading
          console.log("Loading...");
        },
        onSuccess: () => {
          //redirect to the dashboard or sign in page
          console.log("Signup successful");
        },
        onError: () => {
          console.log("Error while signing up");
        },
      }
    );
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-slate-800/85">
      <Card className="w-full max-w-md mx-auto mt-16 rounded-2xl shadow-xl border border-border bg-background">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold">Sign Up</CardTitle>
          <CardDescription className="text-muted-foreground">
            Create your account to start playing
          </CardDescription>
        </CardHeader>

        <CardContent className="mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your username"
                        className="px-4 py-2 rounded-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                    <FormControl>
                      <Input
                        // type="email"
                        placeholder="Enter your email"
                        className="px-4 py-2 rounded-lg"
                        {...field}
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
                    <FormLabel className="text-sm font-medium">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        className="px-4 py-2 rounded-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full py-2 text-base font-medium rounded-lg"
              >
                Create Account
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-2 mt-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?
          </p>
          <Link
            href="/sign-in"
            className="text-sm font-medium text-primary hover:underline"
          >
            Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default page;
