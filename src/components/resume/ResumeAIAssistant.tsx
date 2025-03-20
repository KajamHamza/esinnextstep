/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ResumeData } from "@/types/resume";
import { resumeService } from "@/services/resumeService";
import ReactMarkdown from 'react-markdown';

interface ResumeAIAssistantProps {
  resume: ResumeData;
  updateResume: (resume: ResumeData) => void;
  isPremium: boolean;
  onAIUsage: () => boolean;
  aiUsageRemaining: number;
}

export const ResumeAIAssistant = ({
                                    resume,
                                    updateResume,
                                    isPremium,
                                    onAIUsage,
                                    aiUsageRemaining
                                  }: ResumeAIAssistantProps) => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Empty prompt",
        description: "Please enter a prompt for the AI assistant",
      });
      return;
    }

    // Check usage limit for free users
    if (!isPremium && !onAIUsage()) {
      return;
    }

    try {
      setIsLoading(true);
      setResponse("");

      console.log("Sending AI request with prompt:", prompt);
      console.log("Resume data being sent:", JSON.stringify(resume, null, 2));
      
      // Debugging the service call
      try {
        const aiResponse = await resumeService.getAIResumeAssistance(resume, prompt);
        console.log("Raw AI response:", aiResponse);
        
        if (aiResponse === undefined || aiResponse === null) {
          throw new Error("AI service returned undefined or null response");
        }
        
        // Format the response if needed
        setResponse(aiResponse);
      } catch (serviceError: any) {
        console.error("Detailed service error:", serviceError);
        throw serviceError;
      }
    } catch (error: any) {
      console.error("AI Assistant error:", error);
      toast({
        variant: "destructive",
        title: "API Error",
        description: error.message || "Failed to get AI assistance. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyAISuggestions = async () => {
    try {
      console.log("Starting to apply AI suggestions");
      console.log("Current response:", response);
      setIsApplying(true);
      
      // Simple heuristic: If the response contains JSON-like content, try to parse it
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                        response.match(/\{[\s\S]*\}/);
      
      console.log("JSON match result:", jsonMatch);
      
      if (jsonMatch) {
        try {
          // Try to parse the JSON from the response
          const jsonContent = jsonMatch[1] || jsonMatch[0];
          console.log("Extracted JSON content:", jsonContent);
          
          const suggestedChanges = JSON.parse(jsonContent);
          console.log("Parsed suggested changes:", suggestedChanges);
          
          // Create a copy of the resume to apply changes
          const updatedResume = { ...resume };
          console.log("Initial resume copy:", updatedResume);
          
          // Apply changes based on sections found in the suggestions
          Object.keys(suggestedChanges).forEach(key => {
            console.log(`Checking key "${key}" in resume`);
            if (key in updatedResume) {
              console.log(`Updating "${key}" with new value:`, suggestedChanges[key]);
              updatedResume[key] = suggestedChanges[key];
            } else {
              console.log(`Key "${key}" not found in resume, skipping`);
            }
          });
          
          console.log("Final updated resume:", updatedResume);
          
          // Update the resume with changes
          updateResume(updatedResume);
          
          toast({
            title: "Success",
            description: "AI suggestions have been applied to your resume.",
          });
        } catch (error) {
          console.error("Error parsing JSON from AI response:", error);
          console.log("Falling back to textual suggestions");
          applyTextualSuggestions();
        }
      } else {
        console.log("No JSON structure detected in response");
        applyTextualSuggestions();
      }
    } catch (error: any) {
      console.error("Error applying suggestions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to apply suggestions: " + (error.message || "Unknown error"),
      });
    } finally {
      setIsApplying(false);
    }
  };
  
  const applyTextualSuggestions = () => {
    console.log("Applying textual suggestions - showing toast to user");
    // For non-JSON responses, show a more detailed toast
    toast({
      title: "Manual review needed",
      description: "The AI suggestions need to be manually applied. Please review the suggestions and update your resume accordingly.",
      duration: 5000,
    });
  };

  return (
      <div className="space-y-4">
        <div className="flex gap-2 items-start mb-4">
          <Lightbulb className="h-5 w-5 text-yellow-500 mt-1" />
          <div>
            <h3 className="text-base font-medium mb-1">AI Resume Assistant</h3>
            <p className="text-sm text-muted-foreground">
              Ask for help with your resume. For example, "Improve my experience section" or "Suggest skills for a frontend developer role".
            </p>
            {!isPremium && (
                <p className="text-xs text-muted-foreground mt-1">
                  Free users have {aiUsageRemaining} AI assistant uses remaining today.
                </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
              placeholder="What would you like help with on your resume?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-20"
          />
          <Button type="submit" disabled={isLoading || !prompt.trim()} className="w-full">
            {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting assistance...
                </>
            ) : (
                "Get AI Assistance"
            )}
          </Button>
        </form>

        {response && (
            <Card className="mt-4">
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">AI Suggestions:</h4>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>
                    {response}
                  </ReactMarkdown>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    disabled={isApplying}
                    onClick={applyAISuggestions}
                >
                    {isApplying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      "Apply Suggestions"
                    )}
                </Button>
              </CardContent>
            </Card>
        )}
      </div>
  );
};