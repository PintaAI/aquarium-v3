import { Card, CardContent } from "@/components/ui/card";

interface CourseBodyProps {
  htmlDescription: string | null;
}

export function CourseBody({ htmlDescription }: CourseBodyProps) {
  if (!htmlDescription) return null;

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 border border-border bg-card">
      <CardContent className="pt-6">
        <div 
          className="prose prose-headings:font-title font-default mt-4 dark:prose-invert focus:outline-none"
          dangerouslySetInnerHTML={{ __html: htmlDescription }} 
        />
      </CardContent>
    </Card>
  );
}
