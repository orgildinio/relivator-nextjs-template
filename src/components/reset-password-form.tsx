"use client";

import type { z } from "zod";

import { useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";

import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useToast } from "~/hooks/use-toast";
import { showErrorToast } from "~/server/handle-error";
import { checkEmailSchema } from "~/server/validations/auth";

type Inputs = z.infer<typeof checkEmailSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const { isLoaded, signIn } = useSignIn();
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();
  // react-hook-form
  const form = useForm<Inputs>({
    resolver: zodResolver(checkEmailSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: Inputs) {
    if (!isLoaded) {
      return;
    }

    setLoading(true);

    try {
      const firstFactor = await signIn.create({
        strategy: "reset_password_email_code",
        identifier: data.email,
      });

      if (firstFactor.status === "needs_first_factor") {
        router.push("/signin/reset-password/confirm");
        toast({
          title: "Check your email",
          description: "We sent you a 6-digit verification code.",
        });
      }
    } catch (err) {
      showErrorToast(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="rodneymullen180@gmail.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="mt-2" disabled={loading}>
          {loading && (
            <Icons.spinner
              className="mr-2 size-4 animate-spin"
              aria-hidden="true"
            />
          )}
          Continue
          <span className="sr-only">
            Continue to reset password verification
          </span>
        </Button>
      </form>
    </Form>
  );
}
