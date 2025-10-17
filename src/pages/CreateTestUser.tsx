import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateTestUser } from '@/hooks/useCreateTestUser';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const CreateTestUser = () => {
  const { mutate: createUser, isPending } = useCreateTestUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCreateUser = () => {
    createUser(
      {
        email: 'john@johnhaugaard.com',
        password: 'password',
        full_name: 'John Reviewer',
      },
      {
        onSuccess: () => {
          toast({
            title: 'Test user created',
            description: 'You can now log in as john@johnhaugaard.com with password "password"',
          });
          navigate('/login');
        },
        onError: (error) => {
          toast({
            title: 'Error creating user',
            description: error.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Test User</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            This will create a test reviewer account:
            <br />
            <strong>Email:</strong> john@johnhaugaard.com
            <br />
            <strong>Password:</strong> password
          </p>
          <Button onClick={handleCreateUser} disabled={isPending} className="w-full">
            {isPending ? 'Creating...' : 'Create Test User'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTestUser;
