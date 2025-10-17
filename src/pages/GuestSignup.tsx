import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useValidateToken, useSignupWithToken } from '@/hooks/useInvitations';
import { guestSignupSchema, GuestSignupInput } from '@/lib/gallery-types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

const GuestSignup = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { data: tokenData, isLoading, error } = useValidateToken(token);
  const signupWithToken = useSignupWithToken();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<GuestSignupInput>({
    resolver: zodResolver(guestSignupSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: GuestSignupInput) => {
    if (!token || !tokenData) return;

    setIsSubmitting(true);
    try {
      await signupWithToken.mutateAsync({
        token,
        password: data.password,
        tokenData,
      });
      setTimeout(() => navigate('/galleries'), 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Guest Account</CardTitle>
          <CardDescription>Complete your signup to access galleries</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          ) : tokenData ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input value={tokenData.email} readOnly className="mt-1.5" />
                </div>

                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <Input value={tokenData.full_name} readOnly className="mt-1.5" />
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter password" {...field} />
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
                      <FormLabel>Confirm Password *</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </Form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestSignup;
