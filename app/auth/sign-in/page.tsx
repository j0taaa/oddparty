import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SignInPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Access event creation and ticket checkout.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/session/sign-in" method="post" className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" name="email" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" name="password" required />
            </div>
            {searchParams.error ? <p className="text-sm text-red-600">{searchParams.error}</p> : null}
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Don&apos;t have an account? <Link href="/auth/sign-up" className="text-primary underline">Create one</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
