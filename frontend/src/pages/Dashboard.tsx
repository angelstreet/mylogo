import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function Dashboard() {
  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Widget {i + 1}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary text-sm">Dashboard placeholder content.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
