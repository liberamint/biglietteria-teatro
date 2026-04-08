import { Container, PageShell, Card, CardHeader, CardTitle, CardContent, Input, Button } from '@/components/ui';
import { login } from './actions';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <PageShell>
      <Container>
        <Card>
          <CardHeader><CardTitle>Accesso amministratore</CardTitle></CardHeader>
          <CardContent>
            <form action={login} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email admin</label>
                <Input name="email" type="email" required />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">Entra</Button>
              {params.error ? <p className="text-sm text-red-600">{params.error}</p> : null}
            </form>
          </CardContent>
        </Card>
      </Container>
    </PageShell>
  );
}
