'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import withPageRequiredGuest from '@/services/auth/with-page-required-guest';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from 'recharts';

export function ForgotPasswordPage() {
  return (
    <form className="mx-auto mt-20">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Enter your email</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Reset</Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export default withPageRequiredGuest(ForgotPasswordPage);
