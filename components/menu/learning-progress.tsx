import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function LearningProgress() {
  // Placeholder data - will be replaced with real data later
  const progress = {
    overall: 65,
    vocabulary: 80,
    grammar: 60,
    listening: 55,
    speaking: 45,
  };

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>Learning Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <div className="text-sm font-medium">Overall Progress</div>
            <div className="text-sm text-muted-foreground">{progress.overall}%</div>
          </div>
          <Progress value={progress.overall} className="h-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-2">
              <div className="text-sm font-medium">Vocabulary</div>
              <div className="text-sm text-muted-foreground">{progress.vocabulary}%</div>
            </div>
            <Progress value={progress.vocabulary} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <div className="text-sm font-medium">Grammar</div>
              <div className="text-sm text-muted-foreground">{progress.grammar}%</div>
            </div>
            <Progress value={progress.grammar} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <div className="text-sm font-medium">Listening</div>
              <div className="text-sm text-muted-foreground">{progress.listening}%</div>
            </div>
            <Progress value={progress.listening} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <div className="text-sm font-medium">Speaking</div>
              <div className="text-sm text-muted-foreground">{progress.speaking}%</div>
            </div>
            <Progress value={progress.speaking} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
